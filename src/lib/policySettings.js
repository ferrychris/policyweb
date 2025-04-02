import { FileText } from 'lucide-react';
import { getAllPackages } from './database';

/**
 * Shared policy type settings for use across different components
 */
export const POLICY_TYPES = [
  // Basic Tier Policies
  {
    id: 'ethics',
    title: 'AI Ethics Policy',
    description: 'Create guidelines for ethical AI development',
    href: '/dashboard/new-policy/ethics',
    icon: FileText,
    customizations: {
      companyName: 'Your Company',
      industry: 'Technology', 
      scope: 'Enterprise-wide'
    },
    keyProvisions: [
      'We commit to developing AI systems that respect human autonomy and dignity',
      'Our AI systems are designed to be fair, unbiased, and inclusive',
      'We promote transparency and explainability in all our AI applications',
      'We take responsibility for the impact of our AI systems'
    ],
    templates: ['Standard', 'Comprehensive', 'Industry-specific'],
    tier: 'basic'
  },
  {
    id: 'risk',
    title: 'AI Risk Management Policy',
    description: 'Manage risks associated with AI systems',
    href: '/dashboard/new-policy/risk',
    icon: FileText,
    customizations: {
      companyName: 'Your Company',
      industry: 'Technology', 
      scope: 'Risk Management'
    },
    keyProvisions: [
      'Regular risk assessments of all AI systems throughout their lifecycle',
      'Continuous monitoring and mitigation of identified risks',
      'Documentation of risk management practices and outcomes',
      'Establishment of an incident response protocol for AI-related issues'
    ],
    templates: ['Basic', 'Advanced', 'Enterprise'],
    tier: 'basic'
  },
  {
    id: 'data',
    title: 'Data Governance Policy',
    description: 'Establish data handling standards',
    href: '/dashboard/new-policy/data',
    icon: FileText,
    customizations: {
      companyName: 'Your Company',
      industry: 'Technology', 
      scope: 'Data Management'
    },
    keyProvisions: [
      'Clear protocols for data collection, storage, and processing',
      'Measures to ensure data quality, accuracy, and relevance',
      'Procedures for data access control and security',
      'Compliance with applicable data protection regulations'
    ],
    templates: ['Minimal', 'Standard', 'Comprehensive'],
    tier: 'basic'
  },
  
  // Professional Tier Policies
  {
    id: 'security',
    title: 'AI Security Policy',
    description: 'Security controls for AI systems',
    href: '/dashboard/new-policy/security',
    icon: FileText,
    customizations: {
      companyName: 'Your Company',
      industry: 'Technology', 
      scope: 'Security'
    },
    keyProvisions: [
      'Implementation of robust security measures for AI infrastructure',
      'Protection against adversarial attacks and model manipulation',
      'Security testing procedures for AI applications',
      'Regular security audits and vulnerability assessments'
    ],
    templates: ['Basic Security', 'Advanced Security', 'Enterprise Security'],
    tier: 'professional'
  },
  {
    id: 'model',
    title: 'Model Management Policy',
    description: 'Model development and monitoring',
    href: '/dashboard/new-policy/model',
    icon: FileText,
    customizations: {
      companyName: 'Your Company',
      industry: 'Technology', 
      scope: 'Model Development'
    },
    keyProvisions: [
      'Standardized procedures for model development and testing',
      'Version control and documentation requirements',
      'Processes for model validation and performance metrics',
      'Monitoring protocols for deployed models'
    ],
    templates: ['Development', 'Validation', 'Production'],
    tier: 'professional'
  },
  {
    id: 'oversight',
    title: 'Human Oversight Policy',
    description: 'Human-AI collaboration guidelines',
    href: '/dashboard/new-policy/oversight',
    icon: FileText,
    customizations: {
      companyName: 'Your Company',
      industry: 'Technology', 
      scope: 'Oversight'
    },
    keyProvisions: [
      'Clear roles and responsibilities for human oversight of AI systems',
      'Training requirements for personnel overseeing AI operations',
      'Decision-making authority and escalation procedures',
      'Regular review of human-AI interaction effectiveness'
    ],
    templates: ['Basic Oversight', 'Collaborative', 'Comprehensive'],
    tier: 'professional'
  },
  {
    id: 'compliance',
    title: 'AI Compliance Policy',
    description: 'Regulatory compliance framework',
    href: '/dashboard/new-policy/compliance',
    icon: FileText,
    customizations: {
      companyName: 'Your Company',
      industry: 'Technology', 
      scope: 'Compliance'
    },
    keyProvisions: [
      'Monitoring and compliance with relevant AI regulations',
      'Documentation procedures for regulatory purposes',
      'Regular compliance assessments and audits',
      'Procedures for addressing non-compliance issues'
    ],
    templates: ['Basic Compliance', 'Industry Standard', 'Comprehensive'],
    tier: 'professional'
  },
  {
    id: 'usecase',
    title: 'Use Case Evaluation Policy',
    description: 'Use case assessment framework',
    href: '/dashboard/new-policy/usecase',
    icon: FileText,
    customizations: {
      companyName: 'Your Company',
      industry: 'Technology', 
      scope: 'Use Case Evaluation'
    },
    keyProvisions: [
      'Clear criteria for evaluating AI use cases',
      'Risk assessment and mitigation procedures',
      'Documentation requirements for use case evaluations',
      'Establishment of a review process for use case evaluations'
    ],
    templates: ['Basic Evaluation', 'Comprehensive Evaluation', 'Industry-specific'],
    tier: 'professional'
  },
  
  // Premium Tier Policies
  {
    id: 'procurement',
    title: 'Procurement & Vendor Policy',
    description: 'Guidelines for AI procurement and vendor management',
    href: '/dashboard/new-policy/procurement',
    icon: FileText,
    customizations: {
      companyName: 'Your Company',
      industry: 'Technology', 
      scope: 'Procurement'
    },
    keyProvisions: [
      'Clear procurement procedures for AI systems and services',
      'Evaluation criteria for AI vendors and suppliers',
      'Contract management and negotiation guidelines',
      'Establishment of a vendor management program'
    ],
    templates: ['Basic Procurement', 'Comprehensive Procurement', 'Industry-specific'],
    tier: 'premium'
  },
  {
    id: 'deployment',
    title: 'Responsible AI Deployment',
    description: 'Best practices for responsible AI deployment',
    href: '/dashboard/new-policy/deployment',
    icon: FileText,
    customizations: {
      companyName: 'Your Company',
      industry: 'Technology', 
      scope: 'Deployment'
    },
    keyProvisions: [
      'Clear deployment procedures for AI systems',
      'Risk assessment and mitigation procedures',
      'Documentation requirements for deployment',
      'Establishment of a review process for deployment'
    ],
    templates: ['Basic Deployment', 'Comprehensive Deployment', 'Industry-specific'],
    tier: 'premium'
  },
  {
    id: 'training',
    title: 'Training & Capability Policy',
    description: 'AI training and capability development guidelines',
    href: '/dashboard/new-policy/training',
    icon: FileText,
    customizations: {
      companyName: 'Your Company',
      industry: 'Technology', 
      scope: 'Training'
    },
    keyProvisions: [
      'Clear training procedures for AI personnel',
      'Evaluation criteria for AI training programs',
      'Documentation requirements for training',
      'Establishment of a training and capability development program'
    ],
    templates: ['Basic Training', 'Comprehensive Training', 'Industry-specific'],
    tier: 'premium'
  },
  {
    id: 'incident',
    title: 'Incident Response Policy',
    description: 'Create protocols for AI incidents',
    href: '/dashboard/new-policy/incident',
    icon: FileText,
    customizations: {
      companyName: 'Your Company',
      industry: 'Technology', 
      scope: 'Incident Management'
    },
    keyProvisions: [
      'Clear incident response procedures for AI-related incidents',
      'Risk assessment and mitigation procedures',
      'Documentation requirements for incident response',
      'Establishment of a review process for incident response'
    ],
    templates: ['Basic Incident Response', 'Comprehensive Incident Response', 'Industry-specific'],
    tier: 'premium'
  }
];

// Export pricing packages based on database values
export const PRICING_PACKAGES = {
  basic: {
    name: 'Basic Package',
    price: 900,
    features: [
      'AI Ethics Policy',
      'AI Risk Management Policy',
      'Data Governance Policy'
    ],
    policyLimit: 3,
    allowedTypes: ['ethics', 'risk', 'data'],
    icon: 'Package'
  },
  professional: {
    name: 'Professional Package',
    price: 1500,
    features: [
      'All Basic Policies (3)',
      'AI Security Policy',
      'Model Management Policy',
      'Human Oversight Policy',
      'AI Compliance Policy',
      'Use Case Evaluation Policy'
    ],
    policyLimit: 8,
    allowedTypes: ['ethics', 'risk', 'data', 'security', 'model', 'oversight', 'compliance', 'usecase'],
    icon: 'Shield'
  },
  premium: {
    name: 'Premium Package',
    price: 5000,
    features: [
      'All Basic & Professional Policies',
      'Procurement & Vendor Policy',
      'Responsible AI Deployment',
      'Training & Capability Policy',
      'Incident Response Policy'
    ],
    policyLimit: -1, // Unlimited
    allowedTypes: 'all', // All policy types
    icon: 'Zap'
  }
};

// Function to convert database package structure to application structure
export const getPackagesFromDatabase = () => {
  const dbPackages = getAllPackages();
  
  // Convert to the structure needed by the application
  return dbPackages.map(pkg => {
    let allowedTypes;
    if (pkg.key === 'basic') {
      allowedTypes = ['ethics', 'risk', 'data'];
    } else if (pkg.key === 'professional') {
      allowedTypes = ['ethics', 'risk', 'data', 'security', 'model', 'oversight', 'compliance', 'usecase'];
    } else {
      allowedTypes = 'all';
    }
    
    return {
      key: pkg.key,
      name: pkg.name,
      price: pkg.price,
      description: pkg.key === 'basic' ? 'Essential AI policies for small businesses' :
                   pkg.key === 'professional' ? 'Comprehensive AI governance for growing organizations' :
                   'Enterprise-grade AI risk management solution',
      features: pkg.key === 'basic' ? 
        ['AI Ethics Policy', 'AI Risk Management Policy', 'Data Governance Policy'] :
        pkg.key === 'professional' ?
        ['All Basic Policies (3)', 'AI Security Policy', 'Model Management Policy', 
         'Human Oversight Policy', 'AI Compliance Policy', 'Use Case Evaluation Policy'] :
        ['All Basic & Professional Policies', 'Procurement & Vendor Policy', 
         'Responsible AI Deployment', 'Training & Capability Policy', 'Incident Response Policy'],
      policyLimit: pkg.key === 'basic' ? 3 : 
                  pkg.key === 'professional' ? 8 : -1,
      allowedTypes: allowedTypes,
      icon: pkg.key === 'basic' ? 'Package' : 
            pkg.key === 'professional' ? 'Shield' : 'Zap'
    };
  });
};

/**
 * Get the list of policy types for a given package
 */
export const getPolicyTypesForPackage = (packageKey) => {
  // If no package, return empty array
  if (!packageKey || !PRICING_PACKAGES[packageKey]) {
    return [];
  }
  
  const pkg = PRICING_PACKAGES[packageKey];
  
  // If premium package, return all policies
  if (packageKey === 'premium' || pkg.allowedTypes === 'all') {
    return POLICY_TYPES.map(policy => policy.id);
  }
  
  // Otherwise, return the allowed types
  return pkg.allowedTypes;
};

/**
 * Determine if a policy type is allowed for a given package
 */
export const isPolicyAllowedForPackage = (policyTypeId, packageKey) => {
  // If no package or policy type, it's not allowed
  if (!packageKey || !policyTypeId) {
    return false;
  }
  
  // Get package from the packages object
  const pkg = PRICING_PACKAGES[packageKey];
  if (!pkg) {
    return false;
  }
  
  // Premium package can access all policies
  if (packageKey === 'premium' || pkg.allowedTypes === 'all') {
    return true;
  }
  
  // Check if policy type is in the allowed types for this package
  return pkg.allowedTypes.includes(policyTypeId);
};

/**
 * Get quick actions based on a specific package
 */
export const getQuickActionsForPackage = (packageKey, count = 3) => {
  const allowedTypes = getPolicyTypesForPackage(packageKey);
  
  if (!allowedTypes.length) {
    return [];
  }
  
  // Filter policy types by allowed types and limit to count
  return POLICY_TYPES
    .filter(policy => allowedTypes.includes(policy.id))
    .slice(0, count);
};

/**
 * Get a subset of policy types for use in quick actions grid
 */
export const getQuickActions = (count = 3) => {
  // Get one policy from each tier for better representation
  const basicPolicies = POLICY_TYPES.filter(policy => policy.tier === 'basic');
  const professionalPolicies = POLICY_TYPES.filter(policy => policy.tier === 'professional');
  const premiumPolicies = POLICY_TYPES.filter(policy => policy.tier === 'premium');
  
  // Combine and limit to the requested count
  return [...basicPolicies, ...professionalPolicies, ...premiumPolicies].slice(0, count);
};

/**
 * Find a policy type by its ID
 */
export const getPolicyTypeById = (id) => {
  return POLICY_TYPES.find(policyType => policyType.id === id);
};

export default POLICY_TYPES;
