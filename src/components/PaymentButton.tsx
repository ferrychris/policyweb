import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createCheckoutSession } from '../lib/stripe';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentButtonProps {
  priceId: string;
  planName: string;
  customerId?: string;
  className?: string;
}

export default function PaymentButton({ priceId, planName, customerId, className = '' }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { sessionId } = await createCheckoutSession(priceId, customerId);
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md text-white 
        bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 focus:outline-none 
        focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-900 ${className}`}
    >
      {loading ? (
        <>
          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
          Processing...
        </>
      ) : (
        `Subscribe to ${planName}`
      )}
    </button>
  );
}
