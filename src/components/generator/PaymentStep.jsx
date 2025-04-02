import React, { useState, useEffect } from 'react';
import { cn, themeClasses, gradientClasses } from '../../lib/utils';
import { CreditCard, Package, Shield, Zap, AlertTriangle, XCircle } from 'lucide-react';
import { getAllPackages } from '../../lib/database';

// Default package info until database loads
const DEFAULT_PACKAGES = {
  basic: {
    name: 'Basic Package',
    price: 900,
    features: [
      'AI Ethics Policy',
      'AI Risk Management Policy',
      'AI Data Governance Policy'
    ],
    icon: Package
  },
  professional: {
    name: 'Professional Package',
    price: 1500,
    features: [
      'All Basic Policies',
      'AI Security Policy', 
      'Model Management Policy', 
      'Human Oversight Policy', 
      'AI Compliance Policy', 
      'Use Case Evaluation Policy'
    ],
    icon: Shield
  },
  premium: {
    name: 'Premium Package',
    price: 5000,
    features: [
      'All Professional Policies',
      'Procurement & Vendor Policy',
      'Responsible AI Deployment',
      'Training & Capability Policy',
      'Incident Response Policy',
      '+9 More Specialized Policies'
    ],
    icon: Zap
  }
};

const PaymentStep = ({ onPaymentComplete, onPaymentFailed }) => {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [processing, setProcessing] = useState(false);
  const [currentPackage, setCurrentPackage] = useState('professional');
  const [error, setError] = useState(null);
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);

  // Load packages from database
  useEffect(() => {
    try {
      const dbPackages = getAllPackages();
      
      // Format packages for our component
      const formattedPackages = {};
      dbPackages.forEach(pkg => {
        const IconComponent = 
          pkg.key === 'basic' ? Package :
          pkg.key === 'professional' ? Shield : Zap;
          
        formattedPackages[pkg.key] = {
          name: pkg.name,
          price: pkg.price,
          features: pkg.policies,
          icon: IconComponent
        };
      });
      
      setPackages(formattedPackages);
    } catch (error) {
      console.error("Error loading packages:", error);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || '';
    }

    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1/$2')
        .substr(0, 5);
    }

    // Format CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substr(0, 3);
    }

    setPaymentDetails(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    setError(null);
  };

  const validatePayment = () => {
    // Basic validation
    if (!paymentDetails.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      throw new Error('Invalid card number');
    }

    const [month, year] = paymentDetails.expiryDate.split('/');
    const now = new Date();
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiry < now) {
      throw new Error('Card has expired');
    }

    if (!paymentDetails.cvv.match(/^\d{3}$/)) {
      throw new Error('Invalid CVV');
    }

    if (paymentDetails.name.trim().length < 3) {
      throw new Error('Invalid cardholder name');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Validate payment details
      validatePayment();

      // Simulate payment processing with 50% success rate
      await new Promise(resolve => setTimeout(resolve, 1500));
      const success = Math.random() >= 0.5;

      if (!success) {
        throw new Error('Payment failed. Please try again.');
      }

      onPaymentComplete({
        package: currentPackage,
        amount: packages[currentPackage].price,
        last4: paymentDetails.cardNumber.slice(-4),
        cardholderName: paymentDetails.name
      });
    } catch (err) {
      setError(err.message);
      onPaymentFailed(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className={cn(
          "p-4 rounded-lg",
          "bg-red-500/10 border border-red-500/30"
        )}>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Package Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {Object.entries(packages).map(([key, pkg]) => {
          const IconComponent = pkg.icon;
          return (
            <div
              key={key}
              className={cn(
                "p-6 rounded-xl border transition-all cursor-pointer",
                currentPackage === key
                  ? "border-indigo-500 ring-2 ring-indigo-500/20"
                  : "hover:border-indigo-300 dark:border-gray-700 dark:hover:border-gray-600"
              )}
              onClick={() => setCurrentPackage(key)}
            >
              <div className="flex items-center gap-3 mb-4">
                <IconComponent className="w-8 h-8 text-indigo-500" />
                <h3 className="text-xl font-bold">{pkg.name}</h3>
              </div>
              <div className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ${pkg.price}
              </div>
              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={cn(
          "p-6 rounded-xl",
          themeClasses.card,
          themeClasses.border,
          "border"
        )}>
          <h3 className={cn(
            "text-xl font-extrabold mb-6 flex items-center gap-2",
            themeClasses.heading
          )}>
            <CreditCard className="w-5 h-5" />
            Payment Details
          </h3>

          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label
                htmlFor="cardNumber"
                className={cn(
                  "block text-sm font-medium mb-2",
                  themeClasses.text
                )}
              >
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={paymentDetails.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className={cn(
                  "w-full rounded-lg",
                  "bg-navy-800/50 border",
                  error && error.includes('card number')
                    ? "border-red-500"
                    : "border-navy-700",
                  "text-white placeholder-slate-400",
                  "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                  "p-2.5"
                )}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry Date */}
              <div>
                <label
                  htmlFor="expiryDate"
                  className={cn(
                    "block text-sm font-medium mb-2",
                    themeClasses.text
                  )}
                >
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={paymentDetails.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  className={cn(
                    "w-full rounded-lg",
                    "bg-navy-800/50 border",
                    error && error.includes('expired')
                      ? "border-red-500"
                      : "border-navy-700",
                    "text-white placeholder-slate-400",
                    "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                    "p-2.5"
                  )}
                  required
                />
              </div>

              {/* CVV */}
              <div>
                <label
                  htmlFor="cvv"
                  className={cn(
                    "block text-sm font-medium mb-2",
                    themeClasses.text
                  )}
                >
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={paymentDetails.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="3"
                  className={cn(
                    "w-full rounded-lg",
                    "bg-navy-800/50 border",
                    error && error.includes('CVV')
                      ? "border-red-500"
                      : "border-navy-700",
                    "text-white placeholder-slate-400",
                    "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                    "p-2.5"
                  )}
                  required
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label
                htmlFor="name"
                className={cn(
                  "block text-sm font-medium mb-2",
                  themeClasses.text
                )}
              >
                Cardholder Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={paymentDetails.name}
                onChange={handleInputChange}
                placeholder="John Smith"
                className={cn(
                  "w-full rounded-lg",
                  "bg-navy-800/50 border",
                  error && error.includes('name')
                    ? "border-red-500"
                    : "border-navy-700",
                  "text-white placeholder-slate-400",
                  "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                  "p-2.5"
                )}
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={processing}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "px-4 py-3 rounded-lg",
            "text-white font-medium",
            processing ? "opacity-50" : gradientClasses.button,
            "hover:opacity-90 transition-opacity"
          )}
        >
          {processing ? (
            <>
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ${packages[currentPackage].price}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PaymentStep;
