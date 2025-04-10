import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno&no-check';

const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  // @ts-ignore // Deno includes fetch
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
});

console.log('Stripe Payment Intent Function Initialized');

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables.');
    }

    // Create Supabase client with auth header
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
      auth: { persistSession: false }, // Essential for server-side
    });

    // 1. Get the user making the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('User error:', userError);
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('Authenticated User:', user.id);

    // 2. Get request data
    const { priceId, packageId, billingCycle, customerEmail } = await req.json();
    if (!priceId || !packageId) {
      throw new Error('Missing priceId or packageId in request body.');
    }
    console.log(`Received priceId: ${priceId}, packageId: ${packageId}, billingCycle: ${billingCycle}`);

    // 3. Get or Create Stripe Customer ID
    // Check if profile exists and has stripe_customer_id
    let stripeCustomerId: string | null = null;
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // Ignore 'row not found' error
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch user profile.');
    }

    if (profile?.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id;
      console.log('Found existing Stripe Customer ID:', stripeCustomerId);
    } else {
      console.log('No Stripe Customer ID found, creating new one...');
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: customerEmail || user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;
      console.log('Created new Stripe Customer ID:', stripeCustomerId);

      // Update profile with the new Stripe Customer ID
      const { error: updateProfileError } = await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('user_id', user.id);

      if (updateProfileError) {
        console.error('Error updating profile with Stripe ID:', updateProfileError);
        // Log error but proceed - payment intent might still work
      } else {
        console.log('Profile updated with Stripe Customer ID');
      }
    }

    if (!stripeCustomerId) {
       throw new Error('Failed to retrieve or create Stripe Customer ID.');
    }

    // 4. Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateAmount(packageId, billingCycle),
      currency: 'usd',
      customer: stripeCustomerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        package_id: packageId.toString(),
        billing_cycle: billingCycle,
        supabase_user_id: user.id,
      },
    });

    console.log('Stripe Payment Intent created:', paymentIntent.id);

    // 5. Return the client secret
    return new Response(JSON.stringify({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to calculate amount based on package and billing cycle
function calculateAmount(packageId: number | string, billingCycle: string): number {
  const packagePrices = {
    "1": { monthly: 900, yearly: 9000 }, // Foundational Package
    "2": { monthly: 1500, yearly: 15000 }, // Operational Package
    "3": { monthly: 3000, yearly: 30000 }, // Strategic Package
  };

  // Convert packageId to string to safely access the object
  const packageIdStr = packageId.toString();
  
  // Default to monthly billing if not specified
  const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
  
  // Return the price or default to 900 if package not found
  return packagePrices[packageIdStr]?.[cycle] || 900;
}

/* 
To deploy:
1. Ensure Stripe secret key (STRIPE_SECRET_KEY), Supabase URL/Anon Key are set as secrets:
   supabase secrets set STRIPE_SECRET_KEY=sk_test_... 
   supabase secrets set SUPABASE_URL=https://....supabase.co
   supabase secrets set SUPABASE_ANON_KEY=ey....
2. Deploy the function:
   supabase functions deploy create-payment-intent --no-verify-jwt

Notes:
- Assumes a 'profiles' table exists with 'user_id' (FK to auth.users) and 'stripe_customer_id' (TEXT) columns.
- Payment success webhook handler is needed to update subscription status in database
*/ 