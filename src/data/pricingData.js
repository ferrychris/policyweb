export const pricingData = [
  {
    id: 1,
    name: 'Foundational Package',
    description: 'Perfect for startups and early-stage AI teams',
    price: {
      monthly: 49,
      yearly: 490,
    },
    features: [
      'Master Policy (organization-wide framework)',
      'Ethics & Responsible AI',
      'Risk Management',
      'Data Governance',
      'Security',
    ],
    stripePriceIds: {
      monthly: 'price_XXXXX', // Replace with your actual Stripe Price ID
      yearly: 'price_XXXXX',  // Replace with your actual Stripe Price ID
    },
    color: 'blue',
  },
  {
    id: 2,
    name: 'Operational Package',
    description: 'Ideal for mid-size teams or compliance-driven organizations',
    price: {
      monthly: 99,
      yearly: 990,
    },
    features: [
      'All Foundational Package features',
      'Regulatory Compliance',
      'Model Management',
      'Use Case Evaluation',
      'Vendor Management',
      'Human Oversight',
      'Change Management',
    ],
    stripePriceIds: {
      monthly: 'price_XXXXX', // Replace with your actual Stripe Price ID
      yearly: 'price_XXXXX',  // Replace with your actual Stripe Price ID
    },
    color: 'yellow',
  },
  {
    id: 3,
    name: 'Strategic Package',
    description: 'Designed for enterprises scaling AI',
    price: {
      monthly: 199,
      yearly: 1990,
    },
    features: [
      'All Operational Package features',
      'AI Training & Capability Building',
      'AI Innovation Policy',
      'Accountability & Governance Structure',
      'Testing & Quality Assurance',
      'Incident Response',
      'Human-AI Collaboration',
      'AI Knowledge Management',
    ],
    stripePriceIds: {
      monthly: 'price_XXXXX', // Replace with your actual Stripe Price ID
      yearly: 'price_XXXXX',  // Replace with your actual Stripe Price ID
    },
    color: 'red',
  },
]; 