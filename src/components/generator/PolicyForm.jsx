import { useState } from "react";
import { generatePolicy } from "../../lib/openai";
import { POLICY_TYPES } from "../../lib/policySettings";
import { cn, themeClasses, gradientClasses } from "../../lib/utils";
import { FileText } from "lucide-react";

function PolicyForm({ onGenerate }) {
    const [policyType, setPolicyType] = useState("");
    const [details, setDetails] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [industry, setIndustry] = useState("");
    const [scope, setScope] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!policyType) return alert("Please select a policy type.");
        setLoading(true);
        
        try {
            const selectedPolicy = POLICY_TYPES.find(p => p.id === policyType);
            
            // Merge default customizations with user inputs
            const customizations = {
                ...selectedPolicy.customizations,
                companyName: companyName || selectedPolicy.customizations.companyName,
                industry: industry || selectedPolicy.customizations.industry,
                scope: scope || selectedPolicy.customizations.scope,
                additionalDetails: details
            };
            
            const policy = await generatePolicy(selectedPolicy.title, customizations);
            setLoading(false);
            onGenerate(selectedPolicy.title, policy);
        } catch (error) {
            setLoading(false);
            alert("Error generating policy: " + error.message);
        }
    };

    return (
        <div className={cn(
            "p-8 shadow-lg rounded-xl",
            themeClasses.card,
            themeClasses.border,
            "border"
        )}>
            <h2 className={cn(
                "text-3xl font-extrabold mb-6",
                "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            )}>
                Generate a Policy
            </h2>
            
            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-600 border-r-purple-600 border-b-cyan-500 border-l-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute top-2 left-2 right-2 bottom-2 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full flex items-center justify-center">
                            <FileText className="w-8 h-8 text-indigo-400" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className={cn(
                            "text-xl font-bold mb-2",
                            themeClasses.heading
                        )}>
                            Generating Your Policy
                        </h3>
                        <p className={cn(
                            "text-sm max-w-md",
                            themeClasses.text
                        )}>
                            Our AI is crafting a comprehensive policy tailored to your requirements. This typically takes 15-30 seconds.
                        </p>
                    </div>
                    <div className="w-64 h-2 bg-gray-200 dark:bg-navy-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <label className={cn(
                            "block text-sm font-medium mb-2",
                            themeClasses.heading
                        )}>
                            Policy Type
                        </label>
                        <select
                            value={policyType}
                            onChange={(e) => setPolicyType(e.target.value)}
                            className={cn(
                                "w-full px-4 py-2 rounded-lg",
                                "border border-gray-300 dark:border-dark-border",
                                "bg-white dark:bg-dark-card",
                                "text-gray-900 dark:text-dark-text",
                                "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                            )}
                        >
                            <option value="">Select Policy Type</option>
                            {POLICY_TYPES.map((type) => (
                                <option key={type.id} value={type.id}>{type.title}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={cn(
                                "block text-sm font-medium mb-2",
                                themeClasses.heading
                            )}>
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Your Company"
                                className={cn(
                                    "w-full px-4 py-2 rounded-lg",
                                    "border border-gray-300 dark:border-dark-border",
                                    "bg-white dark:bg-dark-card",
                                    "text-gray-900 dark:text-dark-text",
                                    "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                                )}
                            />
                        </div>
                        
                        <div>
                            <label className={cn(
                                "block text-sm font-medium mb-2",
                                themeClasses.heading
                            )}>
                                Industry
                            </label>
                            <input
                                type="text"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                placeholder="Technology"
                                className={cn(
                                    "w-full px-4 py-2 rounded-lg",
                                    "border border-gray-300 dark:border-dark-border",
                                    "bg-white dark:bg-dark-card",
                                    "text-gray-900 dark:text-dark-text",
                                    "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                                )}
                            />
                        </div>
                        
                        <div>
                            <label className={cn(
                                "block text-sm font-medium mb-2",
                                themeClasses.heading
                            )}>
                                Scope
                            </label>
                            <input
                                type="text"
                                value={scope}
                                onChange={(e) => setScope(e.target.value)}
                                placeholder="Enterprise-wide"
                                className={cn(
                                    "w-full px-4 py-2 rounded-lg",
                                    "border border-gray-300 dark:border-dark-border",
                                    "bg-white dark:bg-dark-card",
                                    "text-gray-900 dark:text-dark-text",
                                    "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                                )}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className={cn(
                            "block text-sm font-medium mb-2",
                            themeClasses.heading
                        )}>
                            Additional Requirements
                        </label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Add any specific requirements or context for your policy..."
                            className={cn(
                                "w-full px-4 py-2 rounded-lg",
                                "border border-gray-300 dark:border-dark-border",
                                "bg-white dark:bg-dark-card",
                                "text-gray-900 dark:text-dark-text",
                                "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                            )}
                            rows="4"
                        />
                    </div>
                    
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className={cn(
                            "w-full py-3 px-6 rounded-lg",
                            "text-white font-medium",
                            "transition-all duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                            loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90",
                            gradientClasses.button
                        )}
                    >
                        {loading ? "Generating Policy..." : "Generate Policy"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default PolicyForm;