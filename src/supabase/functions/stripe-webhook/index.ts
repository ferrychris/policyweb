// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno&no-check';

const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  // @ts-ignore
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
});

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');

console.log('Stripe Webhook Function Initialized');

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing Stripe signature', {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.text();
    let event;

    // Verify the event came from Stripe
    if (STRIPE_WEBHOOK_SECRET) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      // In development, we may not have a webhook secret
      try {
        event = JSON.parse(body);
        console.warn('Running without webhook signature verification (development only)');
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Setup Supabase client using service role key for admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: { persistSession: false },
      }
    );

    // Handle specific Stripe events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, supabaseAdmin);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object, supabaseAdmin);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object, supabaseAdmin);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabaseAdmin);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabaseAdmin);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error handling webhook event:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Handler for completed checkout sessions
async function handleCheckoutSessionCompleted(session: any, supabase: any) {
  try {
    console.log(`Checkout Session Completed: ${session.id}`);
    
    // Get user ID and package info from metadata
    const { package_id, billing_cycle, supabase_user_id } = session.metadata;
    const userId = supabase_user_id || session.client_reference_id;
    
    if (!userId) {
      console.error('Missing user ID in checkout session');
      return;
    }

    // For subscription mode checkouts, we'll receive a customer.subscription.created event later
    // But we can update our database right away to show the subscription as processing
    if (session.mode === 'subscription' && session.subscription) {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          package_id: package_id ? parseInt(package_id) : null,
          status: 'active',
          stripe_subscription_id: session.subscription,
          billing_cycle: billing_cycle || 'monthly',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error creating subscription record from checkout:', error);
      } else {
        console.log('Subscription record created from checkout');
      }
    }
  } catch (error) {
    console.error('Error processing checkout session completion:', error);
  }
}

// Handler for successful payment intents
async function handlePaymentIntentSucceeded(paymentIntent: any, supabase: any) {
  try {
    console.log(`Payment Intent Succeeded: ${paymentIntent.id}`);
    
    // Get user ID and package info from metadata
    const { package_id, billing_cycle, supabase_user_id } = paymentIntent.metadata;
    
    if (!supabase_user_id || !package_id) {
      console.error('Missing user ID or package ID in metadata');
      return;
    }

    // Determine start and end dates for subscription
    const now = new Date();
    const startDate = now.toISOString();
    let endDate = new Date();
    if (billing_cycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Update or create subscription record
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: supabase_user_id,
        package_id: parseInt(package_id),
        status: 'active',
        payment_id: paymentIntent.id,
        billing_cycle: billing_cycle || 'monthly',
        current_period_start: startDate,
        current_period_end: endDate.toISOString(),
        created_at: startDate,
        updated_at: startDate,
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      console.log('Subscription updated successfully');
    }
  } catch (error) {
    console.error('Error processing payment success:', error);
  }
}

// Handler for failed payment intents
async function handlePaymentIntentFailed(paymentIntent: any, supabase: any) {
  try {
    console.log(`Payment Intent Failed: ${paymentIntent.id}`);
    
    const { supabase_user_id } = paymentIntent.metadata;
    if (!supabase_user_id) {
      console.error('Missing user ID in metadata');
      return;
    }

    // Update subscription status to 'failed'
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', supabase_user_id)
      .eq('payment_id', paymentIntent.id);

    if (error) {
      console.error('Error updating subscription after payment failure:', error);
    }
  } catch (error) {
    console.error('Error processing payment failure:', error);
  }
}

// Handler for subscription updates
async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  try {
    console.log(`Subscription Updated: ${subscription.id}`);
    
    // Get metadata from the subscription
    const { supabase_user_id, package_id } = subscription.metadata;
    if (!supabase_user_id) {
      // Try to get the customer and then check if we have the Supabase user ID in customer metadata
      const customer = await stripe.customers.retrieve(subscription.customer);
      if (customer && 'metadata' in customer && customer.metadata.supabase_user_id) {
        const user_id = customer.metadata.supabase_user_id;
        
        // Update subscription in our database
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: user_id,
            package_id: package_id ? parseInt(package_id) : null,
            status: subscription.status,
            stripe_subscription_id: subscription.id,
            billing_cycle: subscription.items.data[0]?.plan?.interval || 'monthly',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (error) {
          console.error('Error updating subscription record:', error);
        }
      } else {
        console.error('Unable to find Supabase user ID in subscription or customer metadata');
      }
    }
  } catch (error) {
    console.error('Error processing subscription update:', error);
  }
}

// Handler for subscription deletions
async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  try {
    console.log(`Subscription Deleted: ${subscription.id}`);
    
    // First, find the user with this subscription ID
    const { data: subscriptionData, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (fetchError) {
      console.error('Error finding subscription record:', fetchError);
      return;
    }

    if (!subscriptionData?.user_id) {
      console.error('No user found with this subscription ID');
      return;
    }

    // Update subscription status to 'cancelled'
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', subscriptionData.user_id);

    if (error) {
      console.error('Error updating subscription after deletion:', error);
    }
  } catch (error) {
    console.error('Error processing subscription deletion:', error);
  }
}

/* 
To deploy:
1. Ensure Stripe secret keys and Supabase keys are set as secrets:
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   supabase secrets set SUPABASE_URL=https://....supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=ey....
2. Deploy the function:
   supabase functions deploy stripe-webhook
   
3. Create a webhook in the Stripe dashboard pointing to:
   https://your-project-ref.supabase.co/functions/v1/stripe-webhook
   
4. Configure the webhook to listen for these events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
*/ 