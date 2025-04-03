import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSubscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setSubscription(null);
                return;
            }

            const { data: subscriptionData, error: subscriptionError } = await supabase
                .from('subscriptions')
                .select(`
                    *,
                    packages (*)
                `)
                .eq('user_id', session.user.id)
                .single();

            if (subscriptionError) throw subscriptionError;

            setSubscription(subscriptionData);
        } catch (err) {
            console.error('Error fetching subscription:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkFeatureAccess = (feature) => {
        if (!subscription || !subscription.packages) return false;

        const features = Array.isArray(subscription.packages.features)
            ? subscription.packages.features
            : JSON.parse(subscription.packages.features || '[]');

        return features.includes(feature);
    };

    const getUsageLimit = (feature) => {
        if (!subscription || !subscription.packages) return 0;
        
        const limits = {
            'policy_generations': {
                'Starter': 1,
                'Professional': 10,
                'Enterprise': Infinity
            },
            'team_members': {
                'Starter': 5,
                'Professional': Infinity,
                'Enterprise': Infinity
            }
        };

        return limits[feature]?.[subscription.packages.name] || 0;
    };

    const isFeatureEnabled = (feature) => {
        if (!subscription) return false;
        return checkFeatureAccess(feature);
    };

    return {
        subscription,
        loading,
        error,
        isFeatureEnabled,
        getUsageLimit,
        refreshSubscription: fetchSubscription
    };
};

export const FEATURES = {
    POLICY_GENERATION: 'policy_generation',
    TEAM_MANAGEMENT: 'team_management',
    CUSTOM_BRANDING: 'custom_branding',
    API_ACCESS: 'api_access',
    ADVANCED_ANALYTICS: 'advanced_analytics',
    PRIORITY_SUPPORT: 'priority_support'
}; 