import axios from 'axios';

/**
 * Payment service for handling Stripe payment functionality.
 * This service provides methods to interact with the Stripe API
 * and manage payment-related operations in a React-friendly way.
 */

// Define product details
const PRODUCTS = {
  basic_plan: {
    name: 'Basic Plan',
    price: 900,
    description: '3 core policy templates with simple customization',
  },
  professional_package: {
    name: 'Professional Package',
    price: 1500,
    description: '8 essential policy templates with standard customization',
  },
  premium_suite: {
    name: 'Premium Suite',
    price: 5000,
    description: 'Full suite of 19 policy templates with advanced customization',
  },
};

// Initialize Stripe
const stripe = window.Stripe ? window.Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx') : null;

/**
 * Create a PaymentIntent using the server API.
 * @param {string} productId - The ID of the product being purchased.
 * @param {string} email - The customer's email address.
 * @returns {Promise<object>} - The PaymentIntent data.
 */
export const createPaymentIntent = async (productId, email) => {
  if (!PRODUCTS[productId]) {
    throw new Error(`Invalid product ID: ${productId}`);
  }

  try {
    const response = await axios.post('/api/create-payment-intent', {
      productId,
      email,
    });

    if (!response.data || !response.data.clientSecret) {
      throw new Error('Failed to create PaymentIntent');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    throw error;
  }
};

/**
 * Confirm a payment using Stripe's confirmCardPayment method.
 * @param {string} clientSecret - The client secret from the PaymentIntent.
 * @param {object} billingDetails - The customer's billing details.
 * @returns {Promise<object>} - The result of the payment confirmation.
 */
export const confirmPayment = async (clientSecret, billingDetails) => {
  if (!stripe) {
    throw new Error('Stripe is not initialized');
  }

  try {
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: stripe.elements().create('card'),
        billing_details: billingDetails,
      },
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.paymentIntent;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

/**
 * Initialize the Stripe Elements instance for card input.
 * @returns {object} - The Stripe Elements instance.
 */
export const initializeStripeElements = () => {
  if (!stripe) {
    throw new Error('Stripe is not initialized');
  }

  const elements = stripe.elements();
  const cardElement = elements.create('card', {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  });

  return cardElement;
};

/**
 * Get product details by ID.
 * @param {string} productId - The ID of the product.
 * @returns {object} - The product details.
 */
export const getProductDetails = (productId) => {
  return PRODUCTS[productId] || null;
};

export default {
  createPaymentIntent,
  confirmPayment,
  initializeStripeElements,
  getProductDetails,
};
