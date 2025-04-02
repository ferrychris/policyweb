// Simulated database functionality
// In a real application, this would be replaced with actual database calls

// Simulated packages table from database
const PACKAGES = [
  {
    id: 1,
    name: 'Basic Package',
    price: 900,
    policies: JSON.stringify([
      'AI Ethics Policy', 
      'AI Risk Management Policy', 
      'AI Data Governance Policy'
    ]),
    key: 'basic',
    description: 'Essential AI policies for small businesses'
  },
  {
    id: 2,
    name: 'Professional Package',
    price: 1500,
    policies: JSON.stringify([
      'All Basic Policies',
      'AI Security Policy', 
      'Model Management Policy', 
      'Human Oversight Policy', 
      'AI Compliance Policy', 
      'Use Case Evaluation Policy'
    ]),
    key: 'professional',
    description: 'Comprehensive AI governance for growing organizations'
  },
  {
    id: 3,
    name: 'Premium Package',
    price: 5000,
    policies: JSON.stringify([
      'All Professional Policies',
      'Procurement & Vendor Policy',
      'Responsible AI Deployment',
      'Training & Capability Policy',
      'Incident Response Policy',
      '+9 More Specialized Policies'
    ]),
    key: 'premium',
    description: 'Enterprise-grade AI risk management solution'
  }
];

// Mock user data - in a real app, this would be stored in a database
const USERS = {
  "user-1": {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    package_id: null, // Users start with no package by default
    created_at: new Date().toISOString(),
    subscription: {
      status: "inactive", // inactive, active, cancelled
      end_date: null
    }
  }
};

// Get all packages
export const getAllPackages = () => {
  return PACKAGES.map(pkg => ({
    ...pkg,
    policies: JSON.parse(pkg.policies)
  }));
};

// Get package by key
export const getPackageByKey = (key) => {
  const pkg = PACKAGES.find(p => p.key === key);
  
  if (!pkg) {
    return null;
  }
  
  return {
    ...pkg,
    policies: JSON.parse(pkg.policies)
  };
};

// Get package by ID
export const getPackageById = (id) => {
  const pkg = PACKAGES.find(p => p.id === id);
  
  if (!pkg) {
    return null;
  }
  
  return {
    ...pkg,
    policies: JSON.parse(pkg.policies)
  };
};

/**
 * Get a user's current package
 * @param {string} userId - The user ID
 * @returns {Object|null} - The user's package or null if not found
 */
export const getUserPackage = (userId) => {
  const user = USERS[userId];
  if (!user) return null;
  
  // If user has no package, return null
  if (!user.package_id) return null;
  
  // Find the package by ID
  const userPackage = PACKAGES.find(pkg => pkg.id === user.package_id);
  
  // In case the package doesn't exist in our database (shouldn't happen)
  if (!userPackage) return null;
  
  return userPackage;
};

/**
 * Upgrade a user's package
 * @param {string} userId - The user ID
 * @param {string} packageKey - The new package key
 * @param {Object} paymentDetails - Payment details for the upgrade
 * @returns {Object|null} - The updated package or null if failed
 */
export const upgradeUserPackage = async (userId, packageKey, paymentDetails = null) => {
  // In a real app, this would validate the payment details
  // and process the payment before upgrading the package
  if (!paymentDetails) {
    console.warn('No payment details provided for upgrade');
    return null;
  }
  
  // Check if payment was successful
  if (!paymentDetails.success) {
    console.error('Payment failed', paymentDetails.error);
    return null;
  }
  
  const user = USERS[userId];
  if (!user) return null;
  
  // Find the package by key
  const newPackage = PACKAGES.find(pkg => pkg.key === packageKey);
  if (!newPackage) return null;
  
  // Update user's package
  user.package_id = newPackage.id;
  user.subscription = {
    status: "active",
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  };
  
  // In a real app, save to database
  USERS[userId] = user;
  
  return newPackage;
};

/**
 * Process a payment for a package upgrade
 * @param {string} userId - The user ID
 * @param {string} packageKey - The package key to upgrade to
 * @param {Object} paymentDetails - Payment card details
 * @returns {Object} - Result of the payment attempt
 */
export const processPayment = async (userId, packageKey, paymentDetails) => {
  // In a real app, this would call a payment processor API
  // For this simulation, we'll just validate the data format
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Find the package
  const packageToUpgrade = PACKAGES.find(pkg => pkg.key === packageKey);
  if (!packageToUpgrade) {
    return {
      success: false,
      error: "Invalid package selected"
    };
  }
  
  // Validate credit card details (very simple validation)
  if (!paymentDetails.cardNumber || paymentDetails.cardNumber.length < 15) {
    return {
      success: false,
      error: "Invalid card number"
    };
  }
  
  if (!paymentDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate)) {
    return {
      success: false,
      error: "Invalid expiry date"
    };
  }
  
  if (!paymentDetails.cvv || paymentDetails.cvv.length < 3) {
    return {
      success: false,
      error: "Invalid CVV"
    };
  }
  
  if (!paymentDetails.name) {
    return {
      success: false,
      error: "Cardholder name is required"
    };
  }
  
  // 90% success rate for simulation purposes
  const isSuccessful = Math.random() < 0.9;
  
  if (isSuccessful) {
    // Update user's package after successful payment
    const updatedPackage = await upgradeUserPackage(userId, packageKey, { success: true });
    
    return {
      success: true,
      package: updatedPackage,
      transaction: {
        id: `trx-${Date.now()}`,
        amount: packageToUpgrade.price,
        date: new Date().toISOString(),
        last4: paymentDetails.cardNumber.slice(-4)
      }
    };
  } else {
    return {
      success: false,
      error: "Payment declined by issuer. Please try a different card."
    };
  }
};

/**
 * Check if a user has an active subscription
 * @param {string} userId - The user ID
 * @returns {boolean} - Whether the user has an active subscription
 */
export const hasActiveSubscription = (userId) => {
  const user = USERS[userId];
  if (!user) return false;
  
  return user.subscription?.status === "active" && 
         user.package_id !== null && 
         (user.subscription?.end_date === null || new Date(user.subscription.end_date) > new Date());
};
