import React from 'react';
import StepCard from '../components/StepCard';
import PrinciplesList from '../components/PrinciplesList';
import ImplementationPhases from '../components/ImplementationPhases';

const Framework = () => {
  const adoptionSteps = [
    { number: 1, title: 'Evaluate', description: 'Assess organizational readiness, identify opportunities, and align AI initiatives with strategic goals.' },
    { number: 2, title: 'Govern', description: 'Establish governance structures, ethical guidelines, and compliance protocols.' },
    { number: 3, title: 'Innovate', description: 'Identify high-impact AI opportunities and create sustainable frameworks for experimentation.' },
    { number: 4, title: 'Secure', description: 'Protect AI systems through comprehensive security measures, risk management, and incident response.' },
    { number: 5, title: 'Operate', description: 'Implement AI solutions with reliable deployment, monitoring, and maintenance processes.' },
    { number: 6, title: 'Integrate', description: 'Embed AI capabilities into organizational culture, processes, and workflows.' }
  ];

  const principles = [
    { title: 'Process-Centric Orchestration', description: 'Organizing AI capabilities around business processes rather than isolated technologies.' },
    { title: 'Business as Code', description: 'Representing business rules and knowledge in structured, versionable formats.' },
    { title: 'Semantic Layer', description: 'Creating an organizational ontology that connects business concepts, data, and AI components.' },
    { title: 'Value-Driven Approach', description: 'Prioritizing AI initiatives based on measurable business value.' },
    { title: 'Risk-Based Governance', description: 'Applying governance controls proportionate to the level of risk.' }
  ];

  const implementationPhases = [
    { title: 'Assessment Phase', description: 'Evaluate current state and establish baselines' },
    { title: 'Foundation Phase', description: 'Implement core governance structures and policies' },
    { title: 'Development Phase', description: 'Build capabilities across the six framework layers' },
    { title: 'Maturity Phase', description: 'Refine and optimize AI governance and operations' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            AI Adoption & Management Framework (AI-AMF)
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            A comprehensive approach to AI governance and implementation.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="py-5 px-6">
            <div className="prose max-w-none">
              <p>
                The AI Adoption & Management Framework (AI-AMF) is a structured
                approach to implementing AI across an organization. It addresses
                the full lifecycle of AI initiatives, from strategic planning to
                ongoing operations.
              </p>

              <h4 className="text-xl font-semibold mt-6 mb-3 gradient-text">
                The Six Layers of AI Adoption
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {adoptionSteps.slice(0, 3).map((step) => (
                    <StepCard key={step.number} {...step} />
                  ))}
                </div>
                <div>
                  {adoptionSteps.slice(3).map((step) => (
                    <StepCard key={step.number} {...step} />
                  ))}
                </div>
              </div>

              <h4 className="text-xl font-semibold mt-6 mb-3 gradient-text">
                Framework Principles
              </h4>
              <PrinciplesList principles={principles} />

              <h4 className="text-xl font-semibold mt-6 mb-3 gradient-text">
                Implementation Methodology
              </h4>
              <p>The AI-AMF is designed to be implemented in phases:</p>
              <ImplementationPhases phases={implementationPhases} />

              <p className="mt-4">
                Our AI Policy Generator creates customized policies aligned
                with the AI-AMF, helping organizations implement the framework
                effectively.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Framework;