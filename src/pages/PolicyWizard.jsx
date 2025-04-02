import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Download,
  Edit3,
  Settings,
  Globe
} from 'react-feather';
import { cn } from '../lib/utils';
import { Typewriter } from 'typewriter-effect';
import { generatePolicy } from '../lib/openai';

const POLICY_TYPES = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    description: 'Create a comprehensive privacy policy for your website or app',
    icon: Globe,
    templates: ['Basic', 'GDPR Compliant', 'CCPA Compliant']
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    description: 'Define the terms and conditions for using your service',
    icon: FileText,
    templates: ['Standard', 'Professional', 'E-commerce']
  },
  {
    id: 'cookie',
    title: 'Cookie Policy',
    description: 'Explain how your website uses cookies and tracking',
    icon: Settings,
    templates: ['Essential', 'Marketing', 'Analytics']
  }
];

const WIZARD_STEPS = [
  { id: 'type', title: 'Policy Type' },
  { id: 'template', title: 'Template' },
  { id: 'details', title: 'Details' },
  { id: 'customize', title: 'Customize' },
  { id: 'preview', title: 'Preview' }
];

const PolicyWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    type: '',
    template: '',
    details: {
      companyName: '',
      website: '',
      email: '',
      country: '',
      effectiveDate: new Date().toISOString().split('T')[0]
    },
    customizations: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent('');

    try {
      // Get the policy type and template
      const policyType = POLICY_TYPES.find(t => t.id === formData.type);
      const templateName = `${policyType.title} - ${formData.template}`;
      
      // Generate the policy using OpenAI
      const content = await generatePolicy(
        templateName,
        {
          ...formData.details,
          templateType: formData.template
        },
        'professional' // Use professional package for better results
      );

      // Set the content for the typewriter
      setGeneratedContent(content);

    } catch (error) {
      console.error('Error generating policy:', error);
      setGeneratedContent('Error generating policy. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      if (currentStep === 3) { // Customize step
        handleGenerate();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (WIZARD_STEPS[currentStep].id) {
      case 'type':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POLICY_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  updateFormData('type', type.id);
                  handleNext();
                }}
                className={cn(
                  "flex flex-col p-6 rounded-lg text-left",
                  "bg-white dark:bg-dark-card",
                  "border-2",
                  formData.type === type.id
                    ? "border-indigo-500 dark:border-indigo-400"
                    : "border-gray-200 dark:border-dark-border",
                  "hover:border-indigo-500 dark:hover:border-indigo-400",
                  "transition-colors duration-200"
                )}
              >
                <div className="p-3 w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 mb-4">
                  <type.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-heading mb-2">
                  {type.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {type.description}
                </p>
              </button>
            ))}
          </div>
        );

      case 'template':
        const selectedType = POLICY_TYPES.find(t => t.id === formData.type);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedType?.templates.map((template) => (
              <button
                key={template}
                onClick={() => {
                  updateFormData('template', template);
                  handleNext();
                }}
                className={cn(
                  "flex flex-col p-6 rounded-lg text-left",
                  "bg-white dark:bg-dark-card",
                  "border-2",
                  formData.template === template
                    ? "border-indigo-500 dark:border-indigo-400"
                    : "border-gray-200 dark:border-dark-border",
                  "hover:border-indigo-500 dark:hover:border-indigo-400",
                  "transition-colors duration-200"
                )}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-heading mb-2">
                  {template}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {template} template for your {selectedType.title.toLowerCase()}
                </p>
              </button>
            ))}
          </div>
        );

      case 'details':
        return (
          <div className="max-w-2xl space-y-6">
            {Object.entries(formData.details).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <label 
                  htmlFor={key}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type={key === 'effectiveDate' ? 'date' : 'text'}
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
                    "bg-white dark:bg-dark-card",
                    "border border-gray-300 dark:border-dark-border",
                    "focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                    "focus:border-indigo-500 dark:focus:border-indigo-400",
                    "text-gray-900 dark:text-dark-text"
                  )}
                />
              </div>
            ))}
          </div>
        );

      case 'customize':
        return (
          <div className="max-w-4xl space-y-6">
            <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-heading mb-4">
                Policy Content
              </h3>
              <div className="relative">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="typewriter">
                    <Typewriter
                      options={{
                        strings: [generatedContent],
                        autoStart: true,
                        loop: false,
                        delay: 50, // Adjust speed
                        cursor: '█',
                        wrapperClassName: 'typewriter-wrapper',
                        cursorClassName: 'typewriter-cursor'
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    isGenerating ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 text-white",
                    "hover:bg-indigo-700",
                    "transition-colors duration-200"
                  )}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating...' : 'Generate Content'}</span>
                </button>
                <button
                  onClick={() => {
                    if (generatedContent) {
                      const blob = new Blob([generatedContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${formData.details.companyName}_${POLICY_TYPES.find(t => t.id === formData.type)?.title}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }
                  }}
                  disabled={!generatedContent}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-gray-100 dark:bg-gray-800",
                    "text-gray-700 dark:text-gray-300",
                    "hover:bg-gray-200 dark:hover:bg-gray-700",
                    "transition-colors duration-200",
                    !generatedContent && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Download className="w-4 h-4" />
                  <span>Download Draft</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="max-w-4xl space-y-6">
            <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-6">
              <div className="prose dark:prose-invert max-w-none">
                <h1>{formData.details.companyName} {POLICY_TYPES.find(t => t.id === formData.type)?.title}</h1>
                <p>Effective Date: {formData.details.effectiveDate}</p>
                {/* Add generated policy content here */}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard/policies')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-lg",
                  "bg-indigo-600 text-white",
                  "hover:bg-indigo-700",
                  "transition-colors duration-200"
                )}
              >
                <Check className="w-4 h-4" />
                <span>Publish Policy</span>
              </button>
              <button
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-lg",
                  "bg-gray-100 dark:bg-gray-800",
                  "text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-200 dark:hover:bg-gray-700",
                  "transition-colors duration-200"
                )}
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <style jsx>{`
        .typewriter-cursor {
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }

        .typewriter-wrapper {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className={cn(
              "flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400",
              "hover:text-gray-900 dark:hover:text-white",
              "transition-colors duration-200"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-dark-heading">
            Create New Policy
          </h1>
        </div>

        {/* Steps Navigation */}
        <div className="mb-12">
          <div className="flex items-center gap-4">
            {WIZARD_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={cn(
                    "flex items-center gap-2",
                    index <= currentStep
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-400 dark:text-gray-500"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      index < currentStep
                        ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                        : index === currentStep
                        ? "border-2 border-indigo-600 dark:border-indigo-400"
                        : "border-2 border-gray-300 dark:border-gray-600"
                    )}
                  >
                    {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {step.title}
                  </span>
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5",
                      index < currentStep
                        ? "bg-indigo-600 dark:bg-indigo-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mb-12">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {currentStep > 0 && currentStep < WIZARD_STEPS.length - 1 && (
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-lg",
                "bg-white dark:bg-dark-card",
                "border border-gray-300 dark:border-dark-border",
                "text-gray-700 dark:text-gray-300",
                "hover:bg-gray-50 dark:hover:bg-gray-800",
                "transition-colors duration-200"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={handleNext}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-lg",
                "bg-indigo-600 text-white",
                "hover:bg-indigo-700",
                "transition-colors duration-200"
              )}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyWizard;
