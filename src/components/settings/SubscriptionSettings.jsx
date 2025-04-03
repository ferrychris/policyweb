import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useSubscription, FEATURES } from '../../hooks/useSubscription';
import PackageSection from '../landing/PackageSection';

const SubscriptionSettings = () => {
    const { subscription, loading, error, isFeatureEnabled, getUsageLimit } = useSubscription();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B4A5FF]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Current Subscription Status */}
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#B4A5FF]/20">
                <h2 className="text-2xl font-bold text-white mb-4">Current Subscription</h2>
                {subscription ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-white">
                                    {subscription.packages?.name || 'Unknown Package'}
                                </h3>
                                <p className="text-gray-400">
                                    {subscription.packages?.description}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-white">
                                    ${subscription.packages?.price}
                                    <span className="text-sm text-gray-400 ml-1">
                                        /{subscription.packages?.billing_period}
                                    </span>
                                </p>
                                <p className="text-sm text-gray-400">
                                    Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Feature Access */}
                        <div className="border-t border-gray-800 pt-4 mt-4">
                            <h4 className="text-lg font-semibold text-white mb-3">Features & Limits</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h5 className="text-sm font-medium text-gray-400">Policy Generations</h5>
                                    <div className="flex items-center">
                                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                                            <div
                                                className="bg-[#B4A5FF] h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(
                                                        (subscription.usage?.policy_generations || 0) /
                                                        getUsageLimit('policy_generations') * 100,
                                                        100
                                                    )}%`
                                                }}
                                            />
                                        </div>
                                        <span className="ml-2 text-sm text-gray-400">
                                            {subscription.usage?.policy_generations || 0}/
                                            {getUsageLimit('policy_generations') === Infinity ? '∞' : getUsageLimit('policy_generations')}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h5 className="text-sm font-medium text-gray-400">Team Members</h5>
                                    <div className="flex items-center">
                                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                                            <div
                                                className="bg-[#B4A5FF] h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(
                                                        (subscription.usage?.team_members || 0) /
                                                        getUsageLimit('team_members') * 100,
                                                        100
                                                    )}%`
                                                }}
                                            />
                                        </div>
                                        <span className="ml-2 text-sm text-gray-400">
                                            {subscription.usage?.team_members || 0}/
                                            {getUsageLimit('team_members') === Infinity ? '∞' : getUsageLimit('team_members')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                {Object.values(FEATURES).map((feature) => (
                                    <div
                                        key={feature}
                                        className="flex items-center space-x-2 text-sm"
                                    >
                                        {isFeatureEnabled(feature) ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-gray-500" />
                                        )}
                                        <span className={isFeatureEnabled(feature) ? 'text-white' : 'text-gray-500'}>
                                            {feature.split('_').map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No Active Subscription</h3>
                        <p className="text-gray-400 mb-4">
                            Choose a plan below to get started with our premium features.
                        </p>
                    </div>
                )}
            </div>

            {/* Available Plans */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-white mb-6">Available Plans</h2>
                <PackageSection />
            </div>
        </div>
    );
};

export default SubscriptionSettings; 