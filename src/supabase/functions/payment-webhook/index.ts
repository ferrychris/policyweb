import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno&no-check';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
  // @ts-ignore
  httpClient: Stripe.createFetchHttpClient(),
});

console.log('Stripe Payment Webhook Handler Initialized');

// Create a Supabase client with the service role key for admin privileges
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      throw new Error('Missing Stripe signature');
    }
    
    // Get the raw body
    const body = await req.text();
    
    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err);
      return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Return a response to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error handling webhook:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Handler for successful payments
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
  
  // Extract metadata
  const metadata = paymentIntent.metadata || {};
  const userId = metadata.supabase_user_id;
  const packageId = metadata.package_id;
  const billingCycle = metadata.billing_cycle || 'monthly';
  
  if (!userId || !packageId) {
    console.error('Missing required metadata fields');
    return;
  }
  
  try {
    // Calculate subscription period
    const now = new Date();
    const startDate = now.toISOString();
    let endDate = new Date(now);
    
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    
    // Create or update subscription record
    const { data, error } = await supabaseAdmin
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        package_id: parseInt(packageId),
        payment_id: paymentIntent.id,
        status: 'active',
        billing_cycle: billingCycle,
        current_period_start: startDate,
        current_period_end: endDate.toISOString(),
        updated_at: startDate
      }, {
        onConflict: 'user_id'
      });
      
    if (error) {
      throw error;
    }
    
    console.log(`✅ Subscription updated for user ${userId}`);
    
    // Create subscription log entry
    await supabaseAdmin
      .from('subscription_logs')
      .insert({
        user_id: userId,
        payment_id: paymentIntent.id,
        event: 'payment_success',
        package_id: parseInt(packageId),
        amount: paymentIntent.amount,
        created_at: startDate
      });
      
  } catch (error) {
    console.error('Error processing payment success:', error);
  }
}

// Handler for failed payments
async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log(`❌ Payment failed: ${paymentIntent.id}`);
  
  // Extract metadata
  const metadata = paymentIntent.metadata || {};
  const userId = metadata.supabase_user_id;
  
  if (!userId) {
    console.error('Missing user ID in metadata');
    return;
  }
  
  try {
    // Update subscription status
    const { error } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'payment_failed',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (error) {
      throw error;
    }
    
    console.log(`✅ Subscription marked as failed for user ${userId}`);
    
    // Create failure log
    await supabaseAdmin
      .from('subscription_logs')
      .insert({
        user_id: userId,
        payment_id: paymentIntent.id,
        event: 'payment_failed',
        error_message: paymentIntent.last_payment_error?.message || 'Payment failed',
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error processing payment failure:', error);
  }
}

/*
1. Deploy:
   supabase functions deploy payment-webhook

2. Set up webhook endpoint in Stripe Dashboard:
   https://your-project-ref.supabase.co/functions/v1/payment-webhook

3. Select events to listen for:
   - payment_intent.succeeded
   - payment_intent.payment_failed
*/ 