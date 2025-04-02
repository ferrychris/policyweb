import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Header from '../components/Navigation';
import Footer from '../components/Footer';
import { PRICING_PACKAGES } from '../lib/policySettings';
import { getUserSubscription } from '../lib/userService';

const Pricing = () => {
  const [userSubscription, setUserSubscription] = useState(null);
  const packages = Object.keys(PRICING_PACKAGES).map(key => ({
    key,
    ...PRICING_PACKAGES[key],
  }));
  
  useEffect(() => {
    // Get user subscription if logged in
    try {
      const subscription = getUserSubscription();
      setUserSubscription(subscription);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    }
  }, []);

  // Function to determine button text and style based on user's current subscription
  const getButtonProps = (packageKey) => {
    if (!userSubscription || !userSubscription.active) {
      return {
        text: 'Get Started',
        link: '/login?redirect=packages',
        color: 'bg-gradient-to-r from-indigo-600 to-purple-600'
      };
    }
    
    if (userSubscription.packageKey === packageKey) {
      return {
        text: 'Current Plan',
        link: '/dashboard/subscription',
        color: 'bg-green-600'
      };
    }
    
    // If user has premium, don't allow downgrading
    if (userSubscription.packageKey === 'premium' && (packageKey === 'professional' || packageKey === 'basic')) {
      return {
        text: 'Contact Support to Downgrade',
        link: '/contact',
        color: 'bg-gray-500'
      };
    }
    
    // If user has professional, don't allow downgrading to basic
    if (userSubscription.packageKey === 'professional' && packageKey === 'basic') {
      return {
        text: 'Contact Support to Downgrade',
        link: '/contact',
        color: 'bg-gray-500'
      };
    }
    
    return {
      text: 'Upgrade',
      link: `/dashboard/packages?upgrade=${packageKey}`,
      color: 'bg-gradient-to-r from-indigo-600 to-purple-600'
    };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Choose the Right Plan for Your Organization
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our pricing plans are designed to scale with your AI governance needs, from essential policies to comprehensive frameworks.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => {
              const buttonProps = getButtonProps(pkg.key);
              
              return (
                <div 
                  key={pkg.key}
                  className={`
                    rounded-2xl overflow-hidden shadow-lg transition-all duration-300 
                    ${pkg.key === 'professional' ? 'md:scale-105 border-2 border-indigo-500 dark:border-indigo-400' : 'border border-gray-200 dark:border-gray-700'}
                    bg-white dark:bg-gray-800 hover:shadow-xl
                  `}
                >
                  <div className="p-8">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                      {pkg.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 h-12">
                      {pkg.name === 'Basic Package' ? 'Essential AI policies for small businesses' :
                       pkg.name === 'Professional Package' ? 'Comprehensive AI governance for growing organizations' :
                       'Enterprise-grade AI risk management solution'}
                    </p>
                    
                    <div className="flex items-end mb-8">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">${pkg.price}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2 pb-1">/year</span>
                    </div>
                    
                    <Link
                      to={buttonProps.link}
                      className={`
                        block w-full py-3 px-4 rounded-lg text-center text-white font-semibold mb-8
                        ${buttonProps.color} hover:opacity-90 transition-opacity
                      `}
                    >
                      {buttonProps.text}
                    </Link>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">
                        Included Policies:
                      </h4>
                      <ul className="space-y-3">
                        {pkg.features.map((policy, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {policy}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {pkg.key === 'professional' && (
                    <div className="bg-indigo-600 text-white py-2 px-4 text-center text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-16 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Need a Custom Solution?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              If you have unique requirements or need a tailored AI governance framework, we're here to help.
            </p>
            <Link
              to="/contact"
              className="inline-block py-3 px-8 rounded-lg bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              Contact Our Team
            </Link>
          </div>
          
          <div className="mt-20 max-w-4xl mx-auto bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Can I switch between plans?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, you can upgrade your plan at any time. Downgrading requires contacting our support team.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  How are the policies delivered?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All policies are available immediately in your dashboard for customization, download, and implementation.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Do you offer refunds?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We offer a 14-day satisfaction guarantee. If you're not satisfied, contact us for a full refund.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Can I customize the policies?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, all policies can be fully customized to match your organization's specific needs and branding.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
