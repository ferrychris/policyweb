import React from 'react';
import { motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

const Pricing = () => {
    const packages = [
        {
            name: 'Basic',
            price: '$29',
            period: 'month',
            description: 'Perfect for small businesses',
            features: [
                'Up to 5 policies',
                'Basic policy templates',
                'Email support',
                'Basic analytics',
                'Standard export formats'
            ],
            buttonText: 'Get Started',
            buttonLink: '/register',
            popular: false
        },
        {
            name: 'Professional',
            price: '$79',
            period: 'month',
            description: 'Ideal for growing businesses',
            features: [
                'Unlimited policies',
                'Advanced policy templates',
                'Priority email support',
                'Advanced analytics',
                'All export formats',
                'Custom branding',
                'Team collaboration',
                'API access'
            ],
            buttonText: 'Get Started',
            buttonLink: '/register',
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: 'month',
            description: 'For large organizations',
            features: [
                'Everything in Professional',
                'Dedicated account manager',
                'Custom policy templates',
                '24/7 phone support',
                'Custom integrations',
                'SLA guarantees',
                'Advanced security features',
                'Custom training'
            ],
            buttonText: 'Contact Sales',
            buttonLink: '/contact',
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-end mb-8">
                    <Link
                        to="/dashboard/new-policy"
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-lg",
                            "bg-gradient-to-r from-indigo-600 to-purple-600",
                            "text-white font-medium",
                            "hover:from-indigo-700 hover:to-purple-700",
                            "transition-all duration-200 shadow-md hover:shadow-lg"
                        )}
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create New Policy</span>
                    </Link>
                </div>

                <div className="text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl"
                    >
                        Simple, transparent pricing
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400"
                    >
                        Choose the perfect plan for your business needs
                    </motion.p>
                </div>

                <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
                    {packages.map((pkg, index) => (
                        <motion.div
                            key={pkg.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                            className={`border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700 ${pkg.popular ? 'ring-2 ring-indigo-500' : ''
                                }`}
                        >
                            <div className="p-6">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">
                                    {pkg.name}
                                </h2>
                                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                    {pkg.description}
                                </p>
                                <p className="mt-8">
                                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                                        {pkg.price}
                                    </span>
                                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                                        /{pkg.period}
                                    </span>
                                </p>
                                <Link
                                    to={pkg.buttonLink}
                                    className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${pkg.popular
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30'
                                        }`}
                                >
                                    {pkg.buttonText}
                                </Link>
                                {pkg.popular && (
                                    <p className="mt-6 text-sm text-indigo-600 dark:text-indigo-400 text-center">
                                        Most popular choice
                                    </p>
                                )}
                            </div>
                            <div className="pt-6 pb-8 px-6">
                                <h3 className="text-xs font-semibold text-gray-900 dark:text-white tracking-wide uppercase">
                                    What's included
                                </h3>
                                <ul className="mt-6 space-y-4">
                                    {pkg.features.map((feature) => (
                                        <li key={feature} className="flex space-x-3">
                                            <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing; 