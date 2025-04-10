import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Loader2, ShieldAlert } from 'lucide-react';
import CheckoutForm from './CheckoutForm';

// Load Stripe outside of the component to avoid recreating the Stripe object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [packageDetails, setPackageDetails] = useState(null);

  useEffect(() => {
    if (!user) {
      toast.error('You must be logged in to checkout');
      navigate('/login');
      return;
    }

    // Get package details from URL query parameters
    const params = new URLSearchParams(location.search);
    const tierId = params.get('tier');
    const billingCycle = params.get('cycle') || 'monthly';

    // Validate tier ID
    if (!tierId || isNaN(Number(tierId))) {
      setError('Invalid package selected. Please try again.');
      setLoading(false);
      return;
    }

    // Map tierId to package details
    const tiers = {
      1: { name: "Foundational Package", priceMonthly: 900, priceYearly: 9000 },
      2: { name: "Operational Package", priceMonthly: 1500, priceYearly: 15000 },
      3: { name: "Strategic Package", priceMonthly: 3000, priceYearly: 30000 }
    };

    const tier = tiers[tierId];
    if (!tier) {
      setError('Invalid package selected. Please try again.');
      setLoading(false);
      return;
    }

    // Set package details
    const price = billingCycle === 'yearly' ? tier.priceYearly / 100 : tier.priceMonthly / 100;
    setPackageDetails({
      id: tierId,
      name: tier.name,
      price: price,
      billingCycle: billingCycle
    });

    // Get Stripe price IDs
    const stripePriceIds = {
      1: { // Foundational Package
        monthly: 'price_1OCn2xH2eZvKYlo2bQYoJCDF',
        yearly: 'price_1OCn2xH2eZvKYlo2CbX9XsLu'
      },
      2: { // Operational Package
        monthly: 'price_1OCn3SH2eZvKYlo2ZKrpoNtd',
        yearly: 'price_1OCn3SH2eZvKYlo231Sd3XYZ'
      },
      3: { // Strategic Package
        monthly: 'price_1OCn4AH2eZvKYlo22HZmRnXl',
        yearly: 'price_1OCn4AH2eZvKYlo2RofPzDCJ'
      }
    };

    const priceId = stripePriceIds[tierId]?.[billingCycle];
    if (!priceId) {
      setError('Invalid price ID. Please try again.');
      setLoading(false);
      return;
    }

    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        // Call to Supabase Edge Function to create a payment intent
        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: {
            priceId: priceId,
            packageId: tierId,
            customerEmail: user.email,
            billingCycle: billingCycle
          }
        });

        if (error) throw error;
        
        if (!data?.clientSecret) {
          throw new Error('No client secret returned');
        }

        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setError('Failed to initialize checkout. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [user, navigate, location.search]);

  const handleSuccess = () => {
    toast.success('Payment successful! Your subscription has been activated.');
    navigate('/dashboard/policies?subscription=success');
  };

  const handleError = (message) => {
    setError(message || 'An error occurred during checkout.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#13091F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B4A5FF] mx-auto mb-4" />
          <p className="text-[#B4A5FF]">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#13091F] flex items-center justify-center p-4">
        <div className="bg-[#2E1D4C]/30 rounded-xl p-6 border border-[#2E1D4C]/50 max-w-md w-full text-center">
          <ShieldAlert className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#E2DDFF] mb-2">Checkout Error</h2>
          <p className="text-[#B4A5FF] mb-6">{error}</p>
          <button
            onClick={() => navigate('/pricing')}
            className="px-6 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors"
          >
            Return to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13091F] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#E2DDFF] mb-4">
            Complete Your Purchase
          </h1>
          <p className="text-[#B4A5FF]">
            Review your package details and enter your payment information
          </p>
        </div>

        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm 
              packageDetails={packageDetails} 
              onSuccess={handleSuccess} 
              onError={handleError}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default Checkout; 