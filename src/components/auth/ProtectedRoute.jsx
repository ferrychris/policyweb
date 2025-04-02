import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If user is not authenticated, redirect to login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check subscription status
    const checkSubscription = async () => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('subscription_status, subscription_end_date')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            // If subscription is expired or inactive, redirect to pricing
            if (!profile.subscription_status ||
                (profile.subscription_end_date && new Date(profile.subscription_end_date) < new Date())) {
                return <Navigate to="/pricing" replace />;
            }

            return null;
        } catch (error) {
            console.error('Error checking subscription:', error);
            return null;
        }
    };

    // Render protected content
    return children;
};

export default ProtectedRoute; 