import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "stripe";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestPayload {
  cardData: {
    cardNumber: string;
    cardExpiry: string;
    cardCVC: string;
    cardholderName: string;
  };
  formData: {
    billingName: string;
    billingAddress: string;
    billingCity: string;
    billingState: string;
    billingZip: string;
    billingCountry: string;
    companyName?: string;
    email: string;
  };
  policyData: {
    packageName: string;
    selectedPolicies: string[];
    customizations?: Record<string, any>;
  };
}

// Price mapping based on package names
const PRICE_IDS = {
  'Basic Coverage': 'price_starter_monthly',
  'Professional': 'price_professional_monthly',
  'Enterprise': 'price_enterprise_monthly'
} as const;

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Get request payload
    const payload: RequestPayload = await req.json();
    const { cardData, formData, policyData } = payload;

    // Validate package name and get price ID
    const priceId = PRICE_IDS[policyData.packageName as keyof typeof PRICE_IDS];
    if (!priceId) {
      throw new Error('Invalid package name');
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Missing Stripe secret key');
    }
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Create payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardData.cardNumber.replace(/\s+/g, ''),
        exp_month: parseInt(cardData.cardExpiry.split('/')[0], 10),
        exp_year: parseInt('20' + cardData.cardExpiry.split('/')[1], 10),
        cvc: cardData.cardCVC,
      },
      billing_details: {
        name: cardData.cardholderName,
        email: formData.email,
        address: {
          line1: formData.billingAddress,
          city: formData.billingCity,
          state: formData.billingState,
          postal_code: formData.billingZip,
          country: formData.billingCountry || 'US',
        },
      },
    });

    // Create or get customer
    const existingCustomers = await stripe.customers.list({ email: formData.email });
    let customer;

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      // Update customer with latest info
      await stripe.customers.update(customer.id, {
        metadata: {
          companyName: formData.companyName || '',
          selectedPolicies: JSON.stringify(policyData.selectedPolicies),
        },
        email: formData.email,
        name: formData.billingName || undefined,
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });
    } else {
      customer = await stripe.customers.create({
        email: formData.email,
        name: formData.billingName || undefined,
        payment_method: paymentMethod.id,
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
        metadata: {
          companyName: formData.companyName || '',
          selectedPolicies: JSON.stringify(policyData.selectedPolicies),
        },
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      metadata: {
        packageName: policyData.packageName,
        selectedPolicies: JSON.stringify(policyData.selectedPolicies),
        customizations: JSON.stringify(policyData.customizations || {}),
      },
      expand: ['latest_invoice.payment_intent'],
    });

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: subscription.id,
        clientSecret: (subscription as any).latest_invoice.payment_intent.client_secret,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
