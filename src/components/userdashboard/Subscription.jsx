import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaCreditCard, FaFileInvoiceDollar, FaRegClock, FaArrowRight } from 'react-icons/fa';
import { getUserSubscription } from '../../lib/userService';
import { getPackagesFromDatabase } from '../../lib/policySettings';

const Subscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Get current subscription
        const userSubscription = getUserSubscription();
        setSubscription(userSubscription);
        
        // Get package details
        if (userSubscription) {
          const packages = getPackagesFromDatabase();
          const pkg = packages.find(p => p.key === userSubscription.packageKey);
          setCurrentPackage(pkg);
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-indigo-500" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!subscription || !currentPackage) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">No Active Subscription</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have an active subscription yet. Choose a package to get started.
          </p>
          <Link
            to="/packages"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity inline-block"
          >
            View Packages
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Subscription</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Current Plan</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            subscription.packageKey === 'premium' 
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' 
              : subscription.packageKey === 'professional' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          }`}>
            Active
          </span>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{currentPackage.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">{currentPackage.description}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">${currentPackage.price}</span>
              <span className="text-gray-500 dark:text-gray-400">/month</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start">
              <FaRegClock className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Renewal Date</h4>
                <p className="text-gray-600 dark:text-gray-400">{formatDate(subscription.expiresAt)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FaCreditCard className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Payment Method</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {subscription.paymentMethod.type === 'credit_card' 
                    ? `Credit Card ending in ${subscription.paymentMethod.last4}` 
                    : 'PayPal'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link
              to="/packages"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Change Plan
            </Link>
            
            <button
              className="px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors dark:bg-gray-700 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-gray-600"
            >
              Update Payment
            </button>
            
            <button
              className="px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600"
            >
              {subscription.autoRenew ? 'Cancel Auto-Renewal' : 'Enable Auto-Renewal'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Plan Features */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Plan Features</h2>
        </div>
        
        <div className="p-6">
          <ul className="space-y-3">
            {currentPackage.features?.map((feature, index) => (
              <li key={index} className="flex items-start">
                <FaCheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/packages"
              className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
            >
              View all packages
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Billing History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Billing History</h2>
        </div>
        
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-4 text-gray-900 dark:text-gray-100">{formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))}</td>
                <td className="py-4 text-gray-900 dark:text-gray-100">${currentPackage.price}</td>
                <td className="py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium dark:bg-green-900/20 dark:text-green-400">
                    Paid
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                    <FaFileInvoiceDollar className="w-5 h-5" />
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-4 text-gray-900 dark:text-gray-100">{formatDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))}</td>
                <td className="py-4 text-gray-900 dark:text-gray-100">${currentPackage.price}</td>
                <td className="py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium dark:bg-green-900/20 dark:text-green-400">
                    Paid
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                    <FaFileInvoiceDollar className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
