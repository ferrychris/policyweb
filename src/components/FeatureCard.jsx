import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="relative p-6 rounded-lg transition-all hover:shadow-lg dark:hover:shadow-indigo-500/10">
      <dt>
        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md gradient-bg text-white dark:bg-opacity-90">
          <i className={`fas ${icon}`}></i>
        </div>
        <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-dark-heading">{title}</p>
      </dt>
      <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-dark-text">{description}</dd>
    </div>
  );
};

export default FeatureCard;
