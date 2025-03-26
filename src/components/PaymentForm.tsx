import React from 'react';
import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner, faLock, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { cn } from '../lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { createSubscription } from '../lib/stripe';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentFormProps {
  amount: number;
  setupFee: number;
  productName: string;
  billingInterval: string;
  priceId: string;
  features: string[];
  isPopular?: boolean;
  onPaymentSuccess?: () => void;
}

interface FormData {
  email: string;
  name: string;
  companyName: string;
  selectedPolicies: string[];
  acceptTerms: boolean;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface FormErrors {
  [key: string]: string;
}

interface PolicyCustomization {
  policyId: string;
  options?: Record<string, any>;
}

const availablePolicies = [
  {
    id: 'privacy-policy',
    name: 'Privacy Policy',
    description: 'Comprehensive privacy policy compliant with GDPR and CCPA'
  },
  {
    id: 'terms-of-service',
    name: 'Terms of Service',
    description: 'Detailed terms and conditions for your service'
  },
  {
    id: 'cookie-policy',
    name: 'Cookie Policy',
    description: 'Cookie usage and tracking policy'
  },
  {
    id: 'disclaimer',
    name: 'Disclaimer',
    description: 'Legal disclaimers and limitations of liability'
  },
  {
    id: 'refund-policy',
    name: 'Refund Policy',
    description: 'Clear refund and return policies'
  }
];

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const CARD_ELEMENT_OPTIONS_DARK = {
  style: {
    base: {
      fontSize: '16px',
      color: '#c1c2c5',
      backgroundColor: '#25262b',
      '::placeholder': {
        color: '#6b7280',
      },
      iconColor: '#c1c2c5',
    },
    invalid: {
      color: '#ef4444',
    },
  },
};

const PaymentForm = ({
  amount,
  setupFee,
  productName,
  billingInterval,
  priceId,
  features,
  isPopular,
  onPaymentSuccess
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [policyCustomizations, setPolicyCustomizations] = useState({});

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    companyName: '',
    selectedPolicies: [],
    acceptTerms: false,
    billingAddress: {
      line1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  });

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.name) {
      errors.name = 'Name is required';
    }

    if (!formData.billingAddress.line1) {
      errors['billing.line1'] = 'Address is required';
    }

    if (!formData.billingAddress.city) {
      errors['billing.city'] = 'City is required';
    }

    if (!formData.billingAddress.state) {
      errors['billing.state'] = 'State is required';
    }

    if (!formData.billingAddress.postalCode) {
      errors['billing.postalCode'] = 'Postal code is required';
    }

    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    if (formData.selectedPolicies.length === 0) {
      errors.selectedPolicies = 'Please select at least one policy';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: { target: { name: string; value: string; type?: string; checked?: boolean } }) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name.startsWith('billing.')) {
      const billingField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [billingField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handlePolicyToggle = (policyId: string) => {
    setFormData(prev => {
      const newSelectedPolicies = prev.selectedPolicies.includes(policyId)
        ? prev.selectedPolicies.filter(id => id !== policyId)
        : [...prev.selectedPolicies, policyId];

      // Clear policy customization if unselected
      if (!newSelectedPolicies.includes(policyId)) {
        setPolicyCustomizations(prev => {
          const newCustomizations = { ...prev };
          delete newCustomizations[policyId];
          return newCustomizations;
        });
      }

      return {
        ...prev,
        selectedPolicies: newSelectedPolicies
      };
    });

    // Clear error if any policies are selected
    if (formErrors.selectedPolicies) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.selectedPolicies;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError('Payment system is not ready. Please try again.');
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare policy data
      const policyData = {
        selectedPolicies: formData.selectedPolicies,
        customizations: Object.fromEntries(
          formData.selectedPolicies.map(policyId => [
            policyId,
            policyCustomizations[policyId]?.options || {}
          ])
        )
      };

      // Create subscription with payment method
      const response = await createSubscription({
        priceId,
        elements,
        stripe,
        email: formData.email,
        name: formData.name,
        companyName: formData.companyName,
        selectedPolicies: formData.selectedPolicies,
        billingAddress: {
          line1: formData.billingAddress.line1,
          line2: formData.billingAddress.line2,
          city: formData.billingAddress.city,
          state: formData.billingAddress.state,
          postal_code: formData.billingAddress.postalCode,
          country: formData.billingAddress.country,
        },
        policyData,
      });

      if (!response?.subscriptionId) {
        throw new Error('Failed to create subscription');
      }

      onPaymentSuccess?.();
    } catch (err) {
      console.error('Payment error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('An unexpected error occurred during payment');
      }

      // Scroll error into view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderError = (fieldName: string) => {
    if (!formErrors[fieldName]) return null;
    return (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-red-600 dark:text-red-400 mt-1"
      >
        {formErrors[fieldName]}
      </motion.p>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "bg-white dark:bg-[#25262b] rounded-lg shadow-lg p-8 relative",
        "border border-gray-200 dark:border-[#2c2e33]",
        isPopular && "ring-2 ring-indigo-500 dark:ring-indigo-400"
      )}>
        {isPopular && (
          <div className="absolute top-0 transform -translate-y-1/2 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              Most Popular
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {productName}
          </h2>
          <div className="flex items-center">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ${amount}
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">/{billingInterval}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c2c5] mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={cn(
                  "w-full rounded-lg border p-3",
                  "focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                  "bg-white dark:bg-[#25262b]",
                  "text-gray-700 dark:text-[#c1c2c5]",
                  formErrors.name
                    ? "border-red-300 dark:border-red-700"
                    : "border-gray-300 dark:border-[#2c2e33]"
                )}
                placeholder="Enter your full name"
              />
              {renderError('name')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c2c5] mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={cn(
                  "w-full rounded-lg border p-3",
                  "focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                  "bg-white dark:bg-[#25262b]",
                  "text-gray-700 dark:text-[#c1c2c5]",
                  formErrors.email
                    ? "border-red-300 dark:border-red-700"
                    : "border-gray-300 dark:border-[#2c2e33]"
                )}
                placeholder="Enter your email"
              />
              {renderError('email')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c2c5] mb-2">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className={cn(
                "w-full rounded-lg border border-gray-300 dark:border-[#2c2e33]",
                "bg-white dark:bg-[#25262b]",
                "text-gray-700 dark:text-[#c1c2c5] p-3",
                "focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              )}
              placeholder="Enter your company name (optional)"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Policies <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-4">
              {availablePolicies.map(policy => (
                <div
                  key={policy.id}
                  className={cn(
                    "relative flex items-start p-4 rounded-lg border cursor-pointer",
                    "transition-colors duration-200",
                    formData.selectedPolicies.includes(policy.id)
                      ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-gray-200 dark:border-[#2c2e33] hover:border-indigo-300 dark:hover:border-indigo-600"
                  )}
                  onClick={() => handlePolicyToggle(policy.id)}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={formData.selectedPolicies.includes(policy.id)}
                      onChange={() => handlePolicyToggle(policy.id)}
                      className={cn(
                        "h-4 w-4 rounded border-gray-300",
                        "text-indigo-600 focus:ring-indigo-500",
                        "dark:border-gray-600 dark:bg-gray-700",
                        "transition-colors duration-200"
                      )}
                    />
                  </div>
                  <div className="ml-3">
                    <label className="font-medium text-gray-900 dark:text-white">
                      {policy.name}
                    </label>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {policy.description}
                    </p>
                  </div>
                  {formData.selectedPolicies.includes(policy.id) && (
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400"
                    />
                  )}
                </div>
              ))}
            </div>
            {renderError('selectedPolicies')}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Billing Address
            </h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c2c5] mb-2">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="billing.line1"
                  value={formData.billingAddress.line1}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full rounded-lg border p-3",
                    "focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                    "bg-white dark:bg-[#25262b]",
                    "text-gray-700 dark:text-[#c1c2c5]",
                    formErrors['billing.line1']
                      ? "border-red-300 dark:border-red-700"
                      : "border-gray-300 dark:border-[#2c2e33]"
                  )}
                  placeholder="Street address"
                />
                {renderError('billing.line1')}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c2c5] mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="billing.city"
                    value={formData.billingAddress.city}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full rounded-lg border p-3",
                      "focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                      "bg-white dark:bg-[#25262b]",
                      "text-gray-700 dark:text-[#c1c2c5]",
                      formErrors['billing.city']
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-300 dark:border-[#2c2e33]"
                    )}
                  />
                  {renderError('billing.city')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c2c5] mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="billing.state"
                    value={formData.billingAddress.state}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full rounded-lg border p-3",
                      "focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                      "bg-white dark:bg-[#25262b]",
                      "text-gray-700 dark:text-[#c1c2c5]",
                      formErrors['billing.state']
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-300 dark:border-[#2c2e33]"
                    )}
                  />
                  {renderError('billing.state')}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c2c5] mb-2">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="billing.postalCode"
                    value={formData.billingAddress.postalCode}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full rounded-lg border p-3",
                      "focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                      "bg-white dark:bg-[#25262b]",
                      "text-gray-700 dark:text-[#c1c2c5]",
                      formErrors['billing.postalCode']
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-300 dark:border-[#2c2e33]"
                    )}
                  />
                  {renderError('billing.postalCode')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c2c5] mb-2">
                    Country
                  </label>
                  <select
                    name="billing.country"
                    value={formData.billingAddress.country}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full rounded-lg border border-gray-300 dark:border-[#2c2e33]",
                      "bg-white dark:bg-[#25262b]",
                      "text-gray-700 dark:text-[#c1c2c5] p-3",
                      "focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    )}
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment Information
            </h3>
            <div className={cn(
              "rounded-lg border p-4",
              "bg-white dark:bg-[#25262b]",
              "border-gray-300 dark:border-[#2c2e33]"
            )}>
              <CardElement
                options={isDarkMode ? CARD_ELEMENT_OPTIONS_DARK : CARD_ELEMENT_OPTIONS}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-[#c1c2c5]">
              I accept the <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">terms and conditions</a>
            </label>
          </div>
          {renderError('acceptTerms')}

          <motion.button
            type="submit"
            disabled={isLoading || !stripe}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full py-3 px-6 rounded-lg font-medium",
              "bg-gradient-to-r from-indigo-600 to-purple-600",
              "text-white flex items-center justify-center space-x-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin h-5 w-5" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faLock} className="h-5 w-5" />
                <span>Complete Secure Payment</span>
              </>
            )}
          </motion.button>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4 flex items-center justify-center">
            <FontAwesomeIcon icon={faLock} className="h-4 w-4 mr-2" />
            Your payment information is encrypted and secure
          </p>
        </div>
      </div>
    </form>
  );
};

const PaymentFormWrapper = (props: Omit<PaymentFormProps, 'onPaymentSuccess'> & { onPaymentSuccess?: () => void }) => (
  <Elements stripe={stripePromise}>
    <PaymentForm {...props} />
  </Elements>
);

export default PaymentFormWrapper;
