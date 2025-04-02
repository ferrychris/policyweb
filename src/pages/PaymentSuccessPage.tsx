import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheck, faRocket, faFileAlt, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { getSubscriptionStatus } from '../lib/stripe';
import { cn } from '../lib/utils';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const subscriptionId = searchParams.get('subscription_id');

  React.useEffect(() => {
    async function checkSubscription() {
      if (!subscriptionId) {
        navigate('/pricing');
        return;
      }

      try {
        const status = await getSubscriptionStatus(subscriptionId);
        if (status === 'active' || status === 'trialing') {
          setLoading(false);
        } else {
          throw new Error('Subscription is not active');
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setError(error instanceof Error ? error.message : 'Failed to verify subscription');
        setTimeout(() => navigate('/pricing'), 3000);
      }
    }

    checkSubscription();
  }, [subscriptionId, navigate]);

  if (loading || error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center p-4">
        {loading ? (
          <FontAwesomeIcon 
            icon={faSpinner} 
            className="h-12 w-12 text-indigo-500 animate-spin" 
          />
        ) : (
          <>
            <div className="text-red-600 dark:text-red-400 text-lg font-medium mb-4">
              {error}
            </div>
            <div className="text-gray-500 dark:text-dark-text">
              Redirecting you back to pricing...
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "bg-white dark:bg-dark-card rounded-lg shadow-lg p-8 text-center",
          "transform transition-all duration-500 animate-fade-in-up"
        )}>
          <div className={cn(
            "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6",
            "bg-gradient-to-r from-green-100 to-green-200",
            "dark:from-green-900 dark:to-green-800"
          )}>
            <FontAwesomeIcon
              icon={faCheck}
              className="w-8 h-8 text-green-600 dark:text-green-400"
            />
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-dark-heading mb-4">
            Welcome to FinePolicy!
          </h1>

          <p className="text-xl text-gray-500 dark:text-dark-text mb-8">
            Your subscription has been activated successfully. You now have full access to all features.
          </p>

          <div className="space-y-4">
            <a
              href="/launchpad"
              className={cn(
                "block w-full py-3 px-6 rounded-lg font-medium",
                "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
                "hover:from-indigo-500 hover:to-purple-500",
                "transition-all duration-200 transform hover:scale-[1.02]",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              )}
            >
              <div className="flex items-center justify-center space-x-2">
                <FontAwesomeIcon icon={faRocket} />
                <span>Go to Launchpad</span>
              </div>
            </a>
            
            <a
              href="/templates"
              className={cn(
                "block w-full py-3 px-6 rounded-lg font-medium",
                "bg-indigo-100 text-indigo-600",
                "dark:bg-indigo-900 dark:text-indigo-300",
                "hover:bg-indigo-200 dark:hover:bg-indigo-800",
                "transition-all duration-200 transform hover:scale-[1.02]",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              )}
            >
              <div className="flex items-center justify-center space-x-2">
                <FontAwesomeIcon icon={faFileAlt} />
                <span>Browse Templates</span>
              </div>
            </a>
          </div>

          <div className="mt-8 text-sm text-gray-500 dark:text-dark-text">
            Need help getting started?{' '}
            <a 
              href="/install" 
              className={cn(
                "text-indigo-600 dark:text-indigo-400",
                "hover:text-indigo-700 dark:hover:text-indigo-300",
                "transition-colors duration-200"
              )}
            >
              View our installation guide
            </a>
          </div>
        </div>

        <div className={cn(
          "mt-8 bg-white dark:bg-dark-card rounded-lg shadow-lg p-8",
          "transform transition-all duration-500 animate-fade-in-up delay-200"
        )}>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-dark-heading mb-6">
            Next Steps
          </h2>
          <div className="space-y-6">
            {[
              {
                icon: faRocket,
                title: "Set Up Your Environment",
                description: "Follow our quick installation guide to set up your development environment."
              },
              {
                icon: faFileAlt,
                title: "Choose Your Templates",
                description: "Browse our collection of policy templates and select the ones that fit your needs."
              },
              {
                icon: faWandMagicSparkles,
                title: "Generate Your First Policy",
                description: "Use our AI-powered generator to create your first customized policy."
              }
            ].map((step, index) => (
              <div key={index} className="flex items-start group">
                <div className="flex-shrink-0">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    "bg-gradient-to-r from-indigo-100 to-purple-100",
                    "dark:from-indigo-900 dark:to-purple-900",
                    "text-indigo-600 dark:text-indigo-400",
                    "transition-all duration-200 group-hover:scale-110"
                  )}>
                    <FontAwesomeIcon icon={step.icon} className="w-4 h-4" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-dark-heading">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-gray-500 dark:text-dark-text">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
