import React, { useState } from 'react';
import { 
  Check, 
  Loader2, 
  Download, 
  FileText, 
  FileInput, 
  Tag, 
  FileSpreadsheet,
  BookOpen,
  Mail,
  UserCircle,
  Clipboard
} from 'lucide-react';

const PolicyGenerator = ({ 
  policyType, 
  packageName, 
  onPolicyGenerated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [policyDocument, setPolicyDocument] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const handleGenerate = () => {
    if (!customerName || !customerEmail) return;
    
    setIsGenerating(true);
    setProgress(0);
    
    // Simulate policy generation with progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          generatePolicyDocument();
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const generatePolicyDocument = () => {
    // This would typically call an API to generate the document
    // For now, we'll simulate with a timeout and template
    setTimeout(() => {
      const document = `
# ${policyType} Insurance Policy

## Policy Details
- **Policy Type**: ${policyType}
- **Package**: ${packageName}
- **Customer**: ${customerName}
- **Email**: ${customerEmail}
- **Policy ID**: POL-${Math.floor(100000 + Math.random() * 900000)}
- **Effective Date**: ${new Date().toLocaleDateString()}
- **Expiry Date**: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}

## Coverage Details
${packageName === 'Basic Coverage' ? 
  '- Liability coverage\n- Uninsured motorist protection\n- 24/7 roadside assistance' : 
  packageName === 'Standard Coverage' ? 
  '- Liability coverage\n- Uninsured motorist protection\n- 24/7 roadside assistance\n- Collision coverage\n- Comprehensive coverage\n- Rental car reimbursement' :
  '- Liability coverage\n- Uninsured motorist protection\n- 24/7 roadside assistance\n- Collision coverage\n- Comprehensive coverage\n- Rental car reimbursement\n- Gap insurance\n- New car replacement\n- Vanishing deductible\n- Accident forgiveness'}

## Additional Notes
${additionalInfo || 'No additional notes provided.'}

## Terms and Conditions
This policy is subject to the terms and conditions set forth by the insurance provider. Please review the complete terms and conditions document for full details on coverage, exclusions, and limitations.
      `;
      
      setPolicyDocument(document);
      setIsGenerating(false);
      setIsComplete(true);
      onPolicyGenerated(document);
    }, 1500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([policyDocument], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${policyType.toLowerCase().replace(' ', '_')}_policy.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full border border-blue-500 bg-gray-900 rounded-lg shadow-lg">
      <div className="p-6">
        <h2 className="text-white text-2xl font-bold mb-6 flex items-center">
          <FileText className="mr-2 h-6 w-6 text-blue-500" />
          Generate Your {policyType} Policy
        </h2>
        
        {!isComplete ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="customer-name" className="text-gray-300 flex items-center">
                <UserCircle className="mr-2 h-4 w-4 text-gray-400" />
                Customer Name
              </label>
              <div className="relative">
                <FileInput className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="customer-email" className="text-gray-300 flex items-center">
                <Mail className="mr-2 h-4 w-4 text-gray-400" />
                Email Address
              </label>
              <div className="relative">
                <FileInput className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="additional-info" className="text-gray-300 flex items-center">
                <Clipboard className="mr-2 h-4 w-4 text-gray-400" />
                Additional Information
              </label>
              <textarea 
                id="additional-info"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Any specific requests or information to include in your policy"
                className="w-full min-h-[100px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Generating your policy...</span>
                  <span className="text-sm text-gray-400">{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{width: `${progress}%`}}
                  />
                </div>
              </div>
            )}
            
            <button 
              onClick={handleGenerate} 
              disabled={isGenerating || !customerName || !customerEmail}
              className={`
                w-full 
                py-3 
                rounded-md 
                flex 
                items-center 
                justify-center
                transition-colors 
                ${isGenerating || !customerName || !customerEmail 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'}
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Policy...
                </>
              ) : (
                "Generate Policy"
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500 rounded-md p-4 flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-400">Your policy has been successfully generated!</span>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-md max-h-[300px] overflow-y-auto">
              <pre className="text-gray-300 whitespace-pre-wrap text-sm">
                {policyDocument}
              </pre>
            </div>
            
            <button 
              onClick={handleDownload} 
              className="w-full py-3 bg-blue-600 text-white rounded-md flex items-center justify-center hover:bg-blue-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Policy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyGenerator;
