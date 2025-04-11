import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSubscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    // Get the current user
    useEffect(() => {
        const getUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
            }
        };

        getUserSession();
        
        // Set up auth listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    setUser(session.user);
                } else {
                    setUser(null);
                    setSubscription(null);
                }
            }
        );

        return () => {
            if (authListener) authListener.subscription.unsubscribe();
        };
    }, []);

    // Fetch subscription when user changes
    useEffect(() => {
        if (user) {
            fetchSubscription();
        } else {
            setSubscription(null);
            setLoading(false);
        }
    }, [user]);

    const fetchSubscription = async () => {
        try {
            if (!user) {
                setSubscription(null);
                setLoading(false);
                return;
            }

            const { data: subscriptionData, error: subscriptionError } = await supabase
                .from('user_subscriptions')
                .select(`
                    *,
                    packages (*)
                `)
                .eq('user_id', user.id)
                .single();

            if (subscriptionError && subscriptionError.code !== 'PGRST116') {
                throw subscriptionError;
            }

            setSubscription(subscriptionData || null);
        } catch (err) {
            console.error('Error fetching subscription:', err);
            setError(err.message);
            setSubscription(null);
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