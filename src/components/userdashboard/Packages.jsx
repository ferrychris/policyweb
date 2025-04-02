import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPackagesFromDatabase } from '../../lib/policySettings';
import { getUserSubscription } from '../../lib/userService';
import { CheckCircle, Shield, Zap, Package, AlertTriangle, Lock } from 'lucide-react';
import { cn, themeClasses, gradientClasses } from '../../lib/utils';
import { toast } from 'sonner';

const PackageCard = ({ packageData, isCurrentPlan, onSelect, selectedPackage }) => {
  const isSelected = selectedPackage === packageData.key;
  const isPremium = packageData.key === 'premium';
  
  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300",
        "border shadow-lg hover:shadow-xl",
        isCurrentPlan ? "border-cyan-500 dark:border-cyan-400" : 
                      isSelected ? "border-indigo-500 dark:border-indigo-400" : 
                      "border-gray-200 dark:border-gray-700",
        isPremium ? "transform hover:-translate-y-1" : ""
      )}
    >
      {/* Package Header */}
      <div className={cn(
        "p-6",
        isCurrentPlan ? "bg-cyan-50 dark:bg-cyan-900/20" : 
                    isPremium ? "bg-gradient-to-r from-indigo-600/10 to-purple-600/10 dark:from-indigo-900/30 dark:to-purple-900/30" : 
                    ""
      )}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {packageData.name}
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${packageData.price}
              <span className="text-sm text-gray-500 dark:text-gray-400 font-normal ml-1">/year</span>
            </p>
          </div>
          <span className={cn(
            "p-2.5 rounded-full",
            packageData.key === 'basic' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
            packageData.key === 'professional' ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" :
            "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          )}>
            {packageData.key === 'basic' ? <Package className="w-5 h-5" /> : 
             packageData.key === 'professional' ? <Shield className="w-5 h-5" /> : 
             <Zap className="w-5 h-5" />}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {packageData.key === 'basic' ? 
            'Essential AI policies for small businesses' : 
            packageData.key === 'professional' ? 
            'Comprehensive AI governance for growing organizations' : 
            'Enterprise-grade AI risk management solution'}
        </p>
        
        {isCurrentPlan ? (
          <div className="w-full px-4 py-2.5 bg-cyan-500 text-white rounded-lg text-center font-medium">
            Current Plan
          </div>
        ) : (
          <button
            onClick={() => onSelect(packageData.key)}
            className={cn(
              "w-full px-4 py-2.5 rounded-lg text-center font-medium transition-all",
              isSelected ? 
                "bg-indigo-600 text-white" : 
                "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400"
            )}
          >
            {isSelected ? "✓ Selected" : "Select Package"}
          </button>
        )}
      </div>
      
      {/* Features */}
      <div className="p-6">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider mb-4">
          Included Policies:
        </h4>
        <ul className="space-y-3">
          {packageData.features.map((feature, idx) => (
            <li key={idx} className="flex items-start text-sm">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        {/* Policy Limit */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Policy Limit:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {packageData.policyLimit === -1 ? 'Unlimited' : packageData.policyLimit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Packages = () => {
  const [searchParams] = useSearchParams();
  const upgradeParam = searchParams.get('upgrade');
  
  const [packages, setPackages] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(upgradeParam || null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [detailedPackage, setDetailedPackage] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Get all packages
        const allPackages = getPackagesFromDatabase();
        setPackages(allPackages);

        // Get current subscription
        const subscription = getUserSubscription();
        setCurrentSubscription(subscription);
        
        // Set detailed package if upgrade param exists
        if (upgradeParam) {
          const packageToUpgrade = allPackages.find(pkg => pkg.key === upgradeParam);
          if (packageToUpgrade) {
            setDetailedPackage(packageToUpgrade);
            setShowDetails(true);
          }
        }
      } catch (error) {
        console.error('Error loading packages:', error);
        toast.error('Failed to load package information');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [upgradeParam]);

  const handlePackageSelect = (packageKey) => {
    setSelectedPackage(packageKey);
    
    // If user selects their current package, show a message
    if (currentSubscription?.packageKey === packageKey) {
      toast.info('This is your current package');
      return;
    }
    
    // Find the package details
    const selectedPkg = packages.find(pkg => pkg.key === packageKey);
    if (selectedPkg) {
      setDetailedPackage(selectedPkg);
      setShowDetails(true);
    }
  };

  const handleProceedToPayment = () => {
    // Redirect to payment page with the selected package
    window.location.href = `/payment?package=${selectedPackage}`;
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setDetailedPackage(null);
  };
  
  const isUpgradeForbidden = (targetPackage) => {
    // Logic to determine if upgrade/downgrade is forbidden
    if (!currentSubscription) return false;
    
    const currentPackageKey = currentSubscription.packageKey;
    
    // Cannot downgrade from premium to lower tiers
    if (currentPackageKey === 'premium' && (targetPackage === 'professional' || targetPackage === 'basic')) {
      return true;
    }
    
    // Cannot downgrade from professional to basic
    if (currentPackageKey === 'professional' && targetPackage === 'basic') {
      return true;
    }
    
    return false;
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className={cn(
          "text-3xl font-bold mb-3",
          themeClasses.heading
        )}>
          Policy Packages
        </h1>
        <p className={cn(
          "text-lg max-w-3xl",
          themeClasses.text
        )}>
          Choose the package that best fits your organization's AI governance needs
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-t-indigo-500 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Current subscription highlight */}
          {currentSubscription && (
            <div className={cn(
              "mb-8 p-6 rounded-xl",
              "bg-cyan-50 dark:bg-cyan-900/20",
              "border border-cyan-200 dark:border-cyan-800"
            )}>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <span className={cn(
                    "inline-block px-3 py-1 rounded-full text-sm font-medium mb-2",
                    "bg-cyan-100 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200"
                  )}>
                    Current Plan
                  </span>
                  <h2 className={cn(
                    "text-xl font-bold mb-1",
                    themeClasses.heading
                  )}>
                    {packages.find(pkg => pkg.key === currentSubscription.packageKey)?.name || 'Unknown Package'}
                  </h2>
                  <p className={themeClasses.text}>
                    Renews on {new Date(currentSubscription.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <Link 
                  to="/subscription" 
                  className={cn(
                    "mt-4 md:mt-0 flex items-center font-medium",
                    "text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300"
                  )}
                >
                  Manage Subscription
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Packages grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.key}
                packageData={pkg}
                isCurrentPlan={currentSubscription?.packageKey === pkg.key}
                onSelect={handlePackageSelect}
                selectedPackage={selectedPackage}
              />
            ))}
          </div>

          {/* Package Details Modal */}
          {showDetails && detailedPackage && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className={cn(
                "relative w-full max-w-3xl rounded-xl p-6",
                themeClasses.card,
                themeClasses.border,
                "border"
              )}>
                <button
                  onClick={handleCloseDetails}
                  className={cn(
                    "absolute top-4 right-4 p-2 rounded-lg",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    "transition-colors"
                  )}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="mb-6">
                  <div className="flex items-start mb-4">
                    <span className={cn(
                      "p-2.5 rounded-full mr-4",
                      detailedPackage.key === 'basic' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                      detailedPackage.key === 'professional' ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" :
                      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    )}>
                      {detailedPackage.key === 'basic' ? <Package className="w-6 h-6" /> : 
                       detailedPackage.key === 'professional' ? <Shield className="w-6 h-6" /> : 
                       <Zap className="w-6 h-6" />}
                    </span>
                    <div>
                      <h2 className={cn(
                        "text-2xl font-bold mb-1",
                        themeClasses.heading
                      )}>
                        {detailedPackage.name}
                      </h2>
                      <p className={cn(
                        "text-lg mb-1",
                        themeClasses.text
                      )}>
                        ${detailedPackage.price}
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/year</span>
                      </p>
                    </div>
                  </div>
                  
                  <p className={cn(
                    "pl-14",
                    themeClasses.text
                  )}>
                    {detailedPackage.key === 'basic' ? 
                      'Essential AI policies for small businesses starting their AI governance journey.' : 
                      detailedPackage.key === 'professional' ? 
                      'Comprehensive AI governance for growing organizations with expanding AI capabilities.' : 
                      'Enterprise-grade AI risk management solution for organizations with complex AI ecosystems.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className={cn(
                      "text-lg font-semibold mb-4",
                      themeClasses.heading
                    )}>
                      Included Policies
                    </h3>
                    <ul className="space-y-3">
                      {detailedPackage.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className={themeClasses.text}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className={cn(
                      "text-lg font-semibold mb-4",
                      themeClasses.heading
                    )}>
                      Package Benefits
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className={themeClasses.text}>Customizable policy templates</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className={themeClasses.text}>Export in multiple formats (PDF, DOCX, HTML)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className={themeClasses.text}>Regular policy updates based on new regulations</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className={themeClasses.text}>
                          {detailedPackage.key === 'basic' ? 'Email support' : 
                           detailedPackage.key === 'professional' ? 'Priority email and chat support' : 
                           'Dedicated support manager'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {isUpgradeForbidden(detailedPackage.key) ? (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-400">Downgrade Restricted</p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                          Downgrading from your current plan requires contacting support to ensure a smooth transition.
                          Please reach out to our team at support@whiteglobeai.com.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  currentSubscription?.packageKey === detailedPackage.key ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-400">This is your current plan</p>
                          <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                            You're already subscribed to this package. You can manage your subscription details from the dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null
                )}
                
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleCloseDetails}
                    className={cn(
                      "px-5 py-2.5 rounded-lg font-medium",
                      "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                      "hover:bg-gray-200 dark:hover:bg-gray-700",
                      "transition-colors"
                    )}
                  >
                    Cancel
                  </button>
                  {!currentSubscription?.packageKey || currentSubscription.packageKey !== detailedPackage.key ? (
                    isUpgradeForbidden(detailedPackage.key) ? (
                      <Link
                        to="/contact"
                        className={cn(
                          "flex items-center justify-center px-5 py-2.5 rounded-lg font-medium",
                          "bg-indigo-600 text-white",
                          "hover:bg-indigo-700",
                          "transition-colors"
                        )}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Contact Support
                      </Link>
                    ) : (
                      <button
                        onClick={handleProceedToPayment}
                        className={cn(
                          "px-5 py-2.5 rounded-lg font-medium",
                          "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
                          "hover:from-indigo-700 hover:to-purple-700",
                          "transition-colors"
                        )}
                      >
                        {currentSubscription 
                          ? `Upgrade to ${detailedPackage.name}` 
                          : `Subscribe to ${detailedPackage.name}`}
                      </button>
                    )
                  ) : (
                    <Link
                      to="/subscription"
                      className={cn(
                        "flex items-center justify-center px-5 py-2.5 rounded-lg font-medium",
                        "bg-cyan-500 text-white",
                        "hover:bg-cyan-600",
                        "transition-colors"
                      )}
                    >
                      Manage Current Plan
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className={cn(
              "text-2xl font-bold mb-6 text-center",
              themeClasses.heading
            )}>
              Frequently Asked Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={cn(
                "rounded-lg p-6",
                themeClasses.card,
                themeClasses.border,
                "border"
              )}>
                <h3 className={cn(
                  "text-lg font-semibold mb-2",
                  themeClasses.heading
                )}>
                  What's included in each plan?
                </h3>
                <p className={themeClasses.text}>
                  Each plan includes a specific set of policy templates that you can generate and customize for your organization. Higher-tier plans include more specialized and comprehensive policies for advanced AI governance needs.
                </p>
              </div>
              
              <div className={cn(
                "rounded-lg p-6",
                themeClasses.card,
                themeClasses.border,
                "border"
              )}>
                <h3 className={cn(
                  "text-lg font-semibold mb-2",
                  themeClasses.heading
                )}>
                  Can I upgrade or downgrade my plan?
                </h3>
                <p className={themeClasses.text}>
                  You can upgrade your plan at any time. Downgrades from Premium or Professional to lower tiers require contacting our support team to ensure a smooth transition with your existing policies.
                </p>
              </div>
              
              <div className={cn(
                "rounded-lg p-6",
                themeClasses.card,
                themeClasses.border,
                "border"
              )}>
                <h3 className={cn(
                  "text-lg font-semibold mb-2",
                  themeClasses.heading
                )}>
                  What happens to my policies if I downgrade?
                </h3>
                <p className={themeClasses.text}>
                  Your existing policies will remain accessible even if you downgrade, but you won't be able to create new policies that are exclusive to higher-tier plans. We recommend contacting support before downgrading.
                </p>
              </div>
              
              <div className={cn(
                "rounded-lg p-6",
                themeClasses.card,
                themeClasses.border,
                "border"
              )}>
                <h3 className={cn(
                  "text-lg font-semibold mb-2",
                  themeClasses.heading
                )}>
                  Are there any discounts available?
                </h3>
                <p className={themeClasses.text}>
                  We offer discounts for non-profit organizations, educational institutions, and for annual billing. Please contact our sales team for more information about available discounts.
                </p>
              </div>
            </div>
            
            <div className={cn(
              "mt-12 text-center p-8 rounded-xl",
              "bg-gradient-to-r from-indigo-50 to-purple-50",
              "dark:from-indigo-900/20 dark:to-purple-900/20",
              "border border-indigo-100 dark:border-indigo-800"
            )}>
              <h3 className={cn(
                "text-xl font-bold mb-3",
                themeClasses.heading
              )}>
                Need a Custom Enterprise Solution?
              </h3>
              <p className={cn(
                "mb-6 max-w-2xl mx-auto",
                themeClasses.text
              )}>
                For organizations with specific needs, we offer tailored AI governance frameworks and custom policy development services.
              </p>
              <Link 
                to="/contact"
                className={cn(
                  "inline-flex items-center px-6 py-3 rounded-lg font-medium",
                  "bg-indigo-600 text-white",
                  "hover:bg-indigo-700",
                  "transition-colors"
                )}
              >
                Schedule a Consultation
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Packages;
