import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPackagesFromDatabase } from '../../lib/policySettings';
import { getUserSubscription } from '../../lib/userService';
import { FaArrowLeft, FaCreditCard, FaLock, FaCheckCircle } from 'react-icons/fa';

const PaymentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const packageKey = params.get('package');
    
    if (packageKey) {
      const packages = getPackagesFromDatabase();
      const foundPackage = packages.find(pkg => pkg.key === packageKey);
      setSelectedPackage(foundPackage);
    }
    
    const subscription = getUserSubscription();
    setCurrentSubscription(subscription);
  }, [location.search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    }
    
    if (!formData.cardNumber.trim()) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Invalid card number';
    }
    
    if (!formData.expiryDate.trim()) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      errors.expiryDate = 'Invalid format (MM/YY)';
    }
    
    if (!formData.cvv.trim()) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      errors.cvv = 'Invalid CVV';
    }
    
    if (!formData.billingAddress.trim()) {
      errors.billingAddress = 'Billing address is required';
    }
    
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!formData.zipCode.trim()) {
      errors.zipCode = 'ZIP code is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/dashboard/subscription');
      }, 3000);
    }, 2000);
  };

  if (!selectedPackage) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Package Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The package you're trying to purchase could not be found. Please go back and try again.
          </p>
          <button
            onClick={() => navigate('/dashboard/packages')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <FaArrowLeft className="inline mr-2" />
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Complete Your Payment</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Provide your payment details to {currentSubscription ? 'update your subscription' : 'subscribe'} to the {selectedPackage.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          {success ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Payment Successful!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your subscription has been {currentSubscription ? 'updated' : 'activated'}. You will be redirected to your subscription page shortly.
              </p>
              <div className="animate-pulse text-indigo-600 dark:text-indigo-400">
                Redirecting...
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Payment Details</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Card Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Card Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cardholder Name
                      </label>
                      <input 
                        type="text"
                        id="cardholderName"
                        name="cardholderName"
                        value={formData.cardholderName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                          formErrors.cardholderName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="John Smith"
                      />
                      {formErrors.cardholderName && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.cardholderName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input 
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 pl-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                            formErrors.cardNumber ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="1234 5678 9012 3456"
                        />
                        <FaCreditCard className="absolute left-3 top-3 text-gray-400" />
                        {formErrors.cardNumber && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.cardNumber}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Expiry Date
                        </label>
                        <input 
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                            formErrors.expiryDate ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="MM/YY"
                        />
                        {formErrors.expiryDate && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.expiryDate}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          CVV
                        </label>
                        <input 
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                            formErrors.cvv ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="123"
                        />
                        {formErrors.cvv && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Billing Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Billing Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Billing Address
                      </label>
                      <input 
                        type="text"
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                          formErrors.billingAddress ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="123 Main St"
                      />
                      {formErrors.billingAddress && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.billingAddress}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          City
                        </label>
                        <input 
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                            formErrors.city ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="New York"
                        />
                        {formErrors.city && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          State
                        </label>
                        <input 
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                            formErrors.state ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="NY"
                        />
                        {formErrors.state && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ZIP Code
                        </label>
                        <input 
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                            formErrors.zipCode ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="10001"
                        />
                        {formErrors.zipCode && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.zipCode}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Country
                        </label>
                        <select 
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                          <option value="AU">Australia</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center"
                  >
                    {processing ? (
                      <>
                        <span className="mr-2">Processing...</span>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      </>
                    ) : (
                      <>
                        <FaLock className="mr-2" />
                        Pay ${selectedPackage.price}
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                    Your payment information is secure. We use encryption to protect your data.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden sticky top-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Order Summary</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{selectedPackage.name}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{selectedPackage.description}</p>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subscription</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">${selectedPackage.price}</span>
                </div>
                
                {currentSubscription && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Credit</span>
                    <span className="font-medium text-green-600 dark:text-green-400">-$0.00</span>
                  </div>
                )}
                
                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Total (Monthly)</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">${selectedPackage.price}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Included Features</h4>
                <ul className="space-y-2">
                  {selectedPackage.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <FaCheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                  {selectedPackage.features.length > 4 && (
                    <li className="text-sm text-indigo-600 dark:text-indigo-400">
                      +{selectedPackage.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
