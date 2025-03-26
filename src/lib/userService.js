// Mock user service for managing user data and subscriptions
// In a real application, this would communicate with a backend API

import { PRICING_PACKAGES } from './policySettings';

// Mock user database
const users = {
  'user-1': {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    subscription: {
      active: true,
      packageKey: 'basic', // 'basic', 'professional', 'premium'
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    policies: []
  }
};

// Dedicated user_policies table
const user_policies = {
  items: [],
  lastId: 0
};

// Mock AI policy templates
const POLICY_TEMPLATES = [
  {
    id: 'template-1',
    title: 'AI Ethics Policy',
    description: 'Sets ethical guidelines for AI use',
    content: `# AI Ethics Policy\n\n## 1. Purpose and Scope\n\nThis policy establishes ethical guidelines for the development, deployment, and use of artificial intelligence (AI) systems within our organization. It applies to all staff, contractors, and partners involved in AI activities.\n\n## 2. Core Ethical Principles\n\n### 2.1 Fairness and Non-discrimination\n\nAll AI systems must be designed to treat individuals and groups fairly. We prohibit the development of AI systems that discriminate based on protected characteristics such as race, gender, age, religion, or disability.\n\n### 2.2 Transparency and Explainability\n\nWe commit to making our AI systems transparent. Decision-making processes should be explainable in clear, non-technical language to affected individuals.\n\n### 2.3 Privacy and Data Protection\n\nAI systems must respect user privacy and comply with relevant data protection regulations. Data collection should be minimized to what is necessary for the system to function.\n\n### 2.4 Safety and Security\n\nAll AI systems must undergo rigorous testing to ensure they operate safely and securely. Systems must be resistant to adversarial attacks and potential harmful uses.\n\n### 2.5 Human Autonomy\n\nOur AI systems are designed to augment human capabilities, not replace human judgment in critical decisions. We maintain human oversight over AI systems, especially in high-risk domains.\n\n## 3. Responsible Data Practices\n\n- All data used for AI development must be legally obtained and properly licensed.\n- Data must be representative and avoid reinforcing societal biases.\n- Regular audits will evaluate datasets for potential bias or data quality issues.\n- Data sharing agreements must be in place before transferring data to external parties.\n- Third parties must adhere to the same standards as outlined in this policy.\n\n## 4. Accountability and Oversight\n\n- An AI Ethics Committee will oversee implementation of this policy.\n- Regular impact assessments will be conducted for high-risk AI systems.\n- Grievance mechanisms will be established for individuals affected by AI decisions.\n- Documentation of design choices, training data, and performance metrics will be maintained.\n\n## 5. Compliance and Enforcement\n\n- All employees must complete AI ethics training annually.\n- Violations of this policy may result in disciplinary action.\n- This policy will be reviewed and updated annually.\n\n## 6. Effective Date\n\nThis policy is effective immediately upon approval.`,
    type: 'ethics',
    public: true
  },
  {
    id: 'template-2',
    title: 'AI Risk Management Policy',
    description: 'Framework for managing AI risks',
    content: 'AI Risk Management Policy content...',
    type: 'risk',
    public: true
  }
];

// Get a user by ID
export const getUser = (userId) => {
  return users[userId] || null;
};

// Get user's current package
export const getUserPackage = (userId) => {
  const user = getUser(userId);
  
  if (!user || !user.subscription || !user.subscription.active) {
    return null;
  }
  
  const packageKey = user.subscription.packageKey;
  
  return {
    key: packageKey,
    name: PRICING_PACKAGES[packageKey]?.name || 'Unknown Package',
    price: PRICING_PACKAGES[packageKey]?.price || 0
  };
};

// Check if user has an active subscription
export const hasActiveSubscription = (userId) => {
  const user = getUser(userId);
  
  if (!user || !user.subscription) {
    return false;
  }
  
  return user.subscription.active && new Date(user.subscription.expiresAt) > new Date();
};

// Update user's subscription package
export const updateUserPackage = (userId, packageKey) => {
  const user = getUser(userId);
  
  if (!user) {
    return null;
  }
  
  // Update the user's subscription
  users[userId] = {
    ...user,
    subscription: {
      active: true,
      packageKey,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  };
  
  return getUserPackage(userId);
};

// Mock function to process a payment
export const processPayment = async (userId, packageKey, paymentDetails) => {
  // Simulate a payment process
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Randomly succeed or fail (90% success rate)
  const isSuccessful = Math.random() < 0.9;
  
  if (isSuccessful) {
    // Update the user's package
    const newPackage = updateUserPackage(userId, packageKey);
    
    return {
      success: true,
      package: newPackage
    };
  }
  
  return {
    success: false,
    error: 'Payment processing failed. Please try again or use a different payment method.'
  };
};

// Get all policies created by a user
export const getUserPolicies = (userId) => {
  const user = getUser(userId);
  
  if (!user) {
    return [];
  }
  
  // Return from user_policies table
  return user_policies.items.filter(policy => policy.userId === userId);
};

// Add a new policy for a user
export const addUserPolicy = (userId, policy) => {
  try {
    // Validate user
    const user = getUser(userId);
    if (!user) return { success: false, error: 'User not found' };

    // Create a new policy
    const policyId = `policy-${++user_policies.lastId}`;
    const newPolicy = {
      id: policyId,
      userId,
      createdAt: new Date(),
      updatedAt: null,
      ...policy
    };

    // Add to user_policies table
    user_policies.items.push(newPolicy);

    return { success: true, policy: newPolicy };
  } catch (error) {
    console.error('Error adding policy:', error);
    return { success: false, error: error.message };
  }
};

// Get current logged in user
export const getCurrentUser = () => {
  // In a real app, this would check for a logged in user session
  // For development/demo purposes, we'll return a mock user
  return {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: 'Acme Corp',
    country: 'us',
    industry: 'technology',
    createdAt: new Date('2025-01-15')
  };
};

// Get user subscription info
export const getUserSubscription = () => {
  // In a real app, this would fetch the subscription from the backend
  // This is a mockup for demo purposes
  return {
    active: true,
    packageKey: 'professional', // 'basic', 'professional', or 'premium'
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    autoRenew: true,
    paymentMethod: {
      type: 'credit_card',
      last4: '4242',
      expMonth: 12,
      expYear: 2025
    }
  };
};

// Get user subscription package key
export const getUserPackageKey = () => {
  const subscription = getUserSubscription();
  return subscription?.packageKey || 'basic';
};

// Get user policies
export const getUserPoliciesCurrent = () => {
  try {
    const user = getCurrentUser();
    if (!user) return [];
    
    // Return from user_policies table
    return user_policies.items.filter(policy => policy.userId === user.id);
  } catch (error) {
    console.error('Error getting user policies:', error);
    return [];
  }
};

// Update user policy
export const updateUserPolicy = (policyId, updatedData) => {
  try {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'User not found' };

    // Find the policy in the user_policies table
    const policyIndex = user_policies.items.findIndex(policy => policy.id === policyId && policy.userId === user.id);
    if (policyIndex === -1) return { success: false, error: 'Policy not found' };

    // Update the policy
    user_policies.items[policyIndex] = {
      ...user_policies.items[policyIndex],
      ...updatedData,
      updatedAt: new Date()
    };

    return { success: true, policy: user_policies.items[policyIndex] };
  } catch (error) {
    console.error('Error updating policy:', error);
    return { success: false, error: error.message };
  }
};

// Delete user policy
export const deleteUserPolicy = (policyId) => {
  try {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'User not found' };

    // Find the policy in the user_policies table
    const policyIndex = user_policies.items.findIndex(policy => policy.id === policyId && policy.userId === user.id);
    if (policyIndex === -1) return { success: false, error: 'Policy not found' };

    // Remove the policy
    user_policies.items.splice(policyIndex, 1);

    return { success: true };
  } catch (error) {
    console.error('Error deleting policy:', error);
    return { success: false, error: error.message };
  }
};

// Add a new policy for the user
export const addUserPolicyCurrent = (policyData) => {
  try {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'User not found' };

    // Create a new policy in the user_policies table
    const policyId = `policy-${++user_policies.lastId}`;
    const newPolicy = {
      id: policyId,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: null,
      ...policyData
    };

    // Add to user_policies table
    user_policies.items.push(newPolicy);

    return { success: true, policy: newPolicy };
  } catch (error) {
    console.error('Error adding policy:', error);
    return { success: false, error: error.message };
  }
};
