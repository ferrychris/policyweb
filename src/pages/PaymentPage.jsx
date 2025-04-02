import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { cn } from '../lib/utils';
import {
  CreditCard,
  Shield,
  Clock,
  Users,
  Mail,
  Phone,
  MapPin,
  Globe,
  CheckCircle,
  User
} from "react-feather";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PACKAGE_FEATURES = {
  "Starter Plan": {
    title: "Starter Plan",
    price: "$29/month",
    priceId: "price_starter_monthly",
    description: "Basic policy templates and AI customization",
    features: [
      { icon: Shield, text: "Basic policy templates" },
      { icon: CheckCircle, text: "AI-powered customization" },
      { icon: Mail, text: "Email support" }
    ],
    variant: "starter"
  },
  "Professional Plan": {
    title: "Professional Plan",
    price: "$99/month",
    priceId: "price_professional_monthly",
    description: "Advanced templates with priority support",
    features: [
      { icon: Shield, text: "All Starter features" },
      { icon: Users, text: "Advanced policy templates" },
      { icon: Clock, text: "Priority support" },
      { icon: Globe, text: "Custom branding" }
    ],
    variant: "professional",
    popular: true
  },
  "Enterprise Plan": {
    title: "Enterprise Plan",
    price: "$299/month",
    priceId: "price_enterprise_monthly",
    description: "Custom solutions for large organizations",
    features: [
      { icon: Shield, text: "All Professional features" },
      { icon: Users, text: "Dedicated account manager" },
      { icon: Globe, text: "Custom policy development" },
      { icon: MapPin, text: "API access" },
      { icon: Phone, text: "SSO integration" }
    ],
    variant: "enterprise"
  }
};

const PaymentForm = ({ policyData, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: cardError } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: billingDetails
      });

      if (cardError) {
        setError(cardError.message);
        setProcessing(false);
        return;
      }

      // Here you would typically make a call to your backend to create the subscription
      // For now, we'll simulate a successful subscription
      const subscriptionId = 'sub_' + Math.random().toString(36).substr(2, 9);
      
      onSuccess({
        packageName: policyData.packageName,
        subscriptionId,
        billingDetails
      });
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Payment error:', err);
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text">
            Full Name
          </label>
          <input
            type="text"
            value={billingDetails.name}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-dark-text"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text">
            Email
          </label>
          <input
            type="email"
            value={billingDetails.email}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-dark-text"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text">
            Phone
          </label>
          <input
            type="tel"
            value={billingDetails.phone}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, phone: e.target.value }))}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-dark-text"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text">
            Address
          </label>
          <input
            type="text"
            value={billingDetails.address.line1}
            onChange={(e) => setBillingDetails(prev => ({ 
              ...prev, 
              address: { ...prev.address, line1: e.target.value }
            }))}
            required
            placeholder="Street address"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-dark-text"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              value={billingDetails.address.city}
              onChange={(e) => setBillingDetails(prev => ({ 
                ...prev, 
                address: { ...prev.address, city: e.target.value }
              }))}
              required
              placeholder="City"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-dark-text"
            />
          </div>
          <div>
            <input
              type="text"
              value={billingDetails.address.state}
              onChange={(e) => setBillingDetails(prev => ({ 
                ...prev, 
                address: { ...prev.address, state: e.target.value }
              }))}
              required
              placeholder="State"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-dark-text"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              value={billingDetails.address.postal_code}
              onChange={(e) => setBillingDetails(prev => ({ 
                ...prev, 
                address: { ...prev.address, postal_code: e.target.value }
              }))}
              required
              placeholder="ZIP / Postal code"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-dark-text"
            />
          </div>
          <div>
            <select
              value={billingDetails.address.country}
              onChange={(e) => setBillingDetails(prev => ({ 
                ...prev, 
                address: { ...prev.address, country: e.target.value }
              }))}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-dark-text"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Card Details
          </label>
          <div className="p-4 border rounded-md border-gray-300 dark:border-dark-border bg-white dark:bg-gray-700">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#6B7280',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                  invalid: {
                    color: '#EF4444',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className={cn(
          "w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
          "bg-gradient-to-r from-indigo-600 to-purple-600",
          "hover:from-indigo-700 hover:to-purple-700",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {processing ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Pay {PACKAGE_FEATURES[policyData.packageName]?.price}
          </span>
        )}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [policyData, setPolicyData] = useState(null);

  useEffect(() => {
    const data = location.state?.policyData;
    if (!data || !PACKAGE_FEATURES[data.packageName]) {
      navigate('/');
      return;
    }
    setPolicyData(data);
  }, [location.state, navigate]);

  const handlePaymentSuccess = ({ packageName, subscriptionId, billingDetails }) => {
    // Extract only serializable data from features
    const serializableFeatures = PACKAGE_FEATURES[packageName].features.map(feature => ({
      text: feature.text
    }));

    navigate('/payment-success', {
      state: {
        packageName,
        subscriptionId,
        billingDetails,
        features: serializableFeatures
      }
    });
  };

  if (!policyData) return null;

  const selectedPackage = PACKAGE_FEATURES[policyData.packageName];

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-dark-heading">
        Order Summary
      </h1>
      
      <div className="bg-white dark:bg-dark-card shadow-lg rounded-lg p-8">
        <div className="space-y-6">
          <div
            className={cn(
              "p-6 rounded-lg border-2",
              "border-indigo-600 dark:border-indigo-500"
            )}
          >
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
                {policyData.packageName}
              </span>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {selectedPackage.price}
              </span>
            </div>
            
            <div className="space-y-3 mt-4">
              {selectedPackage.features.map(({ icon: Icon, text }, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-gray-600 dark:text-dark-text">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm
            policyData={policyData}
            onSuccess={handlePaymentSuccess}
          />
        </Elements>
      </div>
    </div>
  );
};

export default PaymentPage;
