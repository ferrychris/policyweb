import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { AlertTriangle } from 'lucide-react';

const SubscriptionGate = ({
    feature,
    children,
    fallback,
    showUpgradeMessage = true
}) => {
    const { isFeatureEnabled, loading } = useSubscription();

    if (loading) {
        return null;
    }

    if (!isFeatureEnabled(feature)) {
        if (fallback) {
            return fallback;
        }

        if (showUpgradeMessage) {
            return (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-900/50 rounded-lg border border-[#B4A5FF]/20">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Feature Not Available
                    </h3>
                    <p className="text-gray-400 text-center mb-4">
                        This feature requires a higher subscription tier.
                    </p>
                    <button
                        onClick={() => window.location.href = '/settings/subscription'}
                        className="px-4 py-2 bg-[#4B3B7C] text-white rounded-lg hover:bg-[#B4A5FF] transition-colors"
                    >
                        Upgrade Plan
                    </button>
                </div>
            );
        }

        return null;
    }

    return children;
};

export default SubscriptionGate; 