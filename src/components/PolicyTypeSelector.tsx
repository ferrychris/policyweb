import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faHome, faHeartPulse, faUserShield } from '@fortawesome/free-solid-svg-icons';

interface PolicyType {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: any;
}

const policyTypes: PolicyType[] = [
  {
    id: 'auto',
    title: 'Auto Insurance',
    description: 'Coverage for your vehicles',
    path: '/auto',
    icon: faCar,
  },
  {
    id: 'home',
    title: 'Home Insurance',
    description: 'Protection for your property',
    path: '/home',
    icon: faHome,
  },
  {
    id: 'life',
    title: 'Life Insurance',
    description: 'Financial security for your loved ones',
    path: '/life',
    icon: faUserShield,
  },
  {
    id: 'health',
    title: 'Health Insurance',
    description: 'Medical coverage for you and your family',
    path: '/health',
    icon: faHeartPulse,
  },
];

export default function PolicyTypeSelector() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Select Your Policy Type
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-500 dark:text-dark-text max-w-2xl mx-auto">
            Choose the insurance coverage that best fits your needs
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {policyTypes.map((policy) => (
            <Link
              key={policy.id}
              to={policy.path}
              className="group relative"
            >
              <div className="h-full rounded-2xl bg-white dark:bg-dark-card shadow-lg 
                            transition-all duration-300 ease-in-out 
                            border-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400
                            hover:shadow-xl transform hover:-translate-y-1">
                <div className="p-8">
                  <div className="inline-flex items-center justify-center p-4 
                                bg-gradient-to-r from-indigo-600/10 to-purple-600/10 
                                dark:from-indigo-600/20 dark:to-purple-600/20
                                rounded-2xl text-3xl mb-5">
                    <FontAwesomeIcon 
                      icon={policy.icon} 
                      className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-heading 
                               group-hover:text-indigo-600 dark:group-hover:text-indigo-400
                               transition-colors duration-300">
                    {policy.title}
                  </h2>
                  <p className="mt-4 text-lg text-gray-500 dark:text-dark-text">
                    {policy.description}
                  </p>
                  <div className="mt-6 inline-flex items-center text-indigo-600 dark:text-indigo-400">
                    <span className="font-medium">Get started</span>
                    <svg className="ml-2 w-5 h-5 transition-transform duration-300 
                                  transform group-hover:translate-x-1" 
                         fill="currentColor" 
                         viewBox="0 0 20 20">
                      <path fillRule="evenodd" 
                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
                            clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 
                       rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 sm:py-16 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Not sure which policy is right for you?
            </h2>
            <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
              Our insurance experts are here to help you find the perfect coverage for your needs.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center justify-center px-8 py-3
                       border border-transparent text-base font-medium rounded-md
                       text-indigo-600 bg-white hover:bg-indigo-50 
                       transition-colors duration-300
                       sm:w-auto"
            >
              Talk to an Expert
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
