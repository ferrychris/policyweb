import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faArrowLeft, faLock } from '@fortawesome/free-solid-svg-icons';
import { ErrorBoundary } from 'react-error-boundary';
import PaymentForm from './PaymentForm';
import { PolicyForm as PolicyFormComponent } from './PolicyForm';
import { cn } from '../lib/utils';
import { pricingTiers } from '../lib/stripe';

interface PolicyType {
  id: string;
  title: string;
  description: string;
}

interface PricingTier {
  name: string;
  price: number;
  interval: string;
  setupFee: number;
  priceId: string;
  features: string[];
  highlighted?: boolean;
}

const policyTypes: PolicyType[] = [
  { id: 'auto', title: 'Auto Insurance', description: 'Coverage for your vehicles' },
  { id: 'home', title: 'Home Insurance', description: 'Protection for your property' },
  { id: 'life', title: 'Life Insurance', description: 'Financial security for your loved ones' },
  { id: 'health', title: 'Health Insurance', description: 'Medical coverage for you and your family' },
];

interface AddOn {
  id: string;
  title: string;
  price: number;
}

const addOns: AddOn[] = [
  { id: 'pet', title: 'Pet injury coverage', price: 15 },
  { id: 'custom', title: 'Custom parts coverage', price: 10 },
  { id: 'original', title: 'Original parts replacement', price: 25 },
];

const pricingTiersData: PricingTier[] = [
  {
    name: 'Starter',
    price: 29,
    interval: 'month',
    setupFee: 0,
    priceId: pricingTiers.starter,
    features: [
      'Basic policy templates',
      'AI-powered customization',
      'Email support'
    ]
  },
  {
    name: 'Professional',
    price: 99,
    interval: 'month',
    setupFee: 0,
    priceId: pricingTiers.professional,
    highlighted: true,
    features: [
      'All Starter features',
      'Advanced policy templates',
      'Priority support',
      'Custom branding'
    ]
  },
  {
    name: 'Enterprise',
    price: 299,
    interval: 'month',
    setupFee: 0,
    priceId: pricingTiers.enterprise,
    features: [
      'All Professional features',
      'Dedicated account manager',
      'Custom policy development',
      'API access',
      'SSO integration'
    ]
  }
];

const PolicyForm = ({ onBack }: { onBack: () => void }) => {
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState(() => [] as string[]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    additionalInfo: ''
  });

  type FormElements = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // Handle policy generation here
  };

  const handleInputChange = (e: { target: FormElements }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5 mr-2" />
          Back to Plans
        </button>
        <div className="text-sm text-gray-500 dark:text-[#c1c2c5] flex items-center">
          <FontAwesomeIcon icon={faLock} className="h-4 w-4 mr-2" />
          Secure Policy Generation
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Select Your Policy Type</h2>
        <p className="text-indigo-100">Choose the type of policy you want to generate</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {policyTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedPolicy(type.id)}
            className={cn(
              "p-6 rounded-lg text-left transition-all duration-200 transform hover:scale-102",
              selectedPolicy === type.id
                ? "bg-indigo-50 dark:bg-[#25262b] border-2 border-indigo-500 shadow-lg"
                : "bg-white dark:bg-[#25262b] hover:bg-gray-50 dark:hover:bg-[#2c2e33] border-2 border-transparent"
            )}
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{type.title}</h3>
            <p className="text-gray-500 dark:text-[#c1c2c5]">{type.description}</p>
          </button>
        ))}
      </div>

      {selectedPolicy && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-[#25262b] rounded-lg p-6 space-y-4 shadow-lg border border-gray-200 dark:border-[#2c2e33]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Optional Add-ons</h3>
              <span className="text-sm text-gray-500 dark:text-[#c1c2c5]">Enhance your coverage</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {addOns.map((addon) => (
                <label
                  key={addon.id}
                  className={cn(
                    "relative flex items-start p-4 rounded-lg cursor-pointer transition-colors",
                    selectedAddOns.includes(addon.id)
                      ? "bg-indigo-50 dark:bg-[#25262b] border-2 border-indigo-500"
                      : "bg-gray-50 dark:bg-[#2c2e33] hover:bg-gray-100 dark:hover:bg-[#2c2e33] border-2 border-transparent"
                  )}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={selectedAddOns.includes(addon.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAddOns([...selectedAddOns, addon.id]);
                        } else {
                          setSelectedAddOns(selectedAddOns.filter(id => id !== addon.id));
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="ml-3 flex justify-between w-full">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{addon.title}</p>
                      <p className="text-sm text-gray-500 dark:text-[#c1c2c5]">Additional protection</p>
                    </div>
                    <div className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      ${addon.price}/mo
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#25262b] rounded-lg p-6 shadow-lg border border-gray-200 dark:border-[#2c2e33]">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Policy Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c2c5] mb-2">Deductible</label>
                <select className="w-full rounded-lg border border-gray-300 dark:border-[#2c2e33] bg-white dark:bg-[#25262b] text-gray-700 dark:text-[#c1c2c5] p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Select deductible amount</option>
                  <option value="500">$500</option>
                  <option value="1000">$1,000</option>
                  <option value="2000">$2,000</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c2c5] mb-2">Coverage Period</label>
                <select className="w-full rounded-lg border border-gray-300 dark:border-[#2c2e33] bg-white dark:bg-[#25262b] text-gray-700 dark:text-[#c1c2c5] p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Select coverage period</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                </select>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#25262b] rounded-lg p-6 shadow-lg border border-gray-200 dark:border-[#2c2e33]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Generate Your {selectedPolicy.charAt(0).toUpperCase() + selectedPolicy.slice(1)} Insurance Policy
              </h3>
              <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c2c5] mb-2">Customer Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-gray-300 dark:border-[#2c2e33] bg-white dark:bg-[#25262b] text-gray-700 dark:text-[#c1c2c5] p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c2c5] mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-gray-300 dark:border-[#2c2e33] bg-white dark:bg-[#25262b] text-gray-700 dark:text-[#c1c2c5] p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c2c5] mb-2">Additional Information</label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  placeholder="Any specific requests or information to include in your policy"
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 dark:border-[#2c2e33] bg-white dark:bg-[#25262b] text-gray-700 dark:text-[#c1c2c5] p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-8">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              >
                <span>Generate Policy</span>
                <FontAwesomeIcon icon={faCheck} className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const PricingContent = () => {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
  };

  return (
    <div className="bg-[#1a1b1e] dark:bg-dark-bg min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {!selectedTier && !paymentCompleted ? (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-12">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4"
                >
                  Simple, Transparent Pricing
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-gray-500 dark:text-[#c1c2c5]"
                >
                  Choose the plan that's right for you
                </motion.p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {pricingTiersData.map((tier, index) => (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "bg-white dark:bg-[#25262b] rounded-lg shadow-lg overflow-hidden",
                      "transform transition-all duration-200",
                      "border border-gray-200 dark:border-[#2c2e33]",
                      tier.highlighted && "ring-2 ring-indigo-500 dark:ring-indigo-400"
                    )}
                  >
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {tier.name}
                      </h3>
                      <div className="flex items-baseline mb-6">
                        <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          ${tier.price}
                        </span>
                        <span className="text-gray-500 dark:text-[#c1c2c5] ml-2">
                          /{tier.interval}
                        </span>
                      </div>
                      <ul className="space-y-4 mb-8">
                        {tier.features.map((feature, featureIndex) => (
                          <motion.li
                            key={feature}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 + featureIndex * 0.05 }}
                            className="flex items-center"
                          >
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2"
                            />
                            <span className="text-gray-600 dark:text-[#c1c2c5]">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                      <motion.button
                        onClick={() => setSelectedTier(tier)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "w-full py-3 px-6 rounded-lg font-medium transition-colors",
                          "focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#25262b]",
                          tier.highlighted
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
                            : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300"
                        )}
                      >
                        Get Started
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : paymentCompleted ? (
            <motion.div
              key="policy-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <PolicyFormComponent onBack={() => setPaymentCompleted(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="payment-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <motion.button
                onClick={() => setSelectedTier(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "mb-8 text-indigo-600 dark:text-indigo-400",
                  "hover:text-indigo-700 dark:hover:text-indigo-300",
                  "flex items-center transition-colors duration-200"
                )}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5 mr-2" />
                Back to pricing
              </motion.button>
              <PaymentForm
                amount={selectedTier!.price}
                setupFee={selectedTier!.setupFee}
                productName={selectedTier!.name}
                billingInterval={selectedTier!.interval}
                priceId={selectedTier!.priceId}
                features={selectedTier!.features}
                isPopular={selectedTier!.highlighted}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PricingWithPayment = () => {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#1a1b1e] dark:bg-dark-bg">
          <div className="bg-white dark:bg-[#25262b] rounded-lg shadow-lg p-8 border border-gray-200 dark:border-[#2c2e33] max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-500 dark:text-[#c1c2c5] mb-6">
              We're sorry, but there was an error processing your request. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 rounded-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      <PricingContent />
    </ErrorBoundary>
  );
};

export default PricingWithPayment;
