// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno&no-check';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Stripe
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
});

console.log('Stripe Payment Function Initialized');

serve(async (req: Request) => {
  // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

  try {
    // Get request data
    const { priceId, packageId, packageName, customerEmail, billingCycle } = await req.json();
    
    console.log(`Creating checkout session for ${customerEmail}, package: ${packageName}, price: ${priceId}`);
    
    if (!priceId || !customerEmail) {
      throw new Error('Missing required fields: priceId and customerEmail are required');
    }
    
    // Get Supabase user information from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    
    // Setup Supabase client using user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    
    // Get the user from the auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid user token');
    }
    
    console.log(`User authenticated: ${user.id}`);
    
    // Create customer if needed
    let stripeCustomerId = null;
    
    // Check if user has an existing Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();
      
    if (profile?.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id;
      console.log(`Using existing Stripe customer: ${stripeCustomerId}`);
    } else {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          supabase_user_id: user.id
        }
      });
      stripeCustomerId = customer.id;
      console.log(`Created new Stripe customer: ${stripeCustomerId}`);
      
      // Update profile with Stripe customer ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error('Error updating profile:', updateError);
      }
    }

    // Set up success and cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const success_url = `${origin}/payment-success?success=true&tier=${packageId || '1'}&name=${encodeURIComponent(packageName || 'Subscription')}`;
    const cancel_url = `${origin}/dashboard/policies?cancelled=true`;
    
    console.log('Redirect URLs:', { success_url, cancel_url });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
        payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
      },
      ],
      mode: 'subscription',
      success_url,
      cancel_url,
      client_reference_id: user.id,
      metadata: {
        package_id: packageId?.toString() || '',
        package_name: packageName || '',
        billing_cycle: billingCycle || 'monthly',
        supabase_user_id: user.id,
      },
    });

    console.log(`Session created: ${session.id}, URL: ${session.url}`);

    // Return session ID and URL
    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error creating session:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
