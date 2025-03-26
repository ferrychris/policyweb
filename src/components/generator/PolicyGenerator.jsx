import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn, themeClasses } from '../../lib/utils';
import { POLICY_TYPES, getPolicyTypesForPackage, isPolicyAllowedForPackage } from '../../lib/policySettings';
import { getUserPackage } from '../../lib/userService';
import { generatePolicy } from '../../lib/openai';

const PolicyGenerator = ({ policyType, onClose, organizationDetails, packageType = 'basic' }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [policy, setPolicy] = useState('');
  const [error, setError] = useState('');
  const [customizations, setCustomizations] = useState({
    organizationName: organizationDetails?.organizationName || '',
    industry: organizationDetails?.industry || '',
    companySize: organizationDetails?.size || '',
    region: organizationDetails?.region || '',
    focusAreas: '',
    aiMaturityLevel: '',
    specificRequirements: ''
  });
  const [userPackage, setUserPackage] = useState(null);
  const [allowedPolicyTypes, setAllowedPolicyTypes] = useState([]);

  useEffect(() => {
    const pkg = getUserPackage('user-1'); // In a real app, this would use the actual user ID
    setUserPackage(pkg);

    if (pkg) {
      const policyTypeIds = getPolicyTypesForPackage(pkg.key);
      setAllowedPolicyTypes(policyTypeIds);
    } else {
      setAllowedPolicyTypes([]);
    }
  }, []);

  const selectedPolicyType = POLICY_TYPES.find(p => p.id === policyType);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomizations(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError('');

      const policyTitle = selectedPolicyType?.title || 'Custom Policy';

      const generatedPolicy = await generatePolicy(
        policyTitle,
        customizations,
        packageType
      );

      setPolicy(generatedPolicy);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to generate policy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([policy], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPolicyType?.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn(
      "rounded-xl shadow-xl overflow-hidden",
      themeClasses.card
    )}>
      <div className={cn(
        "p-4 flex justify-between items-center border-b",
        themeClasses.border
      )}>
        <h2 className={cn(
          "text-xl font-bold",
          themeClasses.heading
        )}>
          {step === 1 ? 'Customize Your Policy' : 'Generated Policy'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6">
        {step === 1 ? (
          <>
            <div className="mb-6">
              <h3 className={cn(
                "text-lg font-semibold mb-2",
                themeClasses.heading
              )}>
                {selectedPolicyType?.title}
              </h3>
              <p className={cn(
                "text-sm",
                themeClasses.text
              )}>
                {selectedPolicyType?.description}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    htmlFor="organizationName" 
                    className={cn(
                      "block text-sm font-medium mb-1",
                      themeClasses.label
                    )}
                  >
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    value={customizations.organizationName}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full p-2 rounded-lg",
                      "border focus:ring-2 focus:ring-indigo-500",
                      themeClasses.border,
                      themeClasses.input
                    )}
                    placeholder="Your organization name"
                  />
                </div>
                <div>
                  <label 
                    htmlFor="industry" 
                    className={cn(
                      "block text-sm font-medium mb-1",
                      themeClasses.label
                    )}
                  >
                    Industry
                  </label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    value={customizations.industry}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full p-2 rounded-lg",
                      "border focus:ring-2 focus:ring-indigo-500",
                      themeClasses.border,
                      themeClasses.input
                    )}
                    placeholder="e.g. Healthcare, Finance, Education"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    htmlFor="companySize" 
                    className={cn(
                      "block text-sm font-medium mb-1",
                      themeClasses.label
                    )}
                  >
                    Company Size
                  </label>
                  <select
                    id="companySize"
                    name="companySize"
                    value={customizations.companySize}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full p-2 rounded-lg",
                      "border focus:ring-2 focus:ring-indigo-500",
                      themeClasses.border,
                      themeClasses.input
                    )}
                  >
                    <option value="">Select size</option>
                    <option value="Small (1-50)">Small (1-50)</option>
                    <option value="Medium (51-500)">Medium (51-500)</option>
                    <option value="Large (501-5000)">Large (501-5000)</option>
                    <option value="Enterprise (5000+)">Enterprise (5000+)</option>
                  </select>
                </div>
                <div>
                  <label 
                    htmlFor="region" 
                    className={cn(
                      "block text-sm font-medium mb-1",
                      themeClasses.label
                    )}
                  >
                    Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={customizations.region}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full p-2 rounded-lg",
                      "border focus:ring-2 focus:ring-indigo-500",
                      themeClasses.border,
                      themeClasses.input
                    )}
                  >
                    <option value="">Select region</option>
                    <option value="North America">North America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia Pacific">Asia Pacific</option>
                    <option value="Latin America">Latin America</option>
                    <option value="Middle East & Africa">Middle East & Africa</option>
                  </select>
                </div>
              </div>

              <div>
                <label 
                  htmlFor="focusAreas" 
                  className={cn(
                    "block text-sm font-medium mb-1",
                    themeClasses.label
                  )}
                >
                  Focus Areas
                </label>
                <input
                  type="text"
                  id="focusAreas"
                  name="focusAreas"
                  value={customizations.focusAreas}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full p-2 rounded-lg",
                    "border focus:ring-2 focus:ring-indigo-500",
                    themeClasses.border,
                    themeClasses.input
                  )}
                  placeholder="e.g. Transparency, Fairness, User Privacy"
                />
              </div>

              <div>
                <label 
                  htmlFor="aiMaturityLevel" 
                  className={cn(
                    "block text-sm font-medium mb-1",
                    themeClasses.label
                  )}
                >
                  AI Maturity Level
                </label>
                <select
                  id="aiMaturityLevel"
                  name="aiMaturityLevel"
                  value={customizations.aiMaturityLevel}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full p-2 rounded-lg",
                    "border focus:ring-2 focus:ring-indigo-500",
                    themeClasses.border,
                    themeClasses.input
                  )}
                >
                  <option value="">Select maturity level...</option>
                  <option value="AI Strategy">AI Strategy</option>
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label 
                  htmlFor="specificRequirements" 
                  className={cn(
                    "block text-sm font-medium mb-1",
                    themeClasses.label
                  )}
                >
                  Specific Requirements (optional)
                </label>
                <textarea
                  id="specificRequirements"
                  name="specificRequirements"
                  value={customizations.specificRequirements}
                  onChange={handleInputChange}
                  rows={4}
                  className={cn(
                    "w-full p-2 rounded-lg",
                    "border focus:ring-2 focus:ring-indigo-500",
                    themeClasses.border,
                    themeClasses.input
                  )}
                  placeholder="Any specific requirements for this policy"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={cn(
                  "px-4 py-2 rounded-lg",
                  "text-white font-medium",
                  "bg-indigo-600 hover:bg-indigo-700",
                  "dark:bg-indigo-700 dark:hover:bg-indigo-600",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {loading ? 'Generating...' : 'Generate Policy'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex justify-end">
              <button
                onClick={handleExport}
                className={cn(
                  "px-4 py-2 rounded-lg mr-2",
                  "text-white font-medium",
                  "bg-indigo-600 hover:bg-indigo-700",
                  "dark:bg-indigo-700 dark:hover:bg-indigo-600"
                )}
              >
                Export as Text
              </button>
              <button
                onClick={() => setStep(1)}
                className={cn(
                  "px-4 py-2 rounded-lg",
                  "text-indigo-600 font-medium",
                  "bg-indigo-100 hover:bg-indigo-200",
                  "dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                )}
              >
                Customize
              </button>
            </div>

            <div 
              className={cn(
                "p-6 rounded-lg border whitespace-pre-wrap",
                themeClasses.border,
                themeClasses.text
              )}
            >
              {policy}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PolicyGenerator;
