import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Check,
    ChevronRight,
    Shield,
    FileText,
    Star,
    AlertCircle,
    Sparkles
} from 'lucide-react';

const packages = {
    basic: {
        name: "Basic Package",
        price: 900,
        policies: [
            "AI Ethics Policy",
            "AI Risk Management Policy",
            "AI Data Governance Policy"
        ],
        models: ["OpenAI", "Deepseek"],
        description: "Essential AI policies for organizations starting their AI governance journey",
        color: "from-blue-500 to-blue-700"
    },
    professional: {
        name: "Professional Package",
        price: 1500,
        policies: [
            "All Basic Policies",
            "AI Security Policy",
            "Model Management Policy",
            "Human Oversight Policy",
            "AI Compliance Policy",
            "Use Case Evaluation Policy"
        ],
        models: ["OpenAI"],
        description: "Comprehensive AI policy suite for growing organizations",
        color: "from-purple-500 to-purple-700"
    },
    premium: {
        name: "Premium Package",
        price: 3000,
        policies: [
            "All Professional Policies",
            "Procurement & Vendor Policy",
            "Responsible AI Deployment",
            "Training & Capability Policy",
            "Incident Response Policy",
            "+9 More Specialized Policies"
        ],
        models: ["OpenAI"],
        description: "Enterprise-grade AI governance solution with specialized policies",
        color: "from-[#B4A5FF] to-[#4B3B7C]"
    }
};

const PolicyTypeSelector = ({ onSelect, currentSubscription }) => {
    const [selectedPackage, setSelectedPackage] = useState(null);

    const handlePackageSelect = (packageType) => {
        setSelectedPackage(packageType);
        onSelect(packageType);
    };

    const PackageCard = ({ type, details }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`relative p-6 rounded-xl bg-gray-900/50 border border-[#B4A5FF]/20 ${selectedPackage === type ? 'ring-2 ring-[#B4A5FF]' : ''
                }`}
        >
            {selectedPackage === type && (
                <div className="absolute -top-3 -right-3">
                    <div className="bg-[#B4A5FF] rounded-full p-2">
                        <Check className="h-4 w-4 text-white" />
                    </div>
                </div>
            )}

            <div className="mb-4">
                <h3 className="text-xl font-semibold text-white mb-2">{details.name}</h3>
                <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-white">${details.price}</span>
                    <span className="text-gray-400 ml-2">one-time</span>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium text-white mb-2">Included Policies:</h4>
                    <ul className="space-y-2">
                        {details.policies.map((policy, index) => (
                            <li key={index} className="flex items-start">
                                <ChevronRight className="h-5 w-5 text-[#B4A5FF] flex-shrink-0 mt-0.5" />
                                <span className="text-gray-300 text-sm ml-2">{policy}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-white mb-2">Available Models:</h4>
                    <div className="flex flex-wrap gap-2">
                        {details.models.map((model, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 text-xs rounded-full bg-[#4B3B7C]/50 text-[#B4A5FF] border border-[#B4A5FF]/20"
                            >
                                {model}
                            </span>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => handlePackageSelect(type)}
                    className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${selectedPackage === type
                            ? 'bg-[#B4A5FF] hover:bg-[#997AB0]'
                            : 'bg-[#4B3B7C] hover:bg-[#6B5499]'
                        }`}
                >
                    {selectedPackage === type ? 'Selected' : 'Choose Package'}
                </button>
            </div>
        </motion.div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Choose Your Policy Package</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Select the package that best fits your organization's AI governance needs
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Object.entries(packages).map(([type, details]) => (
                    <PackageCard key={type} type={type} details={details} />
                ))}
            </div>

            <div className="mt-8 p-4 rounded-lg bg-[#4B3B7C]/20 border border-[#B4A5FF]/20">
                <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-[#B4A5FF] mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                        <h4 className="text-sm font-medium text-white">Important Note</h4>
                        <p className="text-sm text-gray-400 mt-1">
                            All packages include one-time policy generation. Updates and modifications may require additional purchases.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyTypeSelector; 