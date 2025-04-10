import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const CheckoutForm = ({ packageDetails, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }

    // Check for return from Stripe redirect
    const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');
    if (clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        switch (paymentIntent.status) {
          case 'succeeded':
            toast.success('Payment successful!');
            onSuccess?.();
            break;
          case 'processing':
            toast.info('Your payment is processing.');
            break;
          case 'requires_payment_method':
            toast.error('Your payment was not successful, please try again.');
            onError?.('Your payment was unsuccessful. Please try again.');
            break;
          default:
            toast.error('Something went wrong.');
            onError?.('Something went wrong with your payment. Please try again.');
            break;
        }

        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, [stripe, elements, onSuccess, onError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/policies?subscription=success&name=${encodeURIComponent(packageDetails.name)}`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment.');
        toast.error(error.message || 'Payment failed. Please try again.');
      }
    } catch (e) {
      console.error('Payment error:', e);
      setErrorMessage(e.message || 'An error occurred during payment.');
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[#2E1D4C]/30 rounded-xl p-6 border border-[#2E1D4C]/50">
        <h3 className="text-xl font-bold text-[#E2DDFF] mb-4">
          Order Summary
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[#B4A5FF]">Package:</span>
            <span className="text-[#E2DDFF] font-medium">{packageDetails.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#B4A5FF]">Price:</span>
            <span className="text-[#E2DDFF] font-medium">${packageDetails.price}/{packageDetails.billingCycle === 'yearly' ? 'year' : 'month'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#B4A5FF]">Billing Cycle:</span>
            <span className="text-[#E2DDFF] font-medium">{packageDetails.billingCycle === 'yearly' ? 'Annual' : 'Monthly'}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#2E1D4C]/30 rounded-xl p-6 border border-[#2E1D4C]/50">
        <h3 className="text-xl font-bold text-[#E2DDFF] mb-4">
          Payment Details
        </h3>
        <div className="space-y-4">
          <PaymentElement options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
              }
            },
            theme: 'night',
          }} />
          
          {errorMessage && (
            <div className="p-4 bg-red-500/20 rounded-lg text-red-400 text-sm">
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-4 mt-6">
        <button
          type="button"
          onClick={() => navigate('/pricing')}
          className="px-6 py-3 bg-[#2E1D4C]/50 text-[#B4A5FF] rounded-lg hover:bg-[#2E1D4C]/70 transition-colors"
        >
          Back to Pricing
        </button>
        <button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="flex-1 px-6 py-3 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors flex justify-center items-center disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${packageDetails.price}`
          )}
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm; 