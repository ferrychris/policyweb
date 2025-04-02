import React, { useState, useEffect } from 'react';
import { cn, themeClasses, gradientClasses } from '../../lib/utils';

const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' }
];

const SIZE_OPTIONS = [
  { value: '1-50', label: '1-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' }
];

const REGION_OPTIONS = [
  { value: 'north-america', label: 'North America' },
  { value: 'europe', label: 'Europe (EU)' },
  { value: 'global', label: 'Global' }
];

const POLICY_TYPES = {
  ethics: {
    title: 'AI Ethics Policy',
    description: 'Define comprehensive guidelines for ethical AI development and deployment'
  },
  data: {
    title: 'Data Governance Policy',
    description: 'Establish standards for data handling, privacy, and security'
  },
  model: {
    title: 'Model Usage Policy',
    description: 'Set rules and best practices for AI model deployment and monitoring'
  }
};

const PolicyCreationForm = ({ initialPolicyType, onSubmit }) => {
  const [formData, setFormData] = useState({
    organizationName: '',
    industry: '',
    size: '',
    region: '',
    policyType: initialPolicyType || ''
  });

  useEffect(() => {
    if (initialPolicyType) {
      setFormData(prev => ({
        ...prev,
        policyType: initialPolicyType
      }));
    }
  }, [initialPolicyType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectedPolicy = formData.policyType ? POLICY_TYPES[formData.policyType] : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Policy Type Selection */}
      {selectedPolicy && (
        <div className={cn(
          "p-6 rounded-xl",
          gradientClasses.cardHover,
          "border",
          themeClasses.border
        )}>
          <h3 className={cn(
            "text-2xl font-extrabold mb-2",
            gradientClasses.text
          )}>
            {selectedPolicy.title}
          </h3>
          <p className={cn(
            "text-base",
            themeClasses.text
          )}>
            {selectedPolicy.description}
          </p>
        </div>
      )}

      {/* Organization Details */}
      <div className="space-y-6">
        <h4 className={cn(
          "text-xl font-extrabold",
          themeClasses.heading
        )}>
          Organization Details
        </h4>

        {/* Organization Name */}
        <div>
          <label 
            htmlFor="organizationName"
            className={cn(
              "block text-sm font-medium mb-2",
              themeClasses.text
            )}
          >
            Organization Name
          </label>
          <input
            type="text"
            id="organizationName"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleInputChange}
            className={cn(
              "w-full rounded-lg",
              "bg-navy-800/50 border border-navy-700",
              "text-white placeholder-slate-400",
              "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
              "p-2.5"
            )}
            placeholder="Enter organization name"
            required
          />
        </div>

        {/* Industry Sector */}
        <div>
          <label 
            htmlFor="industry"
            className={cn(
              "block text-sm font-medium mb-2",
              themeClasses.text
            )}
          >
            Industry Sector
          </label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            className={cn(
              "w-full rounded-lg",
              "bg-navy-800/50 border border-navy-700",
              "text-white placeholder-slate-400",
              "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
              "p-2.5"
            )}
            required
          >
            <option value="">Select industry...</option>
            {INDUSTRY_OPTIONS.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                className="bg-navy-800"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Organization Size */}
        <div>
          <label 
            htmlFor="size"
            className={cn(
              "block text-sm font-medium mb-2",
              themeClasses.text
            )}
          >
            Organization Size
          </label>
          <select
            id="size"
            name="size"
            value={formData.size}
            onChange={handleInputChange}
            className={cn(
              "w-full rounded-lg",
              "bg-navy-800/50 border border-navy-700",
              "text-white placeholder-slate-400",
              "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
              "p-2.5"
            )}
            required
          >
            <option value="">Select size...</option>
            {SIZE_OPTIONS.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                className="bg-navy-800"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Geographic Operations */}
        <div>
          <label 
            htmlFor="region"
            className={cn(
              "block text-sm font-medium mb-2",
              themeClasses.text
            )}
          >
            Geographic Operations
          </label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            className={cn(
              "w-full rounded-lg",
              "bg-navy-800/50 border border-navy-700",
              "text-white placeholder-slate-400",
              "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
              "p-2.5"
            )}
            required
          >
            <option value="">Select region...</option>
            {REGION_OPTIONS.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                className="bg-navy-800"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={cn(
          "w-full flex items-center justify-center",
          "px-4 py-3 rounded-lg",
          "text-white font-medium",
          gradientClasses.button,
          "hover:opacity-90 transition-opacity"
        )}
      >
        Continue to Policy Generation
      </button>
    </form>
  );
};

export default PolicyCreationForm;
