import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Edit3,
  Settings,
  Globe,
  Loader,
  X,
  History,
  Download,
  Eye,
  Save,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Building2,
  Mail,
  MapPin,
  Calendar,
  Code2,
  Sparkles,
  Wand2,
  Layout,
  Palette,
  FileCheck,
  Share2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { POLICY_TYPES, getPolicyTypeById } from '../../lib/policySettings';
import { getUserSubscription, addUserPolicyCurrent } from '../../lib/userService';
import { generatePolicy } from '../../lib/openai';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { marked } from 'marked';
import { supabase } from '../../lib/supabase';
import { jsPDF } from 'jspdf';

// Add ProgressBar component
const ProgressBar = ({ progress, className }) => {
  return (
    <div className={cn("w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden", className)}>
      <div
        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Typewriter component for animated text display
const Typewriter = ({ messages, speed = 70, className = "" }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const currentMessage = messages[messageIndex];

  useEffect(() => {
    const pauseDuration = 1000; // Pause for 1 second when fully typed
    const deletingSpeed = speed / 2; // Delete faster than typing

    const timer = setTimeout(() => {
      // If paused, wait before starting to delete
      if (isPaused) {
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      // Handle typing or deleting
      if (!isDeleting) {
        // Typing
        if (charIndex < currentMessage.length) {
          setDisplayedText(currentMessage.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // Reached end of message, pause
          setIsPaused(true);
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          setDisplayedText(currentMessage.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          // Finished deleting, move to next message
          setIsDeleting(false);
          setMessageIndex((messageIndex + 1) % messages.length);
        }
      }
    }, isPaused ? pauseDuration : isDeleting ? deletingSpeed : speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, isPaused, messageIndex, currentMessage, messages, speed]);

  return <span className={className}>{displayedText}</span>;
};

// Simplify to 3 main steps for a clearer flow
const WIZARD_STEPS = [
  { id: 'select', title: 'Select Policy', description: 'Choose the type of policy you need' },
  { id: 'customize', title: 'Customize', description: 'Provide details and generate content' },
  { id: 'review', title: 'Review & Publish', description: 'Review, edit and publish your policy' }
];

const TemplateModal = ({ isOpen, onClose, policyType, onSelectTemplate, onProceedToReview, selectedPolicyType }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    email: '',
    country: '',
    industry: '',
    aiMaturityLevel: 'Intermediate',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Helper function for input field placeholders
  const getPlaceholderForField = (key) => {
    const placeholders = {
      companyName: 'ABC Corporation',
      website: 'www.example.com',
      email: 'contact@example.com',
      country: 'United States',
      industry: 'Technology, Healthcare, Finance, etc.',
      effectiveDate: ''
    };

    return placeholders[key] || '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleCustomize = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }

    if (!selectedPolicyType) {
      toast.error('Please select a policy type first');
      return;
    }

    // Validate required fields
    const requiredFields = ['companyName', 'website', 'email', 'country'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      // First call onSelectTemplate to update the form data
      await onSelectTemplate(selectedTemplate, formData);

      // Wait for state to be updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Then proceed to review with the selected template and form data
      onProceedToReview(selectedTemplate, formData);
      onClose();
    } catch (error) {
      console.error('Error in handleCustomize:', error);
      toast.error('Failed to customize template. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-navy-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navy-800/80 backdrop-blur-lg rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-navy-700/50">
        <div className="flex justify-between items-center p-6 border-b border-navy-700/50 bg-navy-800/90">
          <h3 className="text-xl font-bold text-white">
            Select Template for {getPolicyTypeById(policyType)?.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Organization Details Form */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-white mb-4">
              Organization Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label
                    htmlFor={key}
                    className="block text-sm font-medium text-gray-300"
                  >
                    {key === 'aiMaturityLevel' ? 'AI Maturity Level' :
                      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    {['companyName', 'website', 'email', 'country'].includes(key) &&
                      <span className="text-red-400 ml-1">*</span>}
                  </label>

                  {key === 'aiMaturityLevel' ? (
                    <select
                      id={key}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full px-4 py-2 rounded-lg",
                        "bg-navy-700/50",
                        "border border-navy-600/50",
                        "focus:ring-2 focus:ring-indigo-500",
                        "focus:border-indigo-500",
                        "text-white",
                        "placeholder-gray-400"
                      )}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  ) : (
                    <input
                      type={key === 'effectiveDate' ? 'date' : 'text'}
                      id={key}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      placeholder={getPlaceholderForField(key)}
                      className={cn(
                        "w-full px-4 py-2 rounded-lg",
                        "bg-navy-700/50",
                        "border border-navy-600/50",
                        "focus:ring-2 focus:ring-indigo-500",
                        "focus:border-indigo-500",
                        "text-white",
                        "placeholder-gray-400"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">
              Select Template Style
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(getPolicyTypeById(policyType)?.templates || ['Standard', 'Professional', 'Enterprise']).map((template) => (
                <button
                  key={template}
                  onClick={() => handleTemplateSelect(template)}
                  className={cn(
                    "flex flex-col p-4 rounded-lg text-left transition-all duration-200",
                    "bg-navy-700/50 hover:bg-navy-700",
                    "border-2",
                    selectedTemplate === template
                      ? "border-indigo-500 ring-2 ring-indigo-500/20"
                      : "border-navy-600/50",
                    "hover:border-indigo-500"
                  )}
                >
                  <h3 className="text-base font-medium text-white mb-1">
                    {template}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {template === 'Standard' && 'Basic policy suitable for small organizations'}
                    {template === 'Professional' && 'Detailed policy for established businesses'}
                    {template === 'Enterprise' && 'Comprehensive policy for large organizations'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Customize Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleCustomize}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg",
                "bg-gradient-to-r from-indigo-500 to-purple-500",
                "text-white font-medium",
                "hover:from-indigo-600 hover:to-purple-600",
                "transition-all duration-200 shadow-md hover:shadow-lg",
                !selectedTemplate && "opacity-50 cursor-not-allowed"
              )}
              disabled={!selectedTemplate}
            >
              <span>Customize Template</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PolicyWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState("");
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTypewriterMode, setIsTypewriterMode] = useState(false);
  const [typewriterSpeed, setTypewriterSpeed] = useState(30); // ms per character
  const [generationError, setGenerationError] = useState(null);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedPolicyType, setSelectedPolicyType] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    template: '',
    details: {
      companyName: '',
      website: '',
      email: '',
      country: '',
      industry: '',
      aiMaturityLevel: 'Intermediate',
      effectiveDate: new Date().toISOString().split('T')[0]
    },
    customizations: []
  });

  // Glassmorphism styles
  const glassStyles = {
    background: "bg-gray-900/80 backdrop-blur-lg",
    border: "border border-gray-800/50",
    shadow: "shadow-lg shadow-black/20"
  };

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const slideIn = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 }
  };

  // Export options
  const exportOptions = [
    { id: 'pdf', label: 'Export as PDF', icon: FileText },
    { id: 'docx', label: 'Export as DOCX', icon: FileText },
    { id: 'txt', label: 'Export as TXT', icon: FileText }
  ];

  // Template preview data
  const templatePreviews = {
    Standard: {
      title: 'Standard Template',
      description: 'A clean, professional template suitable for most organizations',
      features: ['Basic formatting', 'Standard sections', 'Professional layout']
    },
    Professional: {
      title: 'Professional Template',
      description: 'Enhanced template with advanced formatting and sections',
      features: ['Advanced formatting', 'Custom sections', 'Premium layout']
    },
    Enterprise: {
      title: 'Enterprise Template',
      description: 'Comprehensive template for large organizations',
      features: ['Full customization', 'All sections', 'Enterprise layout']
    }
  };

  // Helper function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return formatDate(date);
  };

  // Helper function to handle export
  const handleExport = async (format) => {
    try {
      // Create a temporary element to hold the content
      const element = document.createElement('div');
      element.innerHTML = marked(generatedContent);
      const textContent = element.innerText;

      switch (format) {
        case 'pdf':
          // Implement PDF export using jsPDF
          const doc = new jsPDF();

          // Add title
          const selectedType = getPolicyTypeById(formData.type);
          const title = `${formData.details.companyName} - ${selectedType.title}`;
          doc.setFontSize(18);
          doc.text(title, 20, 20);

          // Add content with word wrapping
          doc.setFontSize(12);
          const splitText = doc.splitTextToSize(textContent, 170);
          doc.text(splitText, 20, 30);

          // Save the PDF
          doc.save(`${selectedType.title.toLowerCase()}-policy.pdf`);
          toast.success('PDF exported successfully!');
          break;

        case 'docx':
          // TODO: Implement DOCX export using a library like docx
          toast.success('DOCX export coming soon!');
          break;

        case 'txt':
          // Simple text export
          const blob = new Blob([textContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${formData.type.toLowerCase()}-policy.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export document');
    }
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const userSubscription = getUserSubscription();
        setSubscription(userSubscription);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    fetchSubscription();
  }, []);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    try {
      if (currentStep < WIZARD_STEPS.length - 1) {
        // Validate current step
        if (currentStep === 1) {
          validateFormData();
        }

        // Generate content when moving to review step
        if (currentStep === 1) {
          generatePolicyContent();
        }

        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/dashboard/policies');
    }
  };

  const generatePolicyContent = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationProgress(0);

    // Track generation stages for a better UX
    const startGeneration = async () => {
      try {
        validateFormData();

        const selectedType = getPolicyTypeById(formData.type);
        if (!selectedType) {
          throw new Error('Invalid policy type selected. Please try again.');
        }

        // Get the packageType (renamed from package_type to match openai.js)
        const packageType = subscription?.package?.key || 'basic';

        // Prepare customizations object to pass to OpenAI
        const customizations = {
          companyName: formData.details.companyName,
          website: formData.details.website,
          email: formData.details.email,
          country: formData.details.country,
          industry: formData.details.industry,
          aiMaturityLevel: formData.details.aiMaturityLevel,
          effectiveDate: formData.details.effectiveDate,
          templateType: formData.template,
          policyType: selectedType.title
        };

        setGenerationProgress(15);
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log('Sending to OpenAI:', {
          templateName: selectedType.title,
          customizations,
          packageType
        });

        // Simulate analysis stage for better UX
        setGenerationProgress(30);
        await new Promise(resolve => setTimeout(resolve, 1000));

        setGenerationProgress(45);
        // Use OpenAI to generate the policy - pass exactly the parameters expected
        const content = await generatePolicy(
          selectedType.title,
          customizations,
          packageType,
          (progress) => {
            // Map the OpenAI progress (20, 40, 80, 100) to our UI progress (45-85)
            const mappedProgress = Math.floor(45 + (progress / 100) * 40);
            setGenerationProgress(mappedProgress);
          }
        );

        // Add a slight delay before showing the completed policy for better UX
        setGenerationProgress(85);
        await new Promise(resolve => setTimeout(resolve, 600));

        setGenerationProgress(100);
        await new Promise(resolve => setTimeout(resolve, 400));

        setGeneratedContent(content);
      } catch (error) {
        console.error('Error generating policy content:', error);
        setGenerationError(error.message || 'Failed to generate policy. Please try again.');
        toast.error(error.message || 'Policy generation failed. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    };

    // Start the generation process
    startGeneration();
  };

  const handleRetryGeneration = () => {
    setGenerationError(null);
    generatePolicyContent();
  };

  const handleEditToggle = () => {
    setIsEditingContent(!isEditingContent);
  };

  const handleSavePolicy = async () => {
    try {
      // Get the selected policy type
      const selectedType = getPolicyTypeById(formData.type);

      // Create policy object to save
      const policyData = {
        title: `${formData.details.companyName} - ${selectedType.title}`,
        type: selectedType.id,
        content: generatedContent,
        details: formData.details,
        template: formData.template
      };

      // Save the policy
      const result = await addUserPolicyCurrent(policyData);

      if (result.success) {
        toast.success('Policy published successfully! You can now download it from the Policies page.');

        // Navigate back to policies page after short delay
        setTimeout(() => {
          navigate('/dashboard/policies');
        }, 1500);
      } else {
        toast.error(`Failed to publish policy: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving policy:', error);
      toast.error('Failed to publish policy. Please try again.');
    }
  };

  const handlePolicyTypeSelect = (typeId) => {
    setSelectedPolicyType(typeId);
    setShowTemplateModal(true);
  };

  const handleTemplateSelect = async (template, details) => {
    console.log('Template selected:', { template, details, selectedPolicyType });
    if (!selectedPolicyType) {
      toast.error('Please select a policy type first');
      return;
    }

    // Update form data with all required fields
    setFormData(prev => ({
      ...prev,
      type: selectedPolicyType,
      template: template,
      details: details
    }));

    // Wait for state to be updated
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  const handleProceedToReview = async (template, details) => {
    try {
      // Update form data with the template and details
      setFormData(prev => ({
        ...prev,
        type: selectedPolicyType,
        template: template,
        details: details
      }));

      // Wait for state to be updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Now proceed to review and generate content
      setCurrentStep(2); // Skip to review step
      generatePolicyContent();
    } catch (error) {
      console.error('Error proceeding to review:', error);
      toast.error('Failed to proceed to review. Please try again.');
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const selectedType = getPolicyTypeById(formData.type);
      const packageType = subscription?.package?.key || 'basic';

      // Add current version to history before generating new one
      if (generatedContent) {
        setVersionHistory(prev => [{
          content: generatedContent,
          timestamp: new Date().toISOString(),
          version: prev.length + 1
        }, ...prev]);
      }

      // Generate new content
      const content = await generatePolicy(selectedType.title, {
        ...formData.details,
        policyType: selectedType.title,
        templateType: formData.template
      }, packageType);

      setGeneratedContent(content);
    } catch (error) {
      console.error('Error regenerating policy content:', error);
      setGenerationError(error.message || 'Failed to regenerate policy. Please try again.');
      toast.error('Policy regeneration failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestoreVersion = (version) => {
    setGeneratedContent(version.content);
    toast.success(`Restored version ${version.version}`);
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setGenerationError(null);

      if (!selectedTemplate) {
        toast.error('Please select a template first');
        return;
      }

      // Template-specific content
      const templateContent = {
        Standard: {
          introduction: `This policy outlines our organization's approach to ${formData.type.toLowerCase()} in the context of artificial intelligence and machine learning.`,
          sections: [
            {
              title: 'Scope',
              content: `This policy applies to all AI-related activities within ${formData.details.companyName}.`
            },
            {
              title: 'Policy Details',
              content: [
                {
                  title: 'Purpose',
                  items: [
                    `To establish guidelines for ${formData.type.toLowerCase()} in AI development`,
                    'To ensure compliance with relevant regulations',
                    'To protect stakeholders\' interests'
                  ]
                },
                {
                  title: 'Responsibilities',
                  items: [
                    'AI Development Team',
                    'Compliance Officers',
                    'Management'
                  ]
                },
                {
                  title: 'Implementation',
                  items: [
                    'Regular reviews',
                    'Training programs',
                    'Monitoring and reporting'
                  ]
                }
              ]
            }
          ]
        },
        Professional: {
          introduction: `As a leader in ${formData.details.industry}, ${formData.details.companyName} is committed to maintaining the highest standards of ${formData.type.toLowerCase()} in our AI initiatives.`,
          sections: [
            {
              title: 'Scope and Application',
              content: `This comprehensive policy governs all AI-related activities, including development, deployment, and maintenance, within ${formData.details.companyName} and its subsidiaries.`
            },
            {
              title: 'Policy Framework',
              content: [
                {
                  title: 'Strategic Objectives',
                  items: [
                    `Establish robust ${formData.type.toLowerCase()} guidelines for AI development`,
                    'Ensure regulatory compliance and risk management',
                    'Protect stakeholder interests and maintain trust',
                    'Foster innovation while maintaining ethical standards'
                  ]
                },
                {
                  title: 'Organizational Structure',
                  items: [
                    'AI Ethics Committee',
                    'Compliance and Risk Management Team',
                    'Technical Implementation Team',
                    'Stakeholder Advisory Board'
                  ]
                },
                {
                  title: 'Implementation Strategy',
                  items: [
                    'Quarterly policy reviews and updates',
                    'Comprehensive training programs',
                    'Regular compliance audits',
                    'Performance monitoring and reporting'
                  ]
                }
              ]
            }
          ]
        },
        Enterprise: {
          introduction: `${formData.details.companyName}, operating at the ${formData.details.aiMaturityLevel} level of AI maturity, has developed this comprehensive ${formData.type} policy to guide our global AI initiatives.`,
          sections: [
            {
              title: 'Global Scope and Jurisdiction',
              content: `This enterprise-wide policy applies to all AI-related activities across ${formData.details.companyName}'s global operations, ensuring consistent standards and practices.`
            },
            {
              title: 'Enterprise Policy Framework',
              content: [
                {
                  title: 'Strategic Vision',
                  items: [
                    `Establish world-class ${formData.type.toLowerCase()} standards for AI development`,
                    'Ensure global regulatory compliance',
                    'Protect stakeholder interests across jurisdictions',
                    'Drive innovation while maintaining ethical excellence'
                  ]
                },
                {
                  title: 'Governance Structure',
                  items: [
                    'Global AI Ethics Board',
                    'Regional Compliance Committees',
                    'Technical Implementation Teams',
                    'International Stakeholder Council'
                  ]
                },
                {
                  title: 'Implementation Framework',
                  items: [
                    'Bi-annual policy reviews',
                    'Global training programs',
                    'Regular compliance audits',
                    'Advanced monitoring systems',
                    'International reporting standards'
                  ]
                }
              ]
            }
          ]
        }
      };

      const template = templateContent[selectedTemplate];
      const content = `# ${formData.type} Policy for ${formData.details.companyName}

## Introduction
${template.introduction}

${template.sections.map(section => `
## ${section.title}
${typeof section.content === 'string' ? section.content : section.content.map(subsection => `
### ${subsection.title}
${subsection.items.map(item => `- ${item}`).join('\n')}
`).join('\n\n')}
`).join('\n\n')}

## Contact Information
For questions about this policy, please contact:
- Email: ${formData.details.email}
- Website: ${formData.details.website}
- Location: ${formData.details.country}

## Effective Date
This policy is effective as of ${formatDate(formData.details.effectiveDate)}.`;

      // Add to version history
      setVersionHistory(prev => [{
        content,
        timestamp: new Date().toISOString()
      }, ...prev]);

      setGeneratedContent(content);
      toast.success('Policy generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationError('Failed to generate policy. Please try again.');
      toast.error('Failed to generate policy');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const { data, error } = await supabase
        .from('policy_versions')
        .insert([
          {
            user_id: user.id,
            content: generatedContent,
            policy_type: formData.type,
            template: selectedTemplate,
            details: formData.details,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      // Update version history
      setVersionHistory(prev => [{
        content: generatedContent,
        timestamp: new Date().toISOString()
      }, ...prev]);

      toast.success('Policy saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save policy');
    } finally {
      setIsSaving(false);
    }
  };

  const loadVersionHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('policy_versions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVersionHistory(data.map(version => ({
        content: version.content,
        timestamp: version.created_at
      })));
    } catch (error) {
      console.error('Error loading version history:', error);
      toast.error('Failed to load version history');
    }
  };

  // Add useEffect to load version history when component mounts
  useEffect(() => {
    if (user) {
      loadVersionHistory();
    }
  }, [user]);

  // Add validation function
  const validateFormData = () => {
    if (!formData.type) {
      throw new Error('Please select a policy type');
    }

    if (!formData.template) {
      throw new Error('Please select a template');
    }

    const requiredFields = ['companyName', 'website', 'email', 'country', 'industry', 'aiMaturityLevel'];
    const missingFields = requiredFields.filter(field => !formData.details[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.details.email)) {
      throw new Error('Please enter a valid email address');
    }

    // Validate website format
    const websiteRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!websiteRegex.test(formData.details.website)) {
      throw new Error('Please enter a valid website URL');
    }
  };

  const getStepHints = (stepId) => {
    const hints = {
      select: ["Choose the type of policy you want to create. After selecting a policy type, you'll pick a template style."],
      customize: ["Provide your organization's details to customize your policy. Required fields are marked with an asterisk (*)."],
      review: ["Your policy has been generated. Review the content, make any necessary edits, and publish when you're ready."]
    };
    return hints[stepId] || [];
  };

  // Add typewriter effect function
  useEffect(() => {
    if (isTypewriterMode && generatedContent && !isGenerating) {
      setDisplayedContent("");
      let currentIndex = 0;
      
      const typeNextCharacter = () => {
        if (currentIndex < generatedContent.length) {
          setDisplayedContent(prev => prev + generatedContent[currentIndex]);
          currentIndex++;
          setTimeout(typeNextCharacter, typewriterSpeed);
        }
      };

      typeNextCharacter();
    } else {
      setDisplayedContent(generatedContent);
    }
  }, [generatedContent, isTypewriterMode, isGenerating, typewriterSpeed]);

  const renderStepContent = () => {
    switch (WIZARD_STEPS[currentStep].id) {
      case 'select':
        return (
          <div className="space-y-8">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mb-2">
                Select a Policy Type
              </h3>
              <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                Choose the type of policy you want to create. After selecting a policy type, you'll pick a template style.
              </p>
            </div>

            {/* Policy Type Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-100 mb-4">Policy Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {POLICY_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handlePolicyTypeSelect(type.id)}
                    className={cn(
                      "flex flex-col p-6 rounded-lg text-left transition-all duration-300",
                      "bg-gray-800/50 hover:bg-gray-800",
                      "border-2 shadow-sm hover:shadow-md",
                      formData.type === type.id
                        ? "border-indigo-500 ring-2 ring-indigo-500/20"
                        : "border-gray-700",
                      "hover:border-indigo-500"
                    )}
                  >
                    <div className="p-3 w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 flex items-center justify-center">
                      <type.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">
                      {type.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Selection Modal */}
            <TemplateModal
              isOpen={showTemplateModal}
              onClose={() => setShowTemplateModal(false)}
              policyType={selectedPolicyType}
              onSelectTemplate={handleTemplateSelect}
              onProceedToReview={handleProceedToReview}
              selectedPolicyType={selectedPolicyType}
            />
          </div>
        );

      case 'customize':
        return (
          <div className="space-y-8">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mb-2">
                Customize Your Policy
              </h3>
              <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                Provide your organization's details to customize your {getPolicyTypeById(formData.type)?.title}.
                Required fields are marked with an asterisk (*).
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Organization Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(formData.details).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label
                      htmlFor={key}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {key === 'aiMaturityLevel' ? 'AI Maturity Level' :
                        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      {['companyName', 'website', 'email', 'country'].includes(key) &&
                        <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {key === 'aiMaturityLevel' ? (
                      <select
                        id={key}
                        value={value}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            details: {
                              ...prev.details,
                              [key]: e.target.value
                            }
                          }));
                        }}
                        className={cn(
                          "w-full px-4 py-2 rounded-lg",
                          "bg-gray-800/50 dark:bg-gray-800",
                          "border border-gray-700 dark:border-gray-700",
                          "focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                          "focus:border-indigo-500 dark:focus:border-indigo-400",
                          "text-gray-100 dark:text-gray-100"
                        )}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    ) : (
                      <input
                        type={key === 'effectiveDate' ? 'date' : 'text'}
                        id={key}
                        name={key}
                        value={value}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            details: {
                              ...prev.details,
                              [key]: e.target.value
                            }
                          }));
                        }}
                        placeholder={getPlaceholderForField(key)}
                        className={cn(
                          "w-full px-4 py-2 rounded-lg",
                          "bg-gray-800/50 dark:bg-gray-800",
                          "border border-gray-700 dark:border-gray-700",
                          "focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                          "focus:border-indigo-500 dark:focus:border-indigo-400",
                          "text-gray-100 dark:text-gray-100",
                          "placeholder-gray-500 dark:placeholder-gray-400"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Fields marked with <span className="text-red-500">*</span> are required
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-100 mb-2">Template</label>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(templatePreviews).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      selectedTemplate === key
                        ? "border-indigo-500 bg-indigo-500/20"
                        : "border-gray-700 hover:border-gray-600",
                      "bg-gray-800/50 hover:bg-gray-800"
                    )}
                  >
                    <h3 className="font-semibold mb-2 text-gray-100">{template.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {template.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-indigo-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handleBack}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-lg",
                  "bg-white dark:bg-dark-card",
                  "border border-gray-300 dark:border-gray-600",
                  "text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-50 dark:hover:bg-gray-800",
                  "transition-colors duration-200"
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-lg",
                  "bg-gradient-to-r from-indigo-600 to-purple-600",
                  "text-white font-medium",
                  "hover:from-indigo-700 hover:to-purple-700",
                  "transition-all duration-200 shadow-md hover:shadow-lg"
                )}
              >
                <span>Generate Policy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-8">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mb-2">
                Review & Publish Your Policy
              </h3>
              <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                Your policy has been generated. Review the content, make any necessary edits, and publish when you're ready.
              </p>
            </div>

            {/* ChatGPT-like Interface */}
            <div className="flex gap-6">
              {/* Main Content Area - Now full width */}
              <div className="flex-1">
                <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border shadow-md">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-heading">
                        Policy Content
                      </h3>
                      <div className="flex items-center gap-2">
                        {/* Typewriter Mode Toggle */}
                        <div className="flex items-center gap-2 mr-4">
                          <button
                            onClick={() => setIsTypewriterMode(!isTypewriterMode)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
                              isTypewriterMode
                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
                              "hover:bg-opacity-90 transition"
                            )}
                          >
                            <Code2 className="w-4 h-4" />
                            <span>Typewriter Mode</span>
                          </button>
                          {isTypewriterMode && (
                            <select
                              value={typewriterSpeed}
                              onChange={(e) => setTypewriterSpeed(Number(e.target.value))}
                              className="text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-md py-1.5 px-2"
                            >
                              <option value={10}>Fast</option>
                              <option value={30}>Normal</option>
                              <option value={50}>Slow</option>
                            </select>
                          )}
                        </div>
                        <button
                          onClick={handleRegenerate}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg",
                            "bg-gray-100 dark:bg-gray-800",
                            "text-gray-700 dark:text-gray-300",
                            "hover:bg-gray-200 dark:hover:bg-gray-700",
                            "transition-colors duration-200"
                          )}
                          disabled={isGenerating}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Regenerate</span>
                        </button>
                        <button
                          onClick={handleEditToggle}
                          className={cn(
                            "p-2 rounded-md",
                            isEditingContent ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
                            "hover:bg-opacity-90 transition"
                          )}
                          title={isEditingContent ? "Save edits" : "Edit content"}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mb-4"></div>
                        <div className="text-center">
                          <p className="text-gray-700 dark:text-gray-300 h-16 flex items-center justify-center">
                            <Typewriter
                              messages={[
                                "Generating your policy...",
                                "Analyzing your organization details...",
                                "Crafting professional content...",
                                "Structuring policy sections...",
                                "Formatting for readability...",
                                "Applying industry standards...",
                                "Tailoring to your AI maturity level...",
                                "Almost there...",
                                "Finalizing policy document...",
                                "Please wait..."
                              ]}
                              speed={50}
                              className="font-medium"
                            />
                          </p>

                          <div className="mt-4 mb-2 w-64 mx-auto">
                            <ProgressBar progress={generationProgress} />
                            <p className="text-right text-xs text-gray-500 mt-1">{generationProgress}%</p>
                          </div>

                          <div className="mt-2 mb-2 flex justify-center space-x-1">
                            <span className="animate-pulse delay-75 h-2 w-2 rounded-full bg-indigo-500"></span>
                            <span className="animate-pulse delay-150 h-2 w-2 rounded-full bg-indigo-500"></span>
                            <span className="animate-pulse delay-300 h-2 w-2 rounded-full bg-indigo-500"></span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Using AI to create a customized {getPolicyTypeById(formData.type)?.title} for {formData.details.companyName}
                          </p>
                          <div className="mt-6 max-w-lg mx-auto bg-gray-100/10 rounded-lg p-3 text-xs text-gray-400">
                            <div className="flex items-start mb-2">
                              <div className="bg-indigo-500/20 p-1 rounded mr-2">
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                              </div>
                              <p>Applying {formData.template} template formatting...</p>
                            </div>
                            <div className="flex items-start">
                              <div className="bg-purple-500/20 p-1 rounded mr-2">
                                <Code2 className="w-3 h-3 text-purple-400" />
                              </div>
                              <p>Adapting content for {formData.details.industry} industry in {formData.details.country}...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : generationError ? (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                        <p className="text-red-600 dark:text-red-400 mb-4">{generationError}</p>
                        <button
                          onClick={handleRetryGeneration}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                        >
                          Retry Generation
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <textarea
                          rows={16}
                          className={cn(
                            "w-full px-4 py-3 rounded-lg",
                            "bg-white dark:bg-dark-card",
                            "border border-gray-300 dark:border-dark-border",
                            "focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                            "focus:border-indigo-500 dark:focus:border-indigo-400",
                            "text-gray-900 dark:text-dark-text",
                            "font-mono text-sm"
                          )}
                          value={isTypewriterMode ? displayedContent : generatedContent}
                          onChange={(e) => {
                            setGeneratedContent(e.target.value);
                            if (!isTypewriterMode) {
                              setDisplayedContent(e.target.value);
                            }
                          }}
                          readOnly={!isEditingContent || isTypewriterMode}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(0)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-lg",
                  "bg-white dark:bg-dark-card",
                  "border border-gray-300 dark:border-gray-600",
                  "text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-50 dark:hover:bg-gray-800",
                  "transition-colors duration-200"
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Selection</span>
              </button>

              <button
                onClick={handleSavePolicy}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-lg",
                  "bg-gradient-to-r from-indigo-600 to-purple-600",
                  "text-white font-medium",
                  "hover:from-indigo-700 hover:to-purple-700",
                  "transition-all duration-200 shadow-md hover:shadow-lg"
                )}
                disabled={isGenerating || !generatedContent}
              >
                <Check className="w-5 h-5" />
                <span>Publish Policy</span>
              </button>
            </div>
          </div>
        );

      case 'generate':
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Generate Policy</h2>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate Policy'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-[1920px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-6 rounded-xl ${glassStyles.background} ${glassStyles.border} ${glassStyles.shadow}`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Policy Wizard
              </h1>
              <p className="text-gray-400">Create and customize your AI policy document</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-gray-800/50 hover:bg-gray-800",
                  "transition-all duration-200",
                  "hover:shadow-lg hover:shadow-indigo-500/10"
                )}
              >
                <Eye className="w-5 h-5" />
                Preview
              </button>
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-gray-800/50 hover:bg-gray-800",
                  "transition-all duration-200",
                  "hover:shadow-lg hover:shadow-indigo-500/10"
                )}
              >
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Steps Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-4 rounded-xl ${glassStyles.background} ${glassStyles.border} ${glassStyles.shadow}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6 w-full">
              {WIZARD_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-lg transition-all duration-200 flex items-center",
                    currentStep === index
                      ? "bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/20"
                      : "hover:bg-gray-800/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                    currentStep === index
                      ? "bg-white/20"
                      : "bg-gray-800/50"
                  )}>
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-gray-400">
                      {currentStep === index ? (
                        <Typewriter
                          messages={getStepHints(step.id)}
                          speed={60}
                        />
                      ) : (
                        step.description
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-9"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeIn}
                className={`p-6 rounded-xl ${glassStyles.background} ${glassStyles.border} ${glassStyles.shadow}`}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Right Sidebar - History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-3"
          >
            <div className={`p-6 rounded-xl ${glassStyles.background} ${glassStyles.border} ${glassStyles.shadow}`}>
              <h2 className="text-xl font-semibold mb-4 text-gray-100">Version History</h2>
              <div className="space-y-4">
                {versionHistory.map((version, index) => (
                  <motion.div
                    key={index}
                    variants={slideIn}
                    className={cn(
                      "p-4 rounded-lg cursor-pointer",
                      "bg-gray-800/50 hover:bg-gray-800",
                      "transition-all duration-200",
                      "hover:shadow-lg hover:shadow-indigo-500/10"
                    )}
                    onClick={() => handleRestoreVersion(version)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-200">Version {versionHistory.length - index}</span>
                      <span className="text-xs text-gray-400">
                        {getTimeAgo(version.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{version.content.substring(0, 100)}...</p>
                  </motion.div>
                ))}
                {versionHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No previous versions</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-900/90 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "w-4/5 h-4/5 rounded-xl overflow-hidden flex flex-col",
                "bg-navy-800/80 backdrop-blur-lg",
                "border border-navy-700/50",
                "shadow-lg shadow-navy-900/50"
              )}
            >
              <div className="p-4 border-b border-navy-700/50 flex justify-between items-center bg-navy-800/90">
                <h3 className="text-xl font-semibold text-white">Policy Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg",
                      "bg-gradient-to-r from-indigo-500 to-purple-500",
                      "text-white",
                      "hover:from-indigo-600 hover:to-purple-600",
                      "transition-all duration-200",
                      "disabled:opacity-50"
                    )}
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 rounded-lg hover:bg-navy-700/50 transition-colors text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 bg-navy-900/50">
                <div className="prose prose-invert max-w-none">
                  {generatedContent ? (
                    <div className="bg-navy-800/50 rounded-lg p-6 border border-navy-700/50">
                      <div dangerouslySetInnerHTML={{ __html: marked(generatedContent) }} />
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="p-4 rounded-lg bg-navy-800/50 inline-block mb-4">
                        <Wand2 className="w-8 h-8 mx-auto text-indigo-400" />
                      </div>
                      <p className="text-lg mb-2">
                        <Typewriter
                          messages={[
                            "No content to preview yet.",
                            "Generate a policy to see it here.",
                            "Use the policy wizard to create content.",
                            "Ready when you are..."
                          ]}
                          speed={40}
                          className="font-medium"
                        />
                      </p>
                      <p className="text-sm opacity-70">Complete the wizard steps to generate your policy</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Options Modal */}
      <AnimatePresence>
        {showExportOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-900/90 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "p-6 rounded-xl w-96",
                "bg-navy-800/80 backdrop-blur-lg",
                "border border-navy-700/50",
                "shadow-lg shadow-navy-900/50"
              )}
            >
              <h3 className="text-xl font-semibold mb-4 text-white">Export Options</h3>
              <div className="space-y-2">
                {exportOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      handleExport(option.id);
                      setShowExportOptions(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                      "bg-navy-700/50 hover:bg-navy-700",
                      "text-gray-200 hover:text-white",
                      "transition-all duration-200",
                      "hover:shadow-lg hover:shadow-indigo-500/10"
                    )}
                  >
                    <option.icon className="w-5 h-5" />
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PolicyWizard;
