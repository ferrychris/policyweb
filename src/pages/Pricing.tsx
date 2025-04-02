import React from 'react';
import PricingWithPayment from '../components/PricingWithPayment';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header Section */}
      <div className="pt-16 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-dark-text max-w-3xl mx-auto">
          Choose your plan and start generating AI-powered policies today. 
          All plans include a 14-day free trial.
        </p>
      </div>

      {/* FAQ Section - Above Pricing */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-heading mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-heading mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-500 dark:text-dark-text">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-heading mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-500 dark:text-dark-text">
                We accept all major credit cards, Apple Pay, and can arrange enterprise billing for larger organizations.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-heading mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-500 dark:text-dark-text">
                Yes, all plans come with a 14-day free trial. You can explore all features risk-free.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Component */}
      <PricingWithPayment />

      {/* CTA Section - Below Pricing */}
      <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Our enterprise team is ready to help you find the perfect solution for your organization.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-indigo-600 py-3 px-8 rounded-lg font-medium 
                     hover:bg-indigo-50 transition-colors shadow-md"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
}
