// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno&no-check';

// Initialize Stripe
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  // @ts-ignore // Deno has fetch built-in
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

console.log('Stripe Checkout Session Function Initialized');

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request data
    const { priceId, packageId, packageName, customerEmail, billingCycle, successUrl, cancelUrl } = await req.json();
    
    if (!priceId || !customerEmail) {
      throw new Error('Missing required fields: priceId and customerEmail are required');
    }

    console.log(`Creating checkout session for ${customerEmail}, package: ${packageName}, price: ${priceId}`);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${req.headers.get('origin')}/payment-success?success=true&tier=${packageId}&name=${encodeURIComponent(packageName || 'Subscription')}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/checkout?cancelled=true`,
      customer_email: customerEmail,
      client_reference_id: packageId?.toString(),
      metadata: {
        package_id: packageId?.toString() || '',
        package_name: packageName || '',
        billing_cycle: billingCycle || 'monthly',
      },
    });

    console.log(`Checkout session created: ${session.id}`);

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
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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