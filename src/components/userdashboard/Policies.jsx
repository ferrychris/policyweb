import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { getUserPoliciesCurrent, updateUserPolicy, deleteUserPolicy } from '../../lib/userService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEdit,
  FaDownload,
  FaSearch,
  FaTrash,
  FaTimes,
  FaPlus,
  FaEye,
  FaFileAlt,
  FaClock,
  FaShieldAlt,
  FaExclamationCircle,
  FaCog,
  FaUsers,
  FaCheckCircle,
  FaHandshake,
  FaRocket,
  FaGraduationCap,
  FaBell,
  FaBuilding,
  FaGlobe,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIndustry,
  FaChartLine,
  FaCalendarAlt,
  FaPalette,
  FaBook,
  FaGavel,
  FaClipboardCheck,
  FaSync,
  FaUpload,
  FaLink,
  FaRegCheckCircle
} from 'react-icons/fa';
import { cn, themeClasses, gradientClasses } from '../../lib/utils';

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

const Policies = () => {
  const navigate = useNavigate();
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

  const handleGeneratePolicy = () => {
    setShowPolicyTypeModal(true);
  };

  const handlePolicyTypeSelect = (typeId) => {
    const selectedType = policyTypes.find(type => type.id === typeId);
    if (selectedType) {
      setSelectedPolicyType(selectedType);
      setShowPolicyTypeModal(false);
      setShowDetailsModal(true);
    }
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (!organizationDetails.companyName || !organizationDetails.website ||
      !organizationDetails.email || !organizationDetails.country) {
      return;
    }
    setShowDetailsModal(false);
    setShowRegulationsModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrganizationDetails(prev => ({
      ...prev,
      [name]: value
    }));
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
    navigate('/dashboard/new-policy', {
      state: {
        policyType: selectedPolicyType.id,
        policyTitle: selectedPolicyType.title,
        organizationDetails,
        regulations: {
          selected: selectedRegulations,
          monitoring: monitoringPreferences,
          existingPolicies: uploadedPolicies
        }
      }
    });
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
        <button
          onClick={handleGeneratePolicy}
          className="flex items-center px-4 py-2 rounded-lg font-medium bg-[#B4A5FF]/20 text-[#E2DDFF] hover:bg-[#B4A5FF]/30 transition-all duration-200"
        >
          <FaPlus className="mr-2 w-4 h-4" />
          Generate Policy
        </button>
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
            You haven't created any policies yet.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleGeneratePolicy}
              className="inline-flex items-center px-4 py-2 rounded-lg font-medium bg-[#B4A5FF]/20 text-[#E2DDFF] hover:bg-[#B4A5FF]/30 transition-all duration-200"
            >
              <FaPlus className="mr-2 w-4 h-4" />
              Create Your First Policy
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
                      <FaEdit className="w-4 h-4" />
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
                      <FaEdit className="w-4 h-4" />
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

      {/* Policy Type Modal */}
      {showPolicyTypeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
              aria-hidden="true"
            />

            <div className="inline-block w-full max-w-6xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#13091F] rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
              <div className="flex justify-between items-center mb-6 border-b border-[#2E1D4C]/30 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#E2DDFF]">Select Policy Type</h3>
                  <p className="mt-1 text-[#B4A5FF]">Choose a policy type to get started</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPolicyTypeModal(false);
                  }}
                  className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {policyTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePolicyTypeSelect(type.id);
                    }}
                    className="flex flex-col p-6 rounded-lg bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 hover:border-[#B4A5FF]/50 transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-[#2E1D4C] group-hover:bg-[#B4A5FF]/20 transition-colors">
                        <type.icon className="w-6 h-6 text-[#B4A5FF] group-hover:text-[#E2DDFF]" />
                      </div>
                      <h4 className="text-lg font-semibold text-[#E2DDFF]">{type.title}</h4>
                    </div>
                    <p className="text-sm text-[#B4A5FF] group-hover:text-[#E2DDFF]">{type.description}</p>
                  </button>
                ))}
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
                    Select Template for {selectedPolicyType?.title}
                  </h3>
                  <p className="mt-1 text-[#B4A5FF]">
                    Please provide organization details and select template preferences
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDetailsModal(false);
                  }}
                  className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDetailsSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-[#E2DDFF] mb-4">1. Organization Details</h4>

                  <div className="space-y-4">
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

                    <div>
                      <label className="block text-sm font-medium text-[#B4A5FF] mb-2">
                        Website*
                      </label>
                      <div className="relative">
                        <FaGlobe className="absolute left-3 top-3 text-[#B4A5FF]" />
                        <input
                          type="url"
                          name="website"
                          value={organizationDetails.website}
                          onChange={handleInputChange}
                          placeholder="www.example.com"
                          className="w-full pl-10 pr-4 py-2 bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 rounded-lg text-[#E2DDFF] focus:border-[#B4A5FF]/50 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

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

                    <div>
                      <label className="block text-sm font-medium text-[#B4A5FF] mb-2">
                        Country*
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-3 text-[#B4A5FF]" />
                        <input
                          type="text"
                          name="country"
                          value={organizationDetails.country}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 rounded-lg text-[#E2DDFF] focus:border-[#B4A5FF]/50 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

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
                          className="w-full pl-10 pr-4 py-2 bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 rounded-lg text-[#E2DDFF] focus:border-[#B4A5FF]/50 focus:outline-none"
                        >
                          <option value="">Select Industry</option>
                          {industries.map(industry => (
                            <option key={industry} value={industry}>{industry}</option>
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
                          className="w-full pl-10 pr-4 py-2 bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 rounded-lg text-[#E2DDFF] focus:border-[#B4A5FF]/50 focus:outline-none"
                        >
                          <option value="">Select Maturity Level</option>
                          {aiMaturityLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
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
                      Customize Template
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
    </div>
  );
};

export default Policies;
