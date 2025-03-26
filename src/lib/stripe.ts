/// <reference types="vite/client" />

import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Import environment variables
const VITE_STRIPE_PRICE_STARTER = import.meta.env.VITE_STRIPE_PRICE_STARTER ?? 'price_starter_monthly';
const VITE_STRIPE_PRICE_PROFESSIONAL = import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL ?? 'price_professional_monthly';
const VITE_STRIPE_PRICE_ENTERPRISE = import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE ?? 'price_enterprise_monthly';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// API URLs
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3002/functions/v1'
  : 'https://vgedgxfxhiiilzqydfxu.supabase.co/functions/v1';

// Export price IDs
export const PRICE_IDS = {
  starter: VITE_STRIPE_PRICE_STARTER,
  professional: VITE_STRIPE_PRICE_PROFESSIONAL,
  enterprise: VITE_STRIPE_PRICE_ENTERPRISE,
} as const;

// Export pricing tiers
export const pricingTiers = {
  starter: 'price_starter_monthly',
  professional: 'price_professional_monthly',
  enterprise: 'price_enterprise_monthly',
} as const;

interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface BillingDetails {
  email: string;
  name: string;
  companyName?: string;
  cardLastFour?: string;
  billingAddress: BillingAddress;
}

interface PolicyData {
  selectedPolicies: string[];
  customizations?: Record<string, any>;
}

interface CreateSubscriptionParams {
  priceId: string;
  elements: StripeElements;
  stripe: Stripe;
  email: string;
  name: string;
  companyName?: string;
  selectedPolicies?: string[];
  billingAddress: BillingAddress;
  policyData?: PolicyData;
}

export interface SubscriptionResponse {
  clientSecret: string;
  subscriptionId: string;
}

interface ApiError {
  message: string;
  status?: number;
}

const apiHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = {
      message: 'An error occurred while processing your request',
      status: response.status,
    };

    try {
      const errorData = await response.json();
      error.message = errorData.error || errorData.message || error.message;
    } catch {
      // If parsing fails, use default error message
    }

    throw error;
  }

  return response.json();
}

export async function createSubscription({
  priceId,
  elements,
  stripe,
  email,
  name,
  companyName,
  selectedPolicies,
  billingAddress,
  policyData,
}: CreateSubscriptionParams): Promise<SubscriptionResponse> {
  if (!elements || !stripe) {
    throw new Error('Stripe Elements and Stripe instance are required');
  }

  try {
    const cardElement = elements.getElement('card');
    if (!cardElement) {
      throw new Error('Card element not found');
    }

    // Create payment method
    const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name,
        email,
        address: {
          line1: billingAddress.line1,
          line2: billingAddress.line2,
          city: billingAddress.city,
          state: billingAddress.state,
          postal_code: billingAddress.postal_code,
          country: billingAddress.country,
        },
      },
    });

    if (paymentMethodError || !paymentMethod) {
      throw new Error(paymentMethodError?.message || 'Failed to create payment method');
    }

    // Prepare billing details
    const billingDetails: BillingDetails = {
      email,
      name,
      companyName,
      cardLastFour: paymentMethod.card?.last4,
      billingAddress,
    };

    // Prepare policy data
    const policyDataToSend: PolicyData = {
      selectedPolicies: selectedPolicies || [],
      customizations: policyData?.customizations,
    };

    // Create subscription
    const response = await fetch(`${API_BASE_URL}/stripe-payment`, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,
        policyData: policyDataToSend,
        billingDetails,
        priceId,
      }),
    });

    const data = await handleApiResponse<SubscriptionResponse>(response);

    if (!data?.clientSecret || !data?.subscriptionId) {
      throw new Error('Invalid response from payment processor');
    }

    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error instanceof Error ? error : new Error('Failed to create subscription');
  }
}

export async function createCheckoutSession(priceId: string, customerId?: string): Promise<{ sessionId: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify({ priceId, customerId }),
    });

    const data = await handleApiResponse<{ sessionId: string }>(response);
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error instanceof Error ? error : new Error('Failed to create checkout session');
  }
}

export const getCustomerPortalUrl = async (customerId: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/customer-portal`, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/account`,
      }),
    });

    const data = await handleApiResponse<{ url: string }>(response);

    if (!data?.url) {
      throw new Error('Invalid response from customer portal');
    }

    return data.url;
  } catch (error) {
    console.error('Error getting customer portal URL:', error);
    throw error instanceof Error ? error : new Error('Failed to get customer portal URL');
  }
};

export const getSubscriptionStatus = async (subscriptionId: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subscription-status`, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify({ subscriptionId }),
    });

    const data = await handleApiResponse<{ status: string }>(response);

    if (!data?.status) {
      throw new Error('Invalid response from subscription status');
    }

    return data.status;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw error instanceof Error ? error : new Error('Failed to get subscription status');
  }
};

export default stripePromise;
