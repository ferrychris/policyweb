import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle, ArrowRight, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const tier = params.get('tier');
    const packageName = params.get('name');
    
    if (success === 'true' && user) {
      toast.success(`Your subscription to ${packageName || 'our service'} has been activated!`);
      fetchSubscriptionDetails();
    }
    
    // Clear URL parameters
    navigate('/payment-success', { replace: true });
  }, [location, user, navigate]);
  
  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          status,
          billing_cycle,
          current_period_start,
          current_period_end,
          package_id,
          packages:package_id (name, price_monthly, price_yearly)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to load subscription details');
      }
      
      if (data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#13091F] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#2E1D4C]/30 rounded-xl overflow-hidden border border-[#2E1D4C]/50 shadow-lg">
          {/* Header */}
          <div className="p-6 md:p-8 text-center border-b border-[#2E1D4C]/50 bg-gradient-to-b from-[#2E1D4C]/30 to-transparent">
            <div className="bg-[#B4A5FF]/20 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-[#B4A5FF]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#E2DDFF] mb-2">
              Payment Successful!
            </h1>
            <p className="text-[#B4A5FF]">
              Thank you for your subscription. Your account has been activated.
            </p>
          </div>
          
          {/* Subscription Details */}
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[#E2DDFF] mb-4">Subscription Details</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B4A5FF]"></div>
              </div>
            ) : subscription ? (
              <div className="space-y-6">
                <div className="bg-[#2E1D4C]/30 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#B4A5FF]">Package</p>
                      <p className="text-[#E2DDFF] font-medium">{subscription.packages?.name || 'Premium Package'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#B4A5FF]">Status</p>
                      <p className="text-[#E2DDFF] font-medium capitalize">{subscription.status || 'Active'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#B4A5FF]">Billing Cycle</p>
                      <p className="text-[#E2DDFF] font-medium capitalize">{subscription.billing_cycle || 'Monthly'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#B4A5FF]">Next Billing Date</p>
                      <p className="text-[#E2DDFF] font-medium">{formatDate(subscription.current_period_end)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-500/10 rounded-lg p-4 flex items-start">
                  <FileText className="text-green-400 mr-3 mt-1 flex-shrink-0 w-5 h-5" />
                  <div>
                    <p className="text-green-400 font-medium">You now have access to premium policies</p>
                    <p className="text-[#B4A5FF] text-sm mt-1">
                      You can now create and manage policies included in your subscription tier.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-[#B4A5FF]">No subscription details found. Your account may still be processing.</p>
              </div>
            )}
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/dashboard/policies')}
                className="flex items-center justify-center px-6 py-3 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors w-full"
              >
                Go to Policies
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-[#2E1D4C]/50 text-[#B4A5FF] rounded-lg hover:bg-[#2E1D4C]/70 transition-colors w-full"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 