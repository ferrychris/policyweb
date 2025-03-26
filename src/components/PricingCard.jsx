import React from 'react';
import Button from './Button';
import Card from './Card';

const PricingCard = ({
  title,
  price,
  description,
  features,
  isPopular = false,
  ctaText = 'Start Free Trial',
  ctaLink = '/launchpad',
  trialDays = 14
}) => {
  return (
    <Card 
      className={`relative flex flex-col ${
        isPopular 
          ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-xl dark:shadow-indigo-500/10' 
          : ''
      }`}
      hover
      border
      padding="none"
    >
      {isPopular && (
        <div className="absolute -top-5 inset-x-0 flex justify-center">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform hover:scale-105 transition-transform">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-heading">
          {title}
        </h3>
        
        <div className="mt-4 flex items-baseline">
          {price === 'Custom' ? (
            <span className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-dark-heading">
              Custom
            </span>
          ) : (
            <>
              <span className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-dark-heading">
                ${price}
              </span>
              <span className="ml-1 text-2xl font-medium text-gray-500 dark:text-dark-text">
                /month
              </span>
            </>
          )}
        </div>

        <p className="mt-4 text-lg text-gray-500 dark:text-dark-text">
          {description}
        </p>

        {trialDays > 0 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-dark-text">
            <i className="fas fa-clock mr-1 text-indigo-500 dark:text-indigo-400"></i>
            {trialDays}-day free trial
          </p>
        )}
      </div>

      <div className="flex-grow p-8 bg-gray-50 dark:bg-dark-border space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0">
              <i className="fas fa-check-circle text-indigo-500 dark:text-indigo-400 mt-1"></i>
            </div>
            <p className="ml-3 text-base text-gray-500 dark:text-dark-text">
              {feature}
            </p>
          </div>
        ))}
      </div>

      <div className="px-8 pb-8 pt-4 bg-gray-50 dark:bg-dark-border">
        <Button
          variant={isPopular ? 'primary' : 'outline'}
          to={ctaLink}
          className="w-full justify-center"
          size="lg"
        >
          {ctaText}
        </Button>
      </div>
    </Card>
  );
};

export default PricingCard;
