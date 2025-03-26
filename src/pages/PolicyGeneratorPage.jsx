import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PolicyForm from '../components/generator/PolicyForm';
import { cn, themeClasses, layout, gradientClasses } from '../lib/utils';

function PolicyGeneratorPage() {
  const navigate = useNavigate();
  const [generatedPolicy, setGeneratedPolicy] = useState(null);
  const [policyTitle, setPolicyTitle] = useState('');

  const handleGenerate = (title, policy) => {
    setPolicyTitle(title);
    setGeneratedPolicy(policy);
  };

  const handleSave = () => {
    // Save the policy to the user's account (implementation would depend on backend)
    alert('Policy saved successfully');
    navigate('/dashboard');
  };

  const handleNewPolicy = () => {
    setGeneratedPolicy(null);
    setPolicyTitle('');
  };

  return (
    <div className={cn("py-12", layout.maxWidth, "mx-auto", layout.padding)}>
      <h1 className={cn(
        "text-4xl font-extrabold mb-8 text-center",
        "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
      )}>
        Policy Generator
      </h1>

      {!generatedPolicy ? (
        <PolicyForm onGenerate={handleGenerate} />
      ) : (
        <div className={cn("space-y-6")}>
          <div className={cn(
            "p-8 shadow-lg rounded-xl",
            themeClasses.card,
            themeClasses.border,
            "border"
          )}>
            <h2 className={cn(
              "text-2xl font-bold mb-6",
              themeClasses.heading
            )}>
              {policyTitle}
            </h2>
            
            <div className={cn(
              "p-6 rounded-lg whitespace-pre-line",
              "bg-white/5 border border-white/10",
              themeClasses.text
            )}>
              {generatedPolicy}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleNewPolicy}
              className={cn(
                "flex-1 py-3 px-6 rounded-lg",
                "border border-indigo-500 text-indigo-500",
                "hover:bg-indigo-500/10 transition-colors",
                "font-medium"
              )}
            >
              Generate Another Policy
            </button>
            
            <button
              onClick={handleSave}
              className={cn(
                "flex-1 py-3 px-6 rounded-lg",
                "text-white font-medium",
                "transition-all duration-200",
                "hover:opacity-90",
                gradientClasses.button
              )}
            >
              Save Policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PolicyGeneratorPage;
