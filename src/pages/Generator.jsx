import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { generatePolicy } from '../lib/openai';
import { cn, themeClasses, gradientClasses } from '../lib/utils';

const Generator = () => {
  const [formData, setFormData] = useState({
    orgName: '',
    industry: '',
    size: '',
    geoNA: false,
    geoEU: false,
    geoGlobal: false,
    aiMaturity: '',
    aiStrategy: '',
    package: 'professional',
    ethicsFairness: true,
    ethicsTransparency: true,
    ethicsPrivacy: true,
    ethicsSafety: true,
    riskTechnical: true,
    riskEthical: true,
    riskLegal: true,
    riskReputation: true,
    additionalRequirements: ''
  });

  const [generatedPolicies, setGeneratedPolicies] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generatePolicies = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const policies = [];
      
      // Generate AI Ethics Policy if ethical principles are selected
      if (formData.ethicsFairness || formData.ethicsTransparency || 
          formData.ethicsPrivacy || formData.ethicsSafety) {
        const ethicsCustomizations = {
          orgName: formData.orgName,
          industry: formData.industry,
          principles: {
            fairness: formData.ethicsFairness,
            transparency: formData.ethicsTransparency,
            privacy: formData.ethicsPrivacy,
            safety: formData.ethicsSafety
          },
          geographicScope: {
            northAmerica: formData.geoNA,
            europe: formData.geoEU,
            global: formData.geoGlobal
          },
          aiMaturity: formData.aiMaturity,
          aiStrategy: formData.aiStrategy
        };

        const ethicsPolicy = await generatePolicy('AI Ethics Policy', ethicsCustomizations);
        policies.push({
          title: 'AI Ethics Policy',
          content: ethicsPolicy
        });
      }

      // Generate Risk Management Policy if risk categories are selected
      if (formData.riskTechnical || formData.riskEthical || 
          formData.riskLegal || formData.riskReputation) {
        const riskCustomizations = {
          orgName: formData.orgName,
          industry: formData.industry,
          riskCategories: {
            technical: formData.riskTechnical,
            ethical: formData.riskEthical,
            legal: formData.riskLegal,
            reputational: formData.riskReputation
          },
          geographicScope: {
            northAmerica: formData.geoNA,
            europe: formData.geoEU,
            global: formData.geoGlobal
          },
          aiMaturity: formData.aiMaturity
        };

        const riskPolicy = await generatePolicy('AI Risk Management Policy', riskCustomizations);
        policies.push({
          title: 'AI Risk Management Policy',
          content: riskPolicy
        });
      }

      setGeneratedPolicies(policies);
      setShowResults(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      orgName: '',
      industry: '',
      size: '',
      geoNA: false,
      geoEU: false,
      geoGlobal: false,
      aiMaturity: '',
      aiStrategy: '',
      package: 'professional',
      ethicsFairness: true,
      ethicsTransparency: true,
      ethicsPrivacy: true,
      ethicsSafety: true,
      riskTechnical: true,
      riskEthical: true,
      riskLegal: true,
      riskReputation: true,
      additionalRequirements: ''
    });
    setGeneratedPolicies([]);
    setShowResults(false);
  };

  return (
    <div className={cn("min-h-screen flex flex-col", themeClasses.bg)}>
      <Navigation />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {!showResults ? (
          <div className={cn(
            "shadow overflow-hidden sm:rounded-lg",
            themeClasses.card,
            themeClasses.border
          )}>
            <div className="px-4 py-5 sm:px-6">
              <h3 className={cn(
                "text-lg leading-6 font-medium",
                gradientClasses.text
              )}>AI Policy Generator</h3>
              <p className={cn(
                "mt-1 max-w-2xl text-sm",
                themeClasses.text
              )}>Fill out the questionnaire to generate your custom AI policies.</p>
            </div>
            <div className="border-t border-gray-200">
              <form onSubmit={generatePolicies} className="p-6">
                {/* Organization Profile Section */}
                <div className="mb-8">
                  <h2 className={cn(
                    "text-xl font-semibold mb-4",
                    gradientClasses.text
                  )}>Organization Profile</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="org-name" className={cn(
                        "block text-sm font-medium",
                        themeClasses.text
                      )}>Organization Name</label>
                      <input 
                        type="text" 
                        id="org-name" 
                        name="orgName" 
                        value={formData.orgName}
                        onChange={handleInputChange}
                        className={cn(
                          "mt-1 block w-full",
                          "border border-gray-300 rounded-md shadow-sm py-2 px-3",
                          "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",
                          "sm:text-sm"
                        )}
                        required 
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="industry" className={cn(
                        "block text-sm font-medium",
                        themeClasses.text
                      )}>Industry Sector</label>
                      <select 
                        id="industry" 
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className={cn(
                          "mt-1 block w-full",
                          "border border-gray-300 rounded-md shadow-sm py-2 px-3",
                          "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",
                          "sm:text-sm"
                        )}
                        required
                      >
                        <option value="">Select industry...</option>
                        <option value="healthcare">Healthcare/Life Sciences</option>
                        <option value="financial">Financial Services/Banking/Insurance</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="retail">Retail/E-commerce</option>
                        <option value="technology">Technology</option>
                        <option value="education">Education</option>
                        <option value="government">Government/Public Sector</option>
                        <option value="transportation">Transportation/Logistics</option>
                        <option value="energy">Energy/Utilities</option>
                        <option value="telecom">Telecommunications</option>
                        <option value="media">Media/Entertainment</option>
                        <option value="professional">Professional Services</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Policy Package Section */}
                <div className="mb-8">
                  <h2 className={cn(
                    "text-xl font-semibold mb-4",
                    gradientClasses.text
                  )}>Policy Package Selection</h2>
                  
                  <div className="space-y-6">
                    {/* Package Selection Radio Buttons */}
                    <div className={cn(
                      "border border-purple-100 rounded-lg p-5",
                      "bg-gradient-to-r from-purple-50 to-white relative"
                    )}>
                      <div className="absolute top-5 left-5">
                        <input 
                          id="package-professional" 
                          name="package" 
                          type="radio" 
                          value="professional"
                          checked={formData.package === 'professional'}
                          onChange={handleInputChange}
                          className={cn(
                            "package-radio focus:ring-purple-500 h-5 w-5 text-purple-600",
                            "border-gray-300"
                          )}
                        />
                      </div>
                      <div className="pl-10">
                        <label htmlFor="package-professional" className={cn(
                          "text-lg font-medium text-purple-800 cursor-pointer"
                        )}>
                          Professional Package 
                          <span className={cn(
                            "ml-2 text-sm font-semibold",
                            "bg-purple-100 text-purple-700 py-1 px-2 rounded-full"
                          )}>$1,500</span>
                        </label>
                        <p className={cn(
                          "mt-2 text-sm",
                          themeClasses.text
                        )}>For organizations scaling their AI operations with structured processes.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ethics & Risk Section */}
                <div className="mb-8">
                  <h2 className={cn(
                    "text-xl font-semibold mb-4",
                    gradientClasses.text
                  )}>Ethics & Risk Management</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={cn(
                        "block text-sm font-medium",
                        themeClasses.text
                      )}>Ethical AI Principles</label>
                      <div className="space-y-2">
                        {['Fairness', 'Transparency', 'Privacy', 'Safety'].map((principle) => (
                          <div key={principle} className="flex items-start">
                            <div className="flex items-center h-5">
                              <input 
                                id={`ethics-${principle.toLowerCase()}`} 
                                name={`ethics${principle}`} 
                                type="checkbox" 
                                checked={formData[`ethics${principle}`]}
                                onChange={handleInputChange}
                                className={cn(
                                  "focus:ring-indigo-500 h-4 w-4 text-indigo-600",
                                  "border-gray-300 rounded"
                                )}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor={`ethics-${principle.toLowerCase()}`} className={cn(
                                "font-medium",
                                themeClasses.text
                              )}>
                                {principle}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Requirements */}
                <div className="mb-8">
                  <h2 className={cn(
                    "text-xl font-semibold mb-4",
                    gradientClasses.text
                  )}>Additional Requirements</h2>
                  
                  <div>
                    <label htmlFor="additional-requirements" className={cn(
                      "block text-sm font-medium",
                      themeClasses.text
                    )}>
                      Any specific requirements or considerations not covered in the questionnaire?
                    </label>
                    <textarea 
                      id="additional-requirements" 
                      name="additionalRequirements"
                      value={formData.additionalRequirements}
                      onChange={handleInputChange}
                      rows="3" 
                      className={cn(
                        "mt-1 block w-full",
                        "border border-gray-300 rounded-md shadow-sm py-2 px-3",
                        "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",
                        "sm:text-sm"
                      )}
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-center mt-8">
                  <button 
                    type="submit" 
                    className={cn(
                      "inline-flex items-center px-6 py-3",
                      "border border-transparent",
                      "text-base font-medium rounded-md shadow-sm",
                      "text-white gradient-bg hover:opacity-90",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    )}
                  >
                    Generate Policies
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {error && (
              <div className={cn(
                "p-4 rounded-lg",
                "bg-red-50 dark:bg-red-900/20",
                "text-red-600 dark:text-red-400"
              )}>
                {error}
              </div>
            )}
            
            {loading ? (
              <div className={cn(
                "text-center py-12",
                themeClasses.text
              )}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p>Generating your custom AI policies...</p>
              </div>
            ) : (
              <>
                {generatedPolicies.map((policy, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-6 rounded-lg",
                      themeClasses.card,
                      themeClasses.border
                    )}
                  >
                    <h2 className={cn(
                      "text-2xl font-bold mb-4",
                      gradientClasses.text
                    )}>{policy.title}</h2>
                    <div className={cn(
                      "prose max-w-none",
                      "dark:prose-invert"
                    )}>
                      <pre className="whitespace-pre-wrap text-sm">
                        {policy.content}
                      </pre>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={resetForm}
                    className={cn(
                      "px-4 py-2 rounded-lg",
                      "text-gray-700 dark:text-gray-300",
                      "bg-gray-100 dark:bg-gray-800",
                      "hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    Generate New Policies
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Generator;
