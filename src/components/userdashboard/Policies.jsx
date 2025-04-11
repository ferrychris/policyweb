import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { getUserPoliciesCurrent, updateUserPolicy, deleteUserPolicy } from '../../lib/userService';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  FaPlus,
  FaTimes,
  FaSearch,
  FaFileAlt,
  FaPen,
  FaDownload,
  FaTrash,
  FaEye,
  FaBars,
  FaBuilding,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaIndustry,
  FaCalendarAlt,
  FaChartLine,
  FaRegCheckCircle,
  FaCheck,
  FaLock,
  FaShieldAlt,
  FaExclamationCircle,
  FaCog,
  FaUsers,
  FaCheckCircle,
  FaHandshake,
  FaRocket,
  FaGraduationCap,
  FaBell
} from 'react-icons/fa';
import { cn, themeClasses, gradientClasses } from '../../lib/utils';
import PolicyEditor from '../editor/PolicyEditor';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '../../lib/stripe';
import axios from 'axios';
import { Loader2, Crown, Star, Check, X } from 'lucide-react';
import OpenAI from 'openai';
import { invokeScrapeFunction, getScrapedData, saveScrapedData } from '../../utils/supabaseClient';
import { enhancePolicyGeneration } from '../../utils/policyEnhancer';
import { generatePolicy, generateSuggestions } from '../../lib/openai';
import DOMPurify from 'dompurify';
import html2canvas from 'html2canvas';
import { CreditCard, Users, ChevronRight, AlertTriangle, Calendar, ArrowRight, RotateCcw, CheckCircle, Clock, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const API_KEY = '2436|zmpfj0j2Jt87Hn220JB6X7MUjhgTbMWo2QtfVtX3';

const policyTypes = [
  {
    id: 'ai-ethics',
    title: 'AI Ethics Policy',
    description: 'Create guidelines for ethical AI development',
    icon: FaShieldAlt
  },
  {
    id: 'risk-management',
    title: 'AI Risk Management Policy',
    description: 'Manage risks associated with AI systems',
    icon: FaExclamationCircle
  },
  {
    id: 'data-governance',
    title: 'Data Governance Policy',
    description: 'Establish data handling standards',
    icon: FaFileAlt
  },
  {
    id: 'ai-security',
    title: 'AI Security Policy',
    description: 'Security controls for AI systems',
    icon: FaShieldAlt
  },
  {
    id: 'model-management',
    title: 'Model Management Policy',
    description: 'Model development and monitoring',
    icon: FaCog
  },
  {
    id: 'human-oversight',
    title: 'Human Oversight Policy',
    description: 'Human-AI collaboration guidelines',
    icon: FaUsers
  },
  {
    id: 'ai-compliance',
    title: 'AI Compliance Policy',
    description: 'Regulatory compliance framework',
    icon: FaCheckCircle
  },
  {
    id: 'use-case',
    title: 'Use Case Evaluation Policy',
    description: 'Use case assessment framework',
    icon: FaSearch
  },
  {
    id: 'procurement',
    title: 'Procurement & Vendor Policy',
    description: 'Guidelines for AI procurement and vendor management',
    icon: FaHandshake
  },
  {
    id: 'deployment',
    title: 'Responsible AI Deployment',
    description: 'Best practices for responsible AI deployment',
    icon: FaRocket
  },
  {
    id: 'training',
    title: 'Training & Capability Policy',
    description: 'AI training and capability development guidelines',
    icon: FaGraduationCap
  },
  {
    id: 'incident',
    title: 'Incident Response Policy',
    description: 'Create protocols for AI incidents',
    icon: FaBell
  }
];

const templateStyles = [
  {
    id: 'basic',
    title: 'Basic Evaluation',
    description: 'Essential evaluation criteria and straightforward assessment framework',
    icon: FaFileAlt
  },
  {
    id: 'comprehensive',
    title: 'Comprehensive Evaluation',
    description: 'Detailed evaluation process with extensive criteria and documentation',
    icon: FaShieldAlt
  },
  {
    id: 'industry',
    title: 'Industry-specific',
    description: 'Tailored evaluation framework based on industry requirements',
    icon: FaIndustry
  }
];

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Energy',
  'Transportation',
  'Other'
];

const aiMaturityLevels = [
  'Initial/Ad-hoc',
  'Developing',
  'Defined',
  'Managed',
  'Optimized'
];

const regulations = {
  global: [
    { id: 'iso-42001', name: 'ISO 42001', description: 'AI Management System Standard' },
    { id: 'nist-ai', name: 'NIST AI Risk Management Framework', description: 'Guidelines for managing AI risks' },
    { id: 'owasp-llm', name: 'OWASP Top 10 for LLMs', description: 'Security considerations for LLMs' },
    { id: 'mitre-atlas', name: 'MITRE ATLAS Framework', description: 'AI threat landscape framework' }
  ],
  eu: [
    { id: 'eu-ai-act', name: 'EU AI Act', description: 'Comprehensive AI regulation framework' },
    { id: 'gdpr', name: 'GDPR', description: 'Data protection regulation' }
  ],
  us: [
    { id: 'ai-bill-rights', name: 'Blueprint for an AI Bill of Rights', description: 'US AI rights guidelines' },
    { id: 'nist-ai-us', name: 'NIST AI Risk Management (US)', description: 'US-specific AI risk guidelines' }
  ]
};

const dropdownStyles = {
  select: "w-full pl-10 pr-4 py-2 bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 rounded-lg text-[#E2DDFF] focus:border-[#B4A5FF]/50 focus:outline-none appearance-none",
  option: "bg-[#2E1D4C] text-[#E2DDFF] hover:bg-[#B4A5FF]/20",
  optionSelected: "bg-[#B4A5FF]/20"
};

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const PaymentForm = ({ clientSecret, packageDetails, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/policies`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#E2DDFF] mb-2">Order Summary</h3>
        <div className="bg-[#2E1D4C]/30 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#B4A5FF]">Package:</span>
            <span className="text-[#E2DDFF] font-medium">{packageDetails.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#B4A5FF]">Price:</span>
            <span className="text-[#E2DDFF] font-medium">${packageDetails.price}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <PaymentElement />
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || processing}
            className="px-6 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E2DDFF] mr-2" />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Policy type to subscription tier mapping
const policyTierRequirements = {
  // Foundational Package (Tier 1) policies
  'ai-ethics': 1,
  'risk-management': 1,
  'data-governance': 1,
  
  // Operational Package (Tier 2) policies
  'ai-security': 2,
  'model-management': 2,
  'human-oversight': 2,
  'ai-compliance': 2,
  'use-case': 2,
  
  // Strategic Package (Tier 3) policies
  'procurement': 3,
  'deployment': 3,
  'training': 3,
  'incident': 3
};

// Package tier definitions
const subscriptionTiers = {
  1: { name: "Foundational Package", price: 900 },
  2: { name: "Operational Package", price: 1500 },
  3: { name: "Strategic Package", price: 3000 }
};

const Policies = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [showPolicyTypeModal, setShowPolicyTypeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPolicyType, setSelectedPolicyType] = useState(null);
  const [organizationDetails, setOrganizationDetails] = useState({
    companyName: '',
    website: '',
    email: '',
    country: '',
    industry: '',
    aiMaturityLevel: '',
    effectiveDate: '',
    templateStyle: ''
  });
  const [showRegulationsModal, setShowRegulationsModal] = useState(false);
  const [selectedRegulations, setSelectedRegulations] = useState([]);
  const [uploadedPolicies, setUploadedPolicies] = useState([]);
  const [monitoringPreferences, setMonitoringPreferences] = useState({
    autoUpdate: false,
    notifyChanges: true,
    reviewPeriod: 'quarterly'
  });
  const [showPolicyEditor, setShowPolicyEditor] = useState(false);
  const [showPolicyGenerationModal, setShowPolicyGenerationModal] = useState(false);
  const [generatedPolicy, setGeneratedPolicy] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [versionHistory, setVersionHistory] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedPackageDetails, setSelectedPackageDetails] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const websiteInputRef = useRef(null);
  const [urlValidationError, setUrlValidationError] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    policyType: '',
    description: ''
  });
  const [formStatus, setFormStatus] = useState('idle');
  const [showWebsiteModal, setShowWebsiteModal] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newTeamMember, setNewTeamMember] = useState({ email: '', role: 'viewer' });
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  const [inviteStatus, setInviteStatus] = useState('idle');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [requiredTier, setRequiredTier] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('monthly');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    // Load user policies
    const loadPolicies = () => {
      setLoading(true);
      try {
        const userPolicies = getUserPoliciesCurrent();
        setPolicies(userPolicies);
      } catch (error) {
        console.error('Error loading policies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      if (showDetailsModal) {
        setLoadingCountries(true);
        try {
          const response = await axios.get('https://restfulcountries.com/api/v1/countries', {
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
              'Accept': 'application/json'
            }
          });

          const sortedCountries = response.data.data
            .map(country => ({
              name: country.name,
              code: country.iso2,
              flag: country.emoji,
              region: country.region,
              capital: country.capital
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

          setCountries(sortedCountries);
        } catch (error) {
          console.error('Error fetching countries:', error);
          toast.error('Failed to load countries. Please try again.');
        } finally {
          setLoadingCountries(false);
        }
      }
    };

    fetchCountries();
  }, [showDetailsModal]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredPolicies = policies.filter(policy =>
    policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = (policy) => {
    setViewingPolicy(policy);
    setShowViewModal(true);
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setEditContent(policy.content);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPolicy) return;

    try {
      const result = await updateUserPolicy(editingPolicy.id, {
        content: editContent
      });

      if (result.success) {
        // Update the local state
        setPolicies(policies.map(p =>
          p.id === editingPolicy.id ? { ...p, content: editContent, updatedAt: new Date() } : p
        ));

        setShowEditModal(false);
        setEditingPolicy(null);
        setEditContent('');
      } else {
        console.error('Failed to update policy:', result.error);
      }
    } catch (error) {
      console.error('Error updating policy:', error);
    }
  };

  const handleDelete = async (policyId) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        const result = await deleteUserPolicy(policyId);

        if (result.success) {
          // Update the local state
          setPolicies(policies.filter(p => p.id !== policyId));
        } else {
          console.error('Failed to delete policy:', result.error);
        }
      } catch (error) {
        console.error('Error deleting policy:', error);
      }
    }
  };

  const handleDownloadPDF = (policy) => {
    const doc = new jsPDF();

    // Set title
    doc.setFontSize(16);
    doc.text(policy.title, 20, 20);

    // Set content
    doc.setFontSize(12);

    // Split content into lines to handle wrapping
    const contentLines = doc.splitTextToSize(policy.content, 170);
    doc.text(contentLines, 20, 30);

    // Save the PDF
    doc.save(`${policy.title.replace(/\s+/g, '_')}.pdf`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get the user's current subscription tier
  const getUserSubscriptionTier = () => {
    if (!subscription) return 0; // No subscription
    
    // Check package_id and map to tier
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return 0; // Inactive subscription
    }
    
    // Map package_id to tier (assumes package_id directly corresponds to tier)
    return subscription.package_id || 0;
  };

  const handleGeneratePolicy = async () => {
    const userTier = getUserSubscriptionTier();
    
    // If user has no subscription, direct them to upgrade
    if (userTier === 0) {
      toast.error('A subscription is required to generate policies. Please subscribe to continue.');
      setRequiredTier(1); // Set to tier 1 as the minimum requirement
      setShowUpgradeModal(true);
      return;
    }
    
    // Check if the subscription is in a valid state
    if (subscription && (subscription.status !== 'active' && subscription.status !== 'trialing')) {
      toast.error('Your subscription is not active. Please update your billing information or renew your subscription.');
      setShowSubscriptionModal(true);
      return;
    }
    
    // Check if there are any available policies for the user's tier
    const availablePolicies = getAvailablePolicies().filter(policy => policy.isAvailable);
    
    if (availablePolicies.length === 0) {
      toast.error('Your current subscription tier does not include any policy types. Please upgrade to access policies.');
      setRequiredTier(Math.min(userTier + 1, 3)); // Suggest the next tier up (max tier 3)
      setShowUpgradeModal(true);
      return;
    }
    
    // If all checks pass, show policy types
    toast.success(`You have access to ${availablePolicies.length} policy types with your current subscription.`);
    setShowPolicyTypeModal(true);
  };

  const handlePolicyTypeSelect = (typeId) => {
    // Check if user has required subscription for this policy type
    const requiredTierLevel = policyTierRequirements[typeId] || 1;
    const userTier = getUserSubscriptionTier();
    
    if (userTier < requiredTierLevel) {
      // User doesn't have required subscription
      setRequiredTier(requiredTierLevel);
      setShowPolicyTypeModal(false);
      setShowUpgradeModal(true);
      
      // Show more informative message
      const requiredTierName = getRequiredTierName(requiredTierLevel);
      toast.error(`This policy requires the ${requiredTierName} Package (Tier ${requiredTierLevel}). Please upgrade to continue.`);
      return;
    }
    
    // User has appropriate subscription, proceed as normal
    const selectedType = policyTypes.find(type => type.id === typeId);
    if (selectedType) {
      setSelectedPolicyType(selectedType);
      setShowPolicyTypeModal(false);
      setShowDetailsModal(true);
    }
  };

  // Function to handle upgrade from modal
  const handleUpgradeSubscription = () => {
    setShowUpgradeModal(false);
    setShowPricingModal(true);
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = {
      companyName: 'Company Name',
      website: 'Website',
      email: 'Email',
      industry: 'Industry',
      aiMaturityLevel: 'AI Maturity Level',
      templateStyle: 'Template Style'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !organizationDetails[field])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(organizationDetails.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate website URL format
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlRegex.test(organizationDetails.website)) {
      toast.error('Please enter a valid website URL');
      return;
    }

    // If all validations pass, proceed to step 2
    setShowDetailsModal(false);
    setShowRegulationsModal(true);
    
    // Show success message
    toast.success('Organization details saved successfully!');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrganizationDetails(prev => ({
      ...prev,
      [name]: value,
      // If country is selected, also store the full country data
      ...(name === 'country' && countries.length > 0 && {
        countryData: countries.find(c => c.code === value)
      }),
      // If the website field is changed manually, clear the stored websiteData 
      ...(name === 'website' && {
        website: value,
        websiteData: null
      })
    }));
    // Clear validation error if user types in website field
    if (name === 'website') {
      setUrlValidationError(null);
    }
  };

  const handleRegulationToggle = (regId) => {
    setSelectedRegulations(prev => {
      if (prev.includes(regId)) {
        return prev.filter(id => id !== regId);
      }
      return [...prev, regId];
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedPolicies(prev => [
      ...prev,
      ...files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date()
      }))
    ]);
  };

  const handleRegulationsSubmit = () => {
    setShowRegulationsModal(false);
    setShowPolicyGenerationModal(true);
    generateInitialPolicy();
  };

  const generateInitialPolicy = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      // Call OpenAI to generate the policy
      const generatedContent = await generatePolicy(
        selectedPolicyType.title,
        {
          ...organizationDetails,
          regulations: selectedRegulations,
          monitoringPreferences,
          existingPolicies: uploadedPolicies
        }
      );

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setGeneratedPolicy(generatedContent);

      // Add to version history
      setVersionHistory([
        {
          id: Date.now(),
          content: generatedContent,
          timestamp: new Date(),
          type: 'initial'
        }
      ]);
    } catch (error) {
      console.error('Error generating policy:', error);
      toast.error('Failed to generate policy. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextSelection = async () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText) {
      setSelectedText(selectedText);
      setShowSuggestions(true);

      try {
        // Get AI suggestions for the selected text
        const suggestions = await generateSuggestions(selectedText);
        setSuggestions(suggestions);
      } catch (error) {
        console.error('Error getting suggestions:', error);
        toast.error('Failed to get suggestions. Please try again.');
      }
    }
  };

  const handleSuggestionApply = (suggestion) => {
    const newContent = generatedPolicy.replace(selectedText, suggestion);
    setGeneratedPolicy(newContent);

    // Add to version history
    setVersionHistory(prev => [...prev, {
      id: Date.now(),
      content: newContent,
      timestamp: new Date(),
      type: 'edit'
    }]);

    setShowSuggestions(false);
  };

  const handleRegeneratePolicy = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const newContent = await generatePolicy(
        selectedPolicyType.title,
        {
          ...organizationDetails,
          regulations: selectedRegulations,
          monitoringPreferences,
          existingPolicies: uploadedPolicies
        }
      );

      setGeneratedPolicy(newContent);

      // Add to version history
      setVersionHistory(prev => [...prev, {
        id: Date.now(),
        content: newContent,
        timestamp: new Date(),
        type: 'regenerate'
      }]);
    } catch (error) {
      console.error('Error regenerating policy:', error);
      toast.error('Failed to regenerate policy. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePolicy = () => {
    // Create a new policy object
    const newPolicy = {
      id: Date.now(),
      title: selectedPolicyType.title,
      content: generatedPolicy,
      type: selectedPolicyType.id,
      createdAt: new Date().toISOString(),
      versions: versionHistory
    };

    // Add the policy to the list
    setPolicies(prev => [...prev, newPolicy]);

    // Reset all modals and states
    setShowPolicyGenerationModal(false);
    setSelectedPolicyType(null);
    setOrganizationDetails({
      companyName: '',
      website: '',
      email: '',
      country: '',
      industry: '',
      aiMaturityLevel: '',
      effectiveDate: '',
      templateStyle: ''
    });
    setSelectedRegulations([]);
    setUploadedPolicies([]);
    setMonitoringPreferences({
      autoUpdate: false,
      notifyChanges: true,
      reviewPeriod: 'quarterly'
    });
    setGeneratedPolicy('');
    setVersionHistory([]);
  };

  const handlePackageSelect = async (packageType) => {
    // Set the package details based on the selection
    const packageDetails = {
      name: packageType === 'basic' ? 'Basic Package' :
        packageType === 'professional' ? 'Professional Package' : 'Premium Package',
      price: packageType === 'basic' ? 900 :
        packageType === 'professional' ? 1500 : 3000,
      features: packageType === 'basic' ? [
        "AI Ethics Policy",
        "AI Risk Management Policy",
        "AI Data Governance Policy"
      ] : packageType === 'professional' ? [
        "All Basic Policies",
        "AI Security Policy",
        "Model Management Policy",
        "Human Oversight Policy",
        "AI Compliance Policy",
        "Use Case Evaluation Policy"
      ] : [
        "All Professional Policies",
        "Procurement & Vendor Policy",
        "Responsible AI Deployment",
        "Training & Capability Policy",
        "Incident Response Policy",
        "+9 More Specialized Policies"
      ]
    };

    setSelectedPackageDetails(packageDetails);
    setShowConfirmationModal(true);
  };

  const handleConfirmPackage = async () => {
    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPackageDetails.price * 100, // Convert to cents
          packageType: selectedPackageDetails.name
        })
      });

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (error) {
      toast.error('Failed to initialize payment. Please try again.');
      console.error('Payment initialization error:', error);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment successful! You can now create your policy.');
    setShowConfirmationModal(false);
    setClientSecret(null);
    setSelectedPackageDetails(null);
    // Continue with policy creation
    setShowPolicyTypeModal(true);
  };

  // Helper function to scrape website content
  const scrapeWebsite = async (url) => {
    try {
      // Prepend https:// if scheme is missing
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }

      // Try to find contact page URLs
      const contactPageUrls = [
        '/contact',
        '/contact-us',
        '/contactus',
        '/about/contact',
        '/company/contact',
        '/get-in-touch',
        '/reach-us',
        '/connect',
        '/support'
      ];

      // First try the main URL
      let mainPageContent = await fetchPageContent(url);
      let contactPageContent = null;

      // If no email found on main page, try contact pages
      if (!hasEmail(mainPageContent)) {
        for (const path of contactPageUrls) {
          try {
            const contactUrl = new URL(path, url).href;
            contactPageContent = await fetchPageContent(contactUrl);
            if (hasEmail(contactPageContent)) {
              break;
            }
          } catch (error) {
            console.log(`Failed to fetch ${path}:`, error);
            continue;
          }
        }
      }

      // Use whichever page had email content
      const content = contactPageContent || mainPageContent;
      const doc = content.doc;

      // Extract comprehensive content
      const title = doc.querySelector('title')?.textContent || '';
      const metaDescription = doc.querySelector('meta[name="description"]')?.content || '';
      const metaKeywords = doc.querySelector('meta[name="keywords"]')?.content || '';
      
      // Enhanced email extraction
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = Array.from(content.html.matchAll(emailPattern)).map(match => match[0]);
      
      // Extract contact form emails
      const contactFormEmails = Array.from(doc.querySelectorAll('input[type="email"], input[name*="email"], input[id*="email"]'))
        .map(input => input.value)
        .filter(value => value && value.includes('@'));
      
      // Extract emails from mailto links
      const mailtoEmails = Array.from(doc.querySelectorAll('a[href^="mailto:"]'))
        .map(link => link.href.replace('mailto:', ''))
        .filter(email => email.includes('@'));
      
      // Combine all email sources and remove duplicates
      const allEmails = [...new Set([...emails, ...contactFormEmails, ...mailtoEmails])];
      
      // Extract phone numbers
      const phonePattern = /(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x\d+)?/g;
      const phones = Array.from(content.html.matchAll(phonePattern)).map(match => match[0]);
      
      // Extract addresses
      const addressElements = Array.from(doc.querySelectorAll('address, [itemtype*="PostalAddress"]'));
      const addresses = addressElements.map(el => el.textContent.trim());
      
      // Extract social media links
      const socialLinks = Array.from(doc.querySelectorAll('a[href*="facebook.com"], a[href*="twitter.com"], a[href*="linkedin.com"], a[href*="instagram.com"]'))
        .map(el => ({ platform: el.href.split('.com')[0].split('//')[1], url: el.href }));
      
      // Extract headings and content
      const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(el => ({
        level: el.tagName.toLowerCase(),
        text: el.textContent.trim()
      }));
      
      const paragraphs = Array.from(doc.querySelectorAll('p')).map(el => el.textContent.trim());
      
      // Extract links
      const links = Array.from(doc.querySelectorAll('a')).map(el => ({
        text: el.textContent.trim(),
        href: el.href,
        isExternal: el.hostname !== new URL(url).hostname
      }));
      
      // Extract images
      const images = Array.from(doc.querySelectorAll('img')).map(el => ({
        src: el.src,
        alt: el.alt,
        title: el.title
      }));
      
      // Extract meta tags for additional context
      const metaTags = Array.from(doc.querySelectorAll('meta')).map(el => ({
        name: el.getAttribute('name') || el.getAttribute('property'),
        content: el.getAttribute('content')
      })).filter(tag => tag.name && tag.content);
      
      // Extract structured data (JSON-LD)
      const jsonLdScripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
      const structuredData = jsonLdScripts.map(script => {
        try {
          return JSON.parse(script.textContent);
        } catch (e) {
          return null;
        }
      }).filter(data => data !== null);

      return {
        title,
        metaDescription,
        metaKeywords,
        contactInfo: {
          emails: allEmails,
          phones: [...new Set(phones)],
          addresses: [...new Set(addresses)],
          socialMedia: socialLinks
        },
        content: {
          headings,
          paragraphs,
          links,
          images
        },
        metaTags,
        structuredData
      };
    } catch (error) {
      console.error('Error scraping website:', error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to access the website. Please ensure the URL is correct and the website is accessible.');
      }
      throw error;
    }
  };

  // Helper function to fetch page content
  const fetchPageContent = async (url) => {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(proxyUrl + url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4577.63 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page content: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    return { html, doc };
  };

  // Helper function to check if content has email
  const hasEmail = (content) => {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return emailPattern.test(content.html);
  };

  // Helper function to analyze website content
  const analyzeWebsiteContent = async (content) => {
    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const websiteContent = `
        Title: ${content.title}
        Description: ${content.metaDescription}
        Keywords: ${content.metaKeywords}
        
        Contact Information:
        Emails: ${content.contactInfo.emails.join(', ')}
        Phones: ${content.contactInfo.phones.join(', ')}
        Addresses: ${content.contactInfo.addresses.join(', ')}
        Social Media: ${content.contactInfo.socialMedia.map(sm => `${sm.platform}: ${sm.url}`).join(', ')}
        
        Content Structure:
        Headings: ${content.content.headings.map(h => `${h.level}: ${h.text}`).join('\n')}
        Main Content: ${content.content.paragraphs.join('\n')}
        
        Meta Information:
        ${content.metaTags.map(tag => `${tag.name}: ${tag.content}`).join('\n')}
        
        Structured Data:
        ${JSON.stringify(content.structuredData, null, 2)}
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a policy analysis assistant. Analyze the provided website content and suggest appropriate policy types and regulations based on the content. 
            Focus on identifying potential compliance requirements and security concerns. Return the response in JSON format with the following structure:
            {
                "companyName": "extracted company name",
                "industry": "suggested industry",
                "policyType": "suggested policy type",
                "description": "brief description",
                "suggestedRegulations": ["list of suggested regulations"],
                "securityConcerns": ["list of security concerns"],
                "contactInfo": {
                    "email": "primary contact email",
                    "phone": "primary contact phone",
                    "address": "primary business address"
                },
                "businessScope": "description of business scope and operations",
                "dataHandling": "description of data handling practices",
                "complianceRequirements": ["list of specific compliance requirements"],
                "riskFactors": ["list of identified risk factors"],
                "recommendedPolicies": ["list of recommended policy types"]
            }`
          },
          {
            role: "user",
            content: websiteContent
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      return analysis;
    } catch (error) {
      console.error('Error analyzing website content:', error);
      return null;
    }
  };

  const handleConfirmWebsiteUrl = async (e) => {
    e.preventDefault();
    if (!organizationDetails.website) {
      setUrlValidationError('Please enter a valid website URL');
      return;
    }

    try {
      setFormStatus('loading');
      setUrlValidationError(null);
      
      // First, try to scrape the website
      const scrapedContent = await scrapeWebsite(organizationDetails.website);
      if (!scrapedContent) {
        throw new Error('Failed to fetch website content');
      }
      
      // Then analyze the content
      const analysis = await analyzeWebsiteContent(scrapedContent);
      if (!analysis) {
        throw new Error('Failed to analyze website content');
      }
      
      // Update organization details with the analysis
      setOrganizationDetails(prev => ({
        ...prev,
        companyName: analysis.companyName || prev.companyName,
        industry: analysis.industry || prev.industry,
        websiteData: {
          scrapedContent,
          analysis
        }
      }));

      // Show success message
      toast.success('Website analyzed successfully! Form fields have been populated.');
      setFormStatus('idle');
      setShowWebsiteModal(false);
      
    } catch (error) {
      console.error('Error analyzing website:', error);
      setUrlValidationError(error.message || 'Failed to analyze website. Please try again or enter the details manually.');
      setFormStatus('idle');
    }
  };

  // Add this useEffect hook near the top of the component, after the state declarations
  useEffect(() => {
    if (showPolicyGenerationModal && selectedPolicyType) {
      generateInitialPolicy();
    }
  }, [showPolicyGenerationModal, selectedPolicyType]);

  // Fetch subscription data
  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchTeamMembers();
    }
  }, [user]);

  const fetchSubscription = async () => {
    setIsLoadingSubscription(true);
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          status,
          billing_cycle,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          stripe_subscription_id,
          package_id,
          packages:package_id (name, price_monthly, price_yearly)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to load subscription information');
      }

      if (data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error in subscription fetch:', error);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const fetchTeamMembers = async () => {
    setIsLoadingTeam(true);
    try {
      // First get the team ID
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (teamError && teamError.code !== 'PGRST116') {
        console.error('Error fetching team:', teamError);
        return;
      }

      if (teamData) {
        // Then get team members
        const { data: membersData, error: membersError } = await supabase
          .from('team_members')
          .select(`
            id,
            role,
            status,
            invited_email,
            user_id,
            users:user_id (email, first_name, last_name)
          `)
          .eq('team_id', teamData.id);

        if (membersError) {
          console.error('Error fetching team members:', membersError);
          return;
        }

        setTeamMembers(membersData || []);
      }
    } catch (error) {
      console.error('Error in team fetch:', error);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return;
    
    try {
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionId: subscription.stripe_subscription_id }
      });

      if (error) {
        throw error;
      }

      // Update local state without refetching
      setSubscription({
        ...subscription,
        cancel_at_period_end: true
      });

      toast.success('Your subscription has been set to cancel at the end of the billing period');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return;
    
    try {
      const { error } = await supabase.functions.invoke('reactivate-subscription', {
        body: { subscriptionId: subscription.stripe_subscription_id }
      });

      if (error) {
        throw error;
      }

      // Update local state without refetching
      setSubscription({
        ...subscription,
        cancel_at_period_end: false
      });

      toast.success('Your subscription has been reactivated');
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast.error('Failed to reactivate subscription. Please try again.');
    }
  };

  const handleChangeSubscription = () => {
    setShowPolicyTypeModal(false);
    setShowConfirmationModal(false);
    navigate('/pricing');
  };

  const handleInviteTeamMember = async (e) => {
    e.preventDefault();

    if (!newTeamMember.email || !isValidEmail(newTeamMember.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setInviteStatus('loading');
    try {
      // First check if we have a team
      let teamId;
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (teamError && teamError.code === 'PGRST116') {
        // No team exists, create one
        const { data: newTeam, error: createError } = await supabase
          .from('teams')
          .insert({
            owner_id: user.id,
            name: `${user.user_metadata?.name || 'Team'}'s Team`
          })
          .select('id')
          .single();

        if (createError) throw createError;
        teamId = newTeam.id;
      } else if (teamError) {
        throw teamError;
      } else {
        teamId = teamData.id;
      }

      // Now invite the team member
      const { error: inviteError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          invited_email: newTeamMember.email,
          role: newTeamMember.role,
          status: 'invited'
        });

      if (inviteError) throw inviteError;

      // Send invitation email via Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-team-invitation', {
        body: { 
          teamId,
          email: newTeamMember.email,
          inviterName: user.user_metadata?.name || user.email
        }
      });

      if (emailError) {
        console.error('Error sending invitation email:', emailError);
        // We still continue as the DB record was created
      }

      // Refresh team members
      fetchTeamMembers();
      setNewTeamMember({ email: '', role: 'viewer' });
      toast.success(`Invitation sent to ${newTeamMember.email}`);
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast.error('Failed to invite team member. Please try again.');
    } finally {
      setInviteStatus('idle');
    }
  };

  const handleRemoveTeamMember = async (memberId) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Update the local state
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
      toast.success('Team member removed successfully');
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member. Please try again.');
    }
  };

  const handleUpdateTeamMemberRole = async (memberId, newRole) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      // Update the local state
      setTeamMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));
      toast.success('Team member role updated');
    } catch (error) {
      console.error('Error updating team member role:', error);
      toast.error('Failed to update role. Please try again.');
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Filter policies based on subscription tier
  const getAvailablePolicies = () => {
    const userTier = getUserSubscriptionTier();
    
    return policyTypes.map(policy => {
      const requiredTier = policyTierRequirements[policy.id] || 1;
      const isAvailable = userTier >= requiredTier;
      
      return {
        ...policy,
        isAvailable,
        requiredTier
      };
    });
  };

  const handleSelectPricingTier = async (tierId, tierName, price) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      // Get corresponding Stripe priceId
      const stripePriceIds = {
        1: { // Foundational Package
          monthly: 'price_1OCn2xH2eZvKYlo2bQYoJCDF',
          yearly: 'price_1OCn2xH2eZvKYlo2CbX9XsLu'
        },
        2: { // Operational Package
          monthly: 'price_1OCn3SH2eZvKYlo2ZKrpoNtd',
          yearly: 'price_1OCn3SH2eZvKYlo231Sd3XYZ'
        },
        3: { // Strategic Package
          monthly: 'price_1OCn4AH2eZvKYlo22HZmRnXl',
          yearly: 'price_1OCn4AH2eZvKYlo2RofPzDCJ'
        }
      };

      const priceId = stripePriceIds[tierId]?.[selectedBillingCycle];
      
      if (!priceId) {
        throw new Error('Invalid pricing configuration');
      }

      // First try Supabase Edge Function
      try {
        const { data, error } = await supabase.functions.invoke('stripe-payment', {
          body: {
            priceId: priceId,
            packageId: tierId,
            packageName: tierName,
            customerEmail: user.email,
            billingCycle: selectedBillingCycle
          }
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(`Function error: ${error.message}`);
        }
        
        if (data?.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
          return;
        }
      } catch (fnError) {
        console.error('Edge function invocation failed, trying direct fetch:', fnError);
        
        // Try direct fetch to the function URL
        try {
          // Get the session token
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData?.session?.access_token || '';
          
          const response = await fetch('https://vgedgxfxhiiilzqydfxu.supabase.co/functions/v1/stripe-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              priceId: priceId,
              packageId: tierId,
              packageName: tierName,
              customerEmail: user.email,
              billingCycle: selectedBillingCycle
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const responseData = await response.json();
          
          if (responseData?.url) {
            window.location.href = responseData.url;
            return;
          }
        } catch (fetchError) {
          console.error('Direct fetch to edge function failed:', fetchError);
        }
      }

      // Fallback - Use the checkout page
      navigate(`/checkout?tier=${tierId}&cycle=${selectedBillingCycle}&name=${encodeURIComponent(tierName)}`);
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(`Payment setup failed: ${error.message}`);
      setIsProcessingPayment(false);
    }
  };

  // Check URL for subscription status on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = urlParams.get('subscription');
    const tier = urlParams.get('tier');
    const name = urlParams.get('name');
    
    if (subscriptionStatus === 'success') {
      const tierName = name || 'subscription';
      toast.success(`${tierName} subscription successful! You can now create policies.`);
      // Remove the query parameter without refreshing the page
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh subscription data
      fetchSubscription();
    } else if (subscriptionStatus === 'cancelled') {
      toast.info('Subscription process was cancelled.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Determine if a policy type is available or requires upgrade
  const isPolicyAvailable = (policyTypeId) => {
    const userTier = getUserSubscriptionTier();
    const requiredTier = policyTierRequirements[policyTypeId] || 1;
    return userTier >= requiredTier;
  };

  // Get the name of the tier required for a policy
  const getRequiredTierName = (requiredTierId) => {
    const tiers = {
      1: "Foundational",
      2: "Operational",
      3: "Strategic"
    };
    return tiers[requiredTierId] || "Upgrade";
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#E2DDFF] mb-2">My Policies</h2>
          <p className="text-[#B4A5FF]">
            Manage and download your generated policies.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTeamModal(true)}
            className="flex items-center px-4 py-2 rounded-lg font-medium bg-[#B4A5FF]/20 text-[#E2DDFF] hover:bg-[#B4A5FF]/30 transition-all duration-200 mr-2"
          >
            <Users className="mr-2 w-4 h-4" />
            Team
          </button>
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="flex items-center px-4 py-2 rounded-lg font-medium bg-[#B4A5FF]/20 text-[#E2DDFF] hover:bg-[#B4A5FF]/30 transition-all duration-200 mr-2"
          >
            <CreditCard className="mr-2 w-4 h-4" />
            Subscription
          </button>
        <button
          onClick={handleGeneratePolicy}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            getUserSubscriptionTier() === 0
              ? "bg-[#B4A5FF]/10 text-[#B4A5FF] hover:bg-[#B4A5FF]/20" // No subscription
              : "bg-[#B4A5FF]/20 text-[#E2DDFF] hover:bg-[#B4A5FF]/30" // Has subscription
          }`}
        >
          {getUserSubscriptionTier() === 0 ? (
            <>
              <Crown className="mr-2 w-4 h-4" />
              Subscribe to Generate
            </>
          ) : (
            <>
              <FaPlus className="mr-2 w-4 h-4" />
              Generate Policy
            </>
          )}
        </button>
        </div>
      </div>

      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search policies..."
            className="w-full px-4 py-3 pl-10 pr-4 text-[#E2DDFF] bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg focus:outline-none focus:border-[#B4A5FF]/40 placeholder-[#B4A5FF]/50"
            value={searchQuery}
            onChange={handleSearch}
          />
          <FaSearch className="absolute left-3 top-3.5 text-[#B4A5FF]" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B4A5FF]"></div>
        </div>
      ) : policies.length === 0 ? (
        <div className="bg-[#13091F] rounded-xl p-8 border border-[#2E1D4C]/30">
          <p className="text-[#B4A5FF] mb-4 text-center">
            {getUserSubscriptionTier() === 0 
              ? "You need a subscription to create policies." 
              : "You haven't created any policies yet."}
          </p>
          <div className="flex justify-center">
            <button
              onClick={getUserSubscriptionTier() === 0 ? handleUpgradeSubscription : handleGeneratePolicy}
              className="inline-flex items-center px-4 py-2 rounded-lg font-medium bg-[#B4A5FF]/20 text-[#E2DDFF] hover:bg-[#B4A5FF]/30 transition-all duration-200"
            >
              {getUserSubscriptionTier() === 0 ? (
                <>
                  <Crown className="mr-2 w-4 h-4" />
                  Upgrade Now
                </>
              ) : (
                <>
                  <FaPlus className="mr-2 w-4 h-4" />
                  Create Your First Policy
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPolicies.map(policy => (
            <div
              key={policy.id}
              className="group bg-[#13091F] rounded-xl border border-[#2E1D4C]/30 hover:border-[#B4A5FF]/30 transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#B4A5FF]/10 rounded-lg group-hover:bg-[#B4A5FF]/20 transition-colors">
                      <FaFileAlt className="w-5 h-5 text-[#B4A5FF]" />
                    </div>
                    <h3 className="font-semibold text-lg text-[#E2DDFF]">
                      {policy.title}
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(policy)}
                      className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] hover:bg-[#B4A5FF]/10 rounded-lg transition-colors"
                      title="View Policy"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(policy)}
                      className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] hover:bg-[#B4A5FF]/10 rounded-lg transition-colors"
                      title="Edit Policy"
                    >
                      <FaPen className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(policy)}
                      className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] hover:bg-[#B4A5FF]/10 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <FaDownload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(policy.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete Policy"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-[#B4A5FF]">
                    <FaClock className="w-4 h-4" />
                    <span>Created: {formatDate(policy.createdAt)}</span>
                  </div>
                  {policy.updatedAt && (
                    <div className="flex items-center gap-2 text-sm text-[#B4A5FF]">
                      <FaPen className="w-4 h-4" />
                      <span>Updated: {formatDate(policy.updatedAt)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-[#2E1D4C]/30 rounded-xl p-4 relative">
                  <div className="text-[#B4A5FF] text-sm line-clamp-3">
                    {policy.content}
                  </div>
                  {policy.content.length > 250 && (
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#13091F] to-transparent"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In-dashboard Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
              aria-hidden="true"
              onClick={() => !isProcessingPayment && setShowPricingModal(false)}
            />

            <div className="inline-block w-full max-w-6xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#13091F] rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
              <div className="flex justify-between items-center mb-6 border-b border-[#2E1D4C]/30 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#E2DDFF]">Choose Your Subscription</h3>
                  <p className="mt-1 text-[#B4A5FF]">
                    Select a plan that best fits your needs
                  </p>
                </div>
                <button
                  onClick={() => !isProcessingPayment && setShowPricingModal(false)}
                  className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                  disabled={isProcessingPayment}
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Billing cycle toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-[#2E1D4C]/30 p-1 rounded-lg flex">
                  <button
                    onClick={() => setSelectedBillingCycle('monthly')}
                    className={`px-4 py-2 rounded-md ${
                      selectedBillingCycle === 'monthly'
                        ? 'bg-[#B4A5FF]/30 text-white'
                        : 'text-[#B4A5FF] hover:bg-[#2E1D4C]/50'
                    } transition-colors`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setSelectedBillingCycle('yearly')}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      selectedBillingCycle === 'yearly'
                        ? 'bg-[#B4A5FF]/30 text-white'
                        : 'text-[#B4A5FF] hover:bg-[#2E1D4C]/50'
                    } transition-colors`}
                  >
                    Yearly
                    <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Pricing tiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Foundational Package */}
                <div className="bg-[#2E1D4C]/20 rounded-xl overflow-hidden border border-[#2E1D4C]/50 hover:border-blue-500/30 transition-all duration-300">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                          Tier 1
                        </span>
                        <h3 className="text-xl font-bold text-[#E2DDFF] mt-2">Foundational Package</h3>
                      </div>
                      <Star className="w-6 h-6 text-blue-400" />
                    </div>
                    
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-[#E2DDFF]">
                        ${selectedBillingCycle === 'monthly' ? '900' : '720'}
                      </span>
                      <span className="text-[#B4A5FF]">/{selectedBillingCycle === 'monthly' ? 'month' : 'month, billed annually'}</span>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-[#E2DDFF] font-medium mb-2">What's included:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                          <span className="text-[#B4A5FF]">AI Ethics Policy</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                          <span className="text-[#B4A5FF]">Risk Management Policy</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                          <span className="text-[#B4A5FF]">Data Governance Policy</span>
                        </li>
                        <li className="flex items-start">
                          <X className="w-5 h-5 text-[#6F6A7D] mr-2 mt-0.5" />
                          <span className="text-[#6F6A7D]">Advanced Policies</span>
                        </li>
                        <li className="flex items-start">
                          <X className="w-5 h-5 text-[#6F6A7D] mr-2 mt-0.5" />
                          <span className="text-[#6F6A7D]">Strategic Policies</span>
                        </li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => handleSelectPricingTier(1, 'Foundational Package', selectedBillingCycle === 'monthly' ? 900 : 720)}
                      disabled={isProcessingPayment}
                      className="mt-6 w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-[#E2DDFF] rounded-lg transition-colors flex justify-center items-center disabled:opacity-50"
                    >
                      {isProcessingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Select Plan'}
                    </button>
                  </div>
                </div>
                
                {/* Operational Package */}
                <div className="bg-[#2E1D4C]/20 rounded-xl overflow-hidden border border-[#2E1D4C]/50 hover:border-purple-500/30 transition-all duration-300 relative">
                  <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 h-1"></div>
                  <div className="absolute top-0 inset-x-0 flex justify-center">
                    <span className="bg-purple-900 px-3 py-1 text-purple-300 text-xs rounded-b-lg">
                      Popular Choice
                    </span>
                  </div>
                  
                  <div className="p-6 pt-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                          Tier 2
                        </span>
                        <h3 className="text-xl font-bold text-[#E2DDFF] mt-2">Operational Package</h3>
                      </div>
                      <Star className="w-6 h-6 text-purple-400" />
                    </div>
                    
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-[#E2DDFF]">
                        ${selectedBillingCycle === 'monthly' ? '1,500' : '1,200'}
                      </span>
                      <span className="text-[#B4A5FF]">/{selectedBillingCycle === 'monthly' ? 'month' : 'month, billed annually'}</span>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-[#E2DDFF] font-medium mb-2">What's included:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-purple-400 mr-2 mt-0.5" />
                          <span className="text-[#B4A5FF]">All Foundational Policies</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-purple-400 mr-2 mt-0.5" />
                          <span className="text-[#B4A5FF]">AI Security Policy</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-purple-400 mr-2 mt-0.5" />
                          <span className="text-[#B4A5FF]">Model Management Policy</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-purple-400 mr-2 mt-0.5" />
                          <span className="text-[#B4A5FF]">Human Oversight Policy</span>
                        </li>
                        <li className="flex items-start">
                          <X className="w-5 h-5 text-[#6F6A7D] mr-2 mt-0.5" />
                          <span className="text-[#6F6A7D]">Strategic Policies</span>
                        </li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => handleSelectPricingTier(2, 'Operational Package', selectedBillingCycle === 'monthly' ? 1500 : 1200)}
                      disabled={isProcessingPayment}
                      className="mt-6 w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-[#E2DDFF] rounded-lg transition-colors flex justify-center items-center disabled:opacity-50"
                    >
                      {isProcessingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Select Plan'}
                    </button>
                  </div>
                </div>
                
                {/* Strategic Package */}
                <div className="bg-[#2E1D4C]/20 rounded-xl overflow-hidden border border-[#2E1D4C]/50 hover:border-red-500/30 transition-all duration-300">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                          Tier 3
                        </span>
                        <h3 className="text-xl font-bold text-[#E2DDFF] mt-2">Strategic Package</h3>
                      </div>
                      <Crown className="w-6 h-6 text-red-400" />
                    </div>
                    
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-[#E2DDFF]">
                        ${selectedBillingCycle === 'monthly' ? '3,000' : '2,400'}
                      </span>
                      <span className="text-[#B4A5FF]">/{selectedBillingCycle === 'monthly' ? 'month' : 'month, billed annually'}</span>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-[#E2DDFF] font-medium mb-2">What's included:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                          <span className="text-[#B4A5FF]">All Operational Policies</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                          <span className="text-[#B4A5FF]">Procurement & Vendor Policy</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                          <span className="text-[#B4A5FF]">Responsible AI Deployment</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                          <span className="text-[#B4A5FF]">Training & Capability Policy</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                          <span className="text-[#B4A5FF]">Incident Response Policy</span>
                        </li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => handleSelectPricingTier(3, 'Strategic Package', selectedBillingCycle === 'monthly' ? 3000 : 2400)}
                      disabled={isProcessingPayment}
                      className="mt-6 w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-[#E2DDFF] rounded-lg transition-colors flex justify-center items-center disabled:opacity-50"
                    >
                      {isProcessingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Select Plan'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy Selection Modal modified to only show available policies */}
      {showPolicyTypeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
              aria-hidden="true"
              onClick={() => setShowPolicyTypeModal(false)}
            />

            <div className="inline-block w-full max-w-6xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#13091F] rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
              <div className="flex justify-between items-center mb-6 border-b border-[#2E1D4C]/30 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#E2DDFF]">Select Policy Type</h3>
                  <p className="mt-1 text-[#B4A5FF]">
                    {getUserSubscriptionTier() > 0 
                      ? "Choose the type of policy you want to generate" 
                      : "Subscribe to generate these policies"}
                  </p>
                </div>
                <button
                  onClick={() => setShowPolicyTypeModal(false)}
                  className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAvailablePolicies().map((policyType) => {
                  const userTier = getUserSubscriptionTier();
                  const isAvailable = policyType.isAvailable;
                  const requiredTierName = getRequiredTierName(policyType.requiredTier);
                  
                  return (
                    <div
                      key={policyType.id}
                      onClick={() => isAvailable ? handlePolicyTypeSelect(policyType.id) : null}
                      className={`p-4 rounded-lg border transition-all duration-200 relative ${
                        isAvailable
                          ? "border-[#B4A5FF]/30 hover:border-[#B4A5FF]/60 hover:bg-[#2E1D4C]/30 cursor-pointer"
                          : "border-[#2E1D4C]/30 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-[#13091F]/70 backdrop-blur-[1px] rounded-lg flex flex-col items-center justify-center z-10">
                          <Lock className="w-8 h-8 text-[#B4A5FF]" />
                          <p className="mt-2 text-[#B4A5FF] font-medium text-center px-2">
                            Requires {requiredTierName} Package
                          </p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPolicyTypeModal(false);
                              setRequiredTier(policyType.requiredTier);
                              setShowUpgradeModal(true);
                            }}
                            className="mt-2 px-3 py-1 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded hover:bg-[#B4A5FF]/30 transition-colors"
                          >
                            Upgrade
                          </button>
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between">
                        <div className="rounded-lg p-2 bg-[#2E1D4C]/50">
                          {policyType.icon}
                        </div>
                        <div className="bg-[#2E1D4C]/30 px-2 py-1 rounded text-xs text-[#B4A5FF]">
                          {requiredTierName} Tier
                        </div>
                      </div>
                      <h4 className="text-[#E2DDFF] font-semibold mt-3 mb-1">{policyType.title}</h4>
                      <p className="text-[#B4A5FF] text-sm">{policyType.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
              aria-hidden="true"
              onClick={() => setShowUpgradeModal(false)}
            />

            <div className="inline-block w-full max-w-md px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#13091F] rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2E1D4C]/50 mb-4">
                  <Crown className="w-8 h-8 text-[#B4A5FF]" />
                </div>
                <h3 className="text-xl font-bold text-[#E2DDFF] mb-2">
                  {requiredTier ? `Upgrade to ${getRequiredTierName(requiredTier)} Package` : 'Subscription Required'}
                </h3>
                <p className="text-[#B4A5FF] mb-4">
                  {requiredTier ? (
                    <>
                      This policy requires our {getRequiredTierName(requiredTier)} Package (Tier {requiredTier}).
                      <br/>Upgrade to unlock access.
                    </>
                  ) : (
                    'You need a subscription to create policies.'
                  )}
                </p>
                
                {requiredTier && (
                  <div className="bg-[#2E1D4C]/30 p-4 rounded-lg w-full text-left mb-6">
                    <h4 className="text-[#E2DDFF] font-semibold mb-2">
                      {getRequiredTierName(requiredTier)} Package Benefits:
                    </h4>
                    <ul className="space-y-2">
                      {requiredTier >= 1 && (
                        <>
                          <li className="flex items-center text-[#B4A5FF]">
                            <FaCheck className="text-[#B4A5FF] mr-2 w-4 h-4" />
                            AI Ethics & Responsible AI Policy
                          </li>
                          <li className="flex items-center text-[#B4A5FF]">
                            <FaCheck className="text-[#B4A5FF] mr-2 w-4 h-4" />
                            Data Governance & Security Policies
                          </li>
                        </>
                      )}
                      {requiredTier >= 2 && (
                        <>
                          <li className="flex items-center text-[#B4A5FF]">
                            <FaCheck className="text-[#B4A5FF] mr-2 w-4 h-4" />
                            Model Management & Use Case Policies
                          </li>
                          <li className="flex items-center text-[#B4A5FF]">
                            <FaCheck className="text-[#B4A5FF] mr-2 w-4 h-4" />
                            Regulatory Compliance & Oversight
                          </li>
                        </>
                      )}
                      {requiredTier >= 3 && (
                        <>
                          <li className="flex items-center text-[#B4A5FF]">
                            <FaCheck className="text-[#B4A5FF] mr-2 w-4 h-4" />
                            AI Innovation & Training Policies
                          </li>
                          <li className="flex items-center text-[#B4A5FF]">
                            <FaCheck className="text-[#B4A5FF] mr-2 w-4 h-4" />
                            Advanced Governance & Compliance
                          </li>
                        </>
                      )}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-[#2E1D4C]/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[#E2DDFF] font-medium">Price:</span>
                        <span className="text-[#E2DDFF] font-bold">
                          ${subscriptionTiers[requiredTier]?.price || '0'}/month
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 px-4 py-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpgradeSubscription}
                    className="flex-1 px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors"
                  >
                    View Plans
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organization Details Modal */}
      {showDetailsModal && selectedPolicyType && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
              aria-hidden="true"
            />

            <div className="inline-block w-full max-w-4xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#13091F] rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
              <div className="flex justify-between items-center mb-6 border-b border-[#2E1D4C]/30 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#E2DDFF]">
                    Provide Details for {selectedPolicyType?.title}
                  </h3>
                  <p className="mt-1 text-[#B4A5FF]">
                    Enter organization details manually or analyze your website to auto-fill the form.
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDetailsSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-[#E2DDFF] mb-4">1. Organization Details</h4>

                  <div className="space-y-4">
                    {/* Company Name Input */}
                    <div>
                      <label className="block text-sm font-medium text-[#B4A5FF] mb-2">
                        Company Name*
                      </label>
                      <div className="relative">
                        <FaBuilding className="absolute left-3 top-3 text-[#B4A5FF]" />
                        <input
                          type="text"
                          name="companyName"
                          value={organizationDetails.companyName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 rounded-lg text-[#E2DDFF] focus:border-[#B4A5FF]/50 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Website Input Section */}
                    <div>
                      <label className="block text-sm font-medium text-[#B4A5FF] mb-2">
                        Website* (Enter URL and click Analyze)
                      </label>
                      <div className="flex gap-2 items-start">
                        <div className="relative flex-grow">
                          <FaGlobe className="absolute left-3 top-3 text-[#B4A5FF]" />
                          <input
                            type="text"
                            name="website"
                            ref={websiteInputRef}
                            value={organizationDetails.website}
                            onChange={handleInputChange}
                            placeholder="e.g., example.com or www.example.com"
                            className="w-full pl-10 pr-4 py-2 bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 rounded-lg text-[#E2DDFF] focus:border-[#B4A5FF]/50 focus:outline-none"
                            required
                          />
                        </div>
                        <button
                          onClick={handleConfirmWebsiteUrl}
                          type="button"
                          disabled={formStatus === 'loading'}
                          className={`px-4 py-2 rounded-md shrink-0 bg-[#B4A5FF]/20 hover:bg-[#B4A5FF]/30 text-[#E2DDFF] flex items-center justify-center ${
                            formStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          style={{ height: '42px' }}
                        >
                          {formStatus === 'loading' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Analyze Website'
                          )}
                        </button>
                      </div>
                      {urlValidationError && (
                        <p className="mt-2 text-sm text-red-400">{urlValidationError}</p>
                      )}
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-medium text-[#B4A5FF] mb-2">
                        Email*
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-3 text-[#B4A5FF]" />
                        <input
                          type="email"
                          name="email"
                          value={organizationDetails.email}
                          onChange={handleInputChange}
                          placeholder="contact@example.com"
                          className="w-full pl-10 pr-4 py-2 bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 rounded-lg text-[#E2DDFF] focus:border-[#B4A5FF]/50 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Industry, AI Maturity, Effective Date Inputs */}
                    <div>
                      <label className="block text-sm font-medium text-[#B4A5FF] mb-2">
                        Industry
                      </label>
                      <div className="relative">
                        <FaIndustry className="absolute left-3 top-3 text-[#B4A5FF]" />
                        <select
                          name="industry"
                          value={organizationDetails.industry}
                          onChange={handleInputChange}
                          className={dropdownStyles.select}
                        >
                          <option value="" className={dropdownStyles.option}>Select Industry</option>
                          {industries.map(industry => (
                            <option
                              key={industry}
                              value={industry}
                              className={dropdownStyles.option}
                            >
                              {industry}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#B4A5FF] mb-2">
                        AI Maturity Level
                      </label>
                      <div className="relative">
                        <FaChartLine className="absolute left-3 top-3 text-[#B4A5FF]" />
                        <select
                          name="aiMaturityLevel"
                          value={organizationDetails.aiMaturityLevel}
                          onChange={handleInputChange}
                          className={dropdownStyles.select}
                        >
                          <option value="" className={dropdownStyles.option}>Select Maturity Level</option>
                          {aiMaturityLevels.map(level => (
                            <option
                              key={level}
                              value={level}
                              className={dropdownStyles.option}
                            >
                              {level}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#B4A5FF] mb-2">
                        Effective Date
                      </label>
                      <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-3 text-[#B4A5FF]" />
                        <input
                          type="date"
                          name="effectiveDate"
                          value={organizationDetails.effectiveDate}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 rounded-lg text-[#E2DDFF] focus:border-[#B4A5FF]/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Style Selection */}
                <div>
                  <h4 className="text-lg font-semibold text-[#E2DDFF] mb-4">2. Select Template Style</h4>
                  <div className="space-y-4">
                    {templateStyles.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => handleInputChange({ target: { name: 'templateStyle', value: style.id } })}
                        className={cn(
                          "w-full p-4 rounded-lg border transition-all duration-200 flex items-start gap-4",
                          organizationDetails.templateStyle === style.id
                            ? "border-[#B4A5FF] bg-[#2E1D4C]/50"
                            : "border-[#2E1D4C]/50 bg-[#2E1D4C]/30 hover:border-[#B4A5FF]/50"
                        )}
                      >
                        <div className="p-2 rounded-lg bg-[#2E1D4C]">
                          <style.icon className="w-5 h-5 text-[#B4A5FF]" />
                        </div>
                        <div className="flex-1 text-left">
                          <h5 className="font-medium text-[#E2DDFF] mb-1">{style.title}</h5>
                          <p className="text-sm text-[#B4A5FF]">{style.description}</p>
                        </div>
                      </button>
                    ))}

                    <button
                      type="submit"
                      className="w-full mt-6 px-6 py-3 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg font-medium hover:bg-[#B4A5FF]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Regulations
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Regulations Modal */}
      {showRegulationsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
              aria-hidden="true"
            />

            <div className="inline-block w-full max-w-4xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#13091F] rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
              <div className="flex justify-between items-center mb-6 border-b border-[#2E1D4C]/30 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#E2DDFF]">
                    Integration of Regulations and Standards
                  </h3>
                  <p className="mt-1 text-[#B4A5FF]">
                    Select applicable regulations and configure compliance monitoring
                  </p>
                </div>
                <button
                  onClick={() => setShowRegulationsModal(false)}
                  className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Regulations Selection */}
                <div>
                  <h4 className="text-lg font-semibold text-[#E2DDFF] mb-4 flex items-center">
                    <FaGavel className="w-5 h-5 mr-2" />
                    Select Applicable Regulations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(regulations).map(([region, regs]) => (
                      <div key={region} className="space-y-3">
                        <h5 className="text-[#B4A5FF] capitalize">{region} Regulations</h5>
                        {regs.map(reg => (
                          <button
                            key={reg.id}
                            onClick={() => handleRegulationToggle(reg.id)}
                            className={cn(
                              "w-full p-3 rounded-lg border transition-all duration-200 flex items-center gap-3",
                              selectedRegulations.includes(reg.id)
                                ? "border-[#B4A5FF] bg-[#2E1D4C]/50"
                                : "border-[#2E1D4C]/50 bg-[#2E1D4C]/30 hover:border-[#B4A5FF]/50"
                            )}
                          >
                            <div className="p-2 rounded-lg bg-[#2E1D4C]">
                              {selectedRegulations.includes(reg.id) ? (
                                <FaRegCheckCircle className="w-4 h-4 text-[#B4A5FF]" />
                              ) : (
                                <FaBook className="w-4 h-4 text-[#B4A5FF]" />
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <h6 className="font-medium text-[#E2DDFF]">{reg.name}</h6>
                              <p className="text-sm text-[#B4A5FF]">{reg.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monitoring Configuration */}
                <div>
                  <h4 className="text-lg font-semibold text-[#E2DDFF] mb-4 flex items-center">
                    <FaSync className="w-5 h-5 mr-2" />
                    Monitoring and Updates
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={monitoringPreferences.autoUpdate}
                          onChange={(e) => setMonitoringPreferences(prev => ({
                            ...prev,
                            autoUpdate: e.target.checked
                          }))}
                          className="form-checkbox h-5 w-5 text-[#B4A5FF] rounded border-[#2E1D4C]"
                        />
                        <span className="text-[#E2DDFF]">Enable automatic updates</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={monitoringPreferences.notifyChanges}
                          onChange={(e) => setMonitoringPreferences(prev => ({
                            ...prev,
                            notifyChanges: e.target.checked
                          }))}
                          className="form-checkbox h-5 w-5 text-[#B4A5FF] rounded border-[#2E1D4C]"
                        />
                        <span className="text-[#E2DDFF]">Notify on regulatory changes</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#B4A5FF] mb-2">
                        Review Period
                      </label>
                      <select
                        value={monitoringPreferences.reviewPeriod}
                        onChange={(e) => setMonitoringPreferences(prev => ({
                          ...prev,
                          reviewPeriod: e.target.value
                        }))}
                        className="w-full px-4 py-2 bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 rounded-lg text-[#E2DDFF] focus:border-[#B4A5FF]/50 focus:outline-none"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="biannual">Bi-annual</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Existing Policy Integration */}
                <div>
                  <h4 className="text-lg font-semibold text-[#E2DDFF] mb-4 flex items-center">
                    <FaLink className="w-5 h-5 mr-2" />
                    Existing Policy Integration
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center w-full p-6 border-2 border-dashed border-[#2E1D4C] rounded-lg hover:border-[#B4A5FF]/50 transition-colors cursor-pointer">
                        <FaUpload className="w-8 h-8 text-[#B4A5FF] mb-2" />
                        <span className="text-sm text-[#E2DDFF]">Upload existing policies</span>
                        <span className="text-xs text-[#B4A5FF] mt-1">PDF, DOC, DOCX up to 10MB</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {uploadedPolicies.length > 0 && (
                      <div className="space-y-2">
                        {uploadedPolicies.map(file => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-[#2E1D4C]/30 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <FaFileAlt className="w-4 h-4 text-[#B4A5FF]" />
                              <span className="text-sm text-[#E2DDFF]">{file.name}</span>
                            </div>
                            <button
                              onClick={() => setUploadedPolicies(prev => prev.filter(f => f.id !== file.id))}
                              className="p-1 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleRegulationsSubmit}
                    className="px-6 py-3 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg font-medium hover:bg-[#B4A5FF]/30 transition-colors"
                  >
                    Continue to Policy Generation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingPolicy && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#13091F] rounded-xl border border-[#2E1D4C]/30 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-[#2E1D4C]/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#B4A5FF]/10 rounded-lg">
                  <FaFileAlt className="w-5 h-5 text-[#B4A5FF]" />
                </div>
                <h3 className="text-xl font-semibold text-[#E2DDFF]">
                  {viewingPolicy.title}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleDownloadPDF(viewingPolicy)}
                  className="flex items-center gap-2 px-3 py-2 text-[#B4A5FF] hover:text-[#E2DDFF] hover:bg-[#B4A5FF]/10 rounded-lg transition-colors"
                >
                  <FaDownload className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewingPolicy);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-[#B4A5FF] hover:text-[#E2DDFF] hover:bg-[#B4A5FF]/10 rounded-lg transition-colors"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] hover:bg-[#B4A5FF]/10 rounded-lg transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              <div className="bg-[#2E1D4C]/30 p-6 rounded-xl text-[#B4A5FF] whitespace-pre-wrap">
                {viewingPolicy.content}
              </div>
            </div>

            <div className="p-6 border-t border-[#2E1D4C]/30 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-[#B4A5FF]">
                  <FaClock className="w-4 h-4" />
                  <span>Created: {formatDate(viewingPolicy.createdAt)}</span>
                </div>
                {viewingPolicy.updatedAt && (
                  <div className="flex items-center gap-2 text-sm text-[#B4A5FF]">
                    <FaEdit className="w-4 h-4" />
                    <span>Updated: {formatDate(viewingPolicy.updatedAt)}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#13091F] rounded-xl border border-[#2E1D4C]/30 w-full max-w-4xl">
            <div className="flex justify-between items-center p-6 border-b border-[#2E1D4C]/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#B4A5FF]/10 rounded-lg">
                  <FaEdit className="w-5 h-5 text-[#B4A5FF]" />
                </div>
                <h3 className="text-xl font-semibold text-[#E2DDFF]">
                  Edit Policy - {editingPolicy?.title}
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] hover:bg-[#B4A5FF]/10 rounded-lg transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <textarea
                className="w-full h-96 p-4 text-[#E2DDFF] bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-xl focus:outline-none focus:border-[#B4A5FF]/40 resize-none"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>

            <div className="flex justify-end items-center gap-4 p-6 border-t border-[#2E1D4C]/30">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Editor */}
      {showPolicyEditor && (
        <PolicyEditor
          initialData={{
            policyType: selectedPolicyType.id,
            policyTitle: selectedPolicyType.title,
            organizationDetails,
            regulations: {
              selected: selectedRegulations,
              monitoring: monitoringPreferences,
              existingPolicies: uploadedPolicies
            },
            packageType: 'basic' // This should come from user's subscription
          }}
          onSave={async (data) => {
            try {
              // Add the new policy to the list
              const newPolicy = {
                id: Date.now(),
                title: selectedPolicyType.title,
                content: data.content,
                type: selectedPolicyType.id,
                createdAt: new Date().toISOString(),
                versions: data.versions
              };

              setPolicies(prev => [...prev, newPolicy]);
              setShowPolicyEditor(false);

              // Reset the form data
              setSelectedPolicyType(null);
              setOrganizationDetails({
                companyName: '',
                website: '',
                email: '',
                country: '',
                industry: '',
                aiMaturityLevel: '',
                effectiveDate: '',
                templateStyle: ''
              });
              setSelectedRegulations([]);
              setUploadedPolicies([]);
              setMonitoringPreferences({
                autoUpdate: false,
                notifyChanges: true,
                reviewPeriod: 'quarterly'
              });
            } catch (error) {
              console.error('Error saving policy:', error);
            }
          }}
          onClose={() => {
            setShowPolicyEditor(false);
            // Reset the form data
            setSelectedPolicyType(null);
            setOrganizationDetails({
              companyName: '',
              website: '',
              email: '',
              country: '',
              industry: '',
              aiMaturityLevel: '',
              effectiveDate: '',
              templateStyle: ''
            });
            setSelectedRegulations([]);
            setUploadedPolicies([]);
            setMonitoringPreferences({
              autoUpdate: false,
              notifyChanges: true,
              reviewPeriod: 'quarterly'
            });
          }}
        />
      )}

      {/* Policy Generation Modal */}
      {showPolicyGenerationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
              aria-hidden="true"
            />

            <div className="inline-block w-full max-w-6xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#13091F] rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
              <div className="flex justify-between items-center mb-6 border-b border-[#2E1D4C]/30 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#E2DDFF]">
                    Generate {selectedPolicyType?.title}
                  </h3>
                  <p className="mt-1 text-[#B4A5FF]">
                    Edit and refine your policy using AI assistance
                  </p>
                </div>
                <button
                  onClick={() => setShowPolicyGenerationModal(false)}
                  className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="flex h-[calc(100vh-20rem)] gap-4">
                {/* Main Editor */}
                <div className="flex-1 flex flex-col">
                  {isGenerating ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-full max-w-xs mx-auto mb-4 h-2 bg-[#2E1D4C] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#B4A5FF] transition-all duration-300"
                            style={{ width: `${generationProgress}%` }}
                          />
                        </div>
                        <p className="text-[#E2DDFF] mb-2">Generating Policy...</p>
                        <p className="text-[#B4A5FF] text-sm">This may take a moment</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex-1 p-6 bg-[#2E1D4C]/30 rounded-lg overflow-y-auto"
                      onMouseUp={handleTextSelection}
                    >
                      <div
                        contentEditable
                        className="min-h-full text-[#E2DDFF] focus:outline-none whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: generatedPolicy }}
                      />
                    </div>
                  )}

                  {/* Editor Controls */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#2E1D4C]/30">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleRegeneratePolicy}
                        disabled={isGenerating}
                        className="flex items-center px-4 py-2 rounded-lg font-medium bg-[#B4A5FF]/20 text-[#E2DDFF] hover:bg-[#B4A5FF]/30 transition-all duration-200 disabled:opacity-50"
                      >
                        <FaSync className="mr-2 w-4 h-4" />
                        Regenerate
                      </button>
                      <button
                        onClick={handleSavePolicy}
                        disabled={isGenerating || !generatedPolicy}
                        className="flex items-center px-4 py-2 rounded-lg font-medium bg-[#B4A5FF]/20 text-[#E2DDFF] hover:bg-[#B4A5FF]/30 transition-all duration-200 disabled:opacity-50"
                      >
                        <FaCheck className="mr-2 w-4 h-4" />
                        Save Policy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 flex flex-col">
                  {/* Version History */}
                  <div className="flex-1 p-4 bg-[#2E1D4C]/30 rounded-lg overflow-y-auto">
                    <h4 className="text-[#E2DDFF] font-medium mb-4">Version History</h4>
                    <div className="space-y-3">
                      {versionHistory.map((version) => (
                        <button
                          key={version.id}
                          onClick={() => setGeneratedPolicy(version.content)}
                          className="w-full p-3 text-left rounded-lg bg-[#2E1D4C]/50 hover:bg-[#2E1D4C]/70 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[#E2DDFF] text-sm capitalize">{version.type}</span>
                            <span className="text-[#B4A5FF] text-xs">
                              {new Date(version.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Suggestions */}
                  {showSuggestions && (
                    <div className="mt-4 p-4 bg-[#2E1D4C]/30 rounded-lg">
                      <h4 className="text-[#E2DDFF] font-medium mb-4">AI Suggestions</h4>
                      <div className="space-y-3">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionApply(suggestion)}
                            className="w-full p-3 text-left rounded-lg bg-[#2E1D4C]/50 hover:bg-[#2E1D4C]/70 transition-colors"
                          >
                            <p className="text-[#E2DDFF] text-sm">{suggestion}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Package Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" aria-hidden="true" />

            <div className="inline-block w-full max-w-xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#13091F] rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
              {!clientSecret ? (
                <>
                  <div className="flex justify-between items-center mb-6 border-b border-[#2E1D4C]/30 pb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-[#E2DDFF]">Confirm Package Selection</h3>
                      <p className="mt-1 text-[#B4A5FF]">Review your selected package details</p>
                    </div>
                    <button
                      onClick={() => setShowConfirmationModal(false)}
                      className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-[#E2DDFF] mb-2">{selectedPackageDetails.name}</h4>
                      <p className="text-2xl font-bold text-[#E2DDFF]">${selectedPackageDetails.price}</p>
                    </div>

                    <div>
                      <h5 className="text-[#B4A5FF] mb-2">Included Features:</h5>
                      <ul className="space-y-2">
                        {selectedPackageDetails.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-[#E2DDFF]">
                            <FaCheck className="w-5 h-5 text-[#B4A5FF] mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowConfirmationModal(false)}
                      className="px-4 py-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmPackage}
                      className="px-6 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm
                    clientSecret={clientSecret}
                    packageDetails={selectedPackageDetails}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => {
                      setShowConfirmationModal(false);
                      setClientSecret(null);
                    }}
                  />
                </Elements>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Website URL Modal */}
      <AnimatePresence>
        {showWebsiteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-xl p-6 max-w-md w-full relative border border-[#B4A5FF]/30"
            >
              <button
                onClick={() => setShowWebsiteModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#B4A5FF]/20 mb-4">
                  <Globe className="h-6 w-6 text-[#B4A5FF]" />
                </div>
                <h3 className="text-xl font-bold text-white">Enter Website URL</h3>
                <p className="text-gray-400 mt-2">We'll analyze your website to suggest appropriate policies</p>
              </div>

              {formStatus === 'loading' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Loader2 className="h-12 w-12 text-[#B4A5FF] mx-auto mb-4 animate-spin" />
                  <h4 className="text-white font-medium">Analyzing Website</h4>
                  <p className="text-gray-300">This may take a few moments...</p>
                </motion.div>
              ) : (
                <form onSubmit={handleConfirmWebsiteUrl} className="space-y-4">
                  <div>
                    <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-300 mb-2">
                      Website URL
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="websiteUrl"
                        ref={websiteInputRef}
                        value={organizationDetails.website}
                        onChange={(e) => setOrganizationDetails(prev => ({ ...prev, website: e.target.value }))}
                        className="bg-gray-800 border border-gray-700 text-white py-2 px-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#B4A5FF] focus:border-transparent"
                        placeholder="https://example.com"
                      />
                      {urlValidationError && (
                        <p className="text-red-400 text-sm mt-1">{urlValidationError}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowWebsiteModal(false)}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#B4A5FF] hover:bg-[#997AB0] text-white rounded-lg transition-colors"
                    >
                      Analyze Website
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
              aria-hidden="true"
              onClick={() => setShowSubscriptionModal(false)}
            />

            <div className="inline-block w-full max-w-2xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#13091F] rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
              <div className="flex justify-between items-center mb-6 border-b border-[#2E1D4C]/30 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#E2DDFF]">Subscription Management</h3>
                  <p className="mt-1 text-[#B4A5FF]">
                    View and manage your subscription details
                  </p>
                </div>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {isLoadingSubscription ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B4A5FF]"></div>
                  </div>
                ) : !subscription ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-[#2E1D4C]/50">
                      <CreditCard className="w-8 h-8 text-[#B4A5FF]" />
                    </div>
                    <h4 className="text-xl font-semibold text-[#E2DDFF] mb-2">No Active Subscription</h4>
                    <p className="text-[#B4A5FF] mb-6">
                      Choose a subscription plan to unlock all features
                    </p>
                    <button
                      onClick={handleChangeSubscription}
                      className="px-6 py-3 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg font-medium hover:bg-[#B4A5FF]/30 transition-colors inline-flex items-center"
                    >
                      View Plans
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Subscription Status */}
                    <div className="bg-[#2E1D4C]/30 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className={`rounded-full p-2 mr-4 ${
                          subscription.status === 'active' ? 'bg-green-500/20' :
                          subscription.status === 'trialing' ? 'bg-blue-500/20' :
                          subscription.status === 'past_due' ? 'bg-yellow-500/20' :
                          'bg-red-500/20'
                        }`}>
                          {subscription.status === 'active' ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          ) : subscription.status === 'trialing' ? (
                            <Clock className="w-6 h-6 text-blue-500" />
                          ) : subscription.status === 'past_due' ? (
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-[#E2DDFF] font-semibold text-lg flex items-center">
                            {subscription.packages?.name}
                            <span className={`ml-2 text-xs px-2 py-1 rounded-full uppercase ${
                              subscription.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              subscription.status === 'trialing' ? 'bg-blue-500/20 text-blue-400' :
                              subscription.status === 'past_due' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {subscription.status}
                            </span>
                          </h4>
                          <p className="text-[#B4A5FF] mt-1">
                            {subscription.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'} plan
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Billing Period */}
                    <div className="bg-[#2E1D4C]/30 rounded-lg p-4">
                      <h4 className="text-[#E2DDFF] font-semibold mb-3 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Billing Period
                      </h4>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[#B4A5FF]">Current period started</p>
                          <p className="text-[#E2DDFF]">{formatDate(subscription.current_period_start)}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#B4A5FF] mx-4" />
                        <div>
                          <p className="text-[#B4A5FF]">Current period ends</p>
                          <p className="text-[#E2DDFF]">{formatDate(subscription.current_period_end)}</p>
                        </div>
                      </div>

                      {subscription.cancel_at_period_end && (
                        <div className="mt-4 p-3 bg-red-500/10 rounded-lg flex items-start">
                          <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                          <div>
                            <p className="text-red-400 font-medium">Subscription will end after current period</p>
                            <p className="text-[#B4A5FF] text-sm mt-1">
                              Your subscription is scheduled to end on {formatDate(subscription.current_period_end)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4">
                      <button
                        onClick={handleChangeSubscription}
                        className="px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors"
                      >
                        Change Plan
                      </button>
                      
                      {subscription.cancel_at_period_end ? (
                        <button
                          onClick={handleReactivateSubscription}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={handleCancelSubscription}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Cancel Subscription
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Management Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
              aria-hidden="true"
              onClick={() => setShowTeamModal(false)}
            />

            <div className="inline-block w-full max-w-2xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#13091F] rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
              <div className="flex justify-between items-center mb-6 border-b border-[#2E1D4C]/30 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#E2DDFF]">Team Management</h3>
                  <p className="mt-1 text-[#B4A5FF]">
                    Invite and manage team members
                  </p>
                </div>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Invite Form */}
                <form onSubmit={handleInviteTeamMember} className="mb-6">
                  <h4 className="text-[#E2DDFF] font-semibold mb-3">Invite Team Member</h4>
                  <div className="flex gap-3">
                    <div className="flex-grow">
                      <input
                        type="email"
                        value={newTeamMember.email}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, email: e.target.value })}
                        placeholder="Email address"
                        className="w-full px-4 py-2 bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 rounded-lg text-[#E2DDFF] focus:border-[#B4A5FF]/50 focus:outline-none"
                        required
                      />
                    </div>
                    <select
                      value={newTeamMember.role}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                      className="bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 rounded-lg text-[#E2DDFF] px-3"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="submit"
                      disabled={inviteStatus === 'loading'}
                      className="px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors flex items-center disabled:opacity-50"
                    >
                      {inviteStatus === 'loading' ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : (
                        'Invite'
                      )}
                    </button>
                  </div>
                </form>

                {/* Team Members List */}
                <div>
                  <h4 className="text-[#E2DDFF] font-semibold mb-3">Team Members</h4>
                  
                  {isLoadingTeam ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="animate-spin w-6 h-6 text-[#B4A5FF]" />
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="text-center py-6 bg-[#2E1D4C]/30 rounded-lg">
                      <p className="text-[#B4A5FF]">No team members yet</p>
                      <p className="text-[#B4A5FF]/70 text-sm mt-1">Invite teammates to collaborate</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex justify-between items-center p-3 bg-[#2E1D4C]/30 rounded-lg">
                          <div>
                            <div className="text-[#E2DDFF] font-medium">
                              {member.users?.email || member.invited_email}
                              {member.status === 'invited' && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                                  Pending
                                </span>
                              )}
                            </div>
                            <div className="text-[#B4A5FF] text-sm capitalize">{member.role}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateTeamMemberRole(member.id, e.target.value)}
                              className="bg-[#2E1D4C]/50 border border-[#2E1D4C] rounded-lg text-[#B4A5FF] text-sm px-2 py-1"
                            >
                              <option value="viewer">Viewer</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleRemoveTeamMember(member.id)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;

