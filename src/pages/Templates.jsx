import React from 'react';

const Templates = () => {
  const templates = [
    {
      id: 1,
      title: 'Data Privacy Policy',
      description: 'A comprehensive policy template for managing data privacy and compliance with regulations like GDPR and CCPA.',
    },
    {
      id: 2,
      title: 'AI Ethics Policy',
      description: 'A policy template to ensure ethical AI development and deployment within your organization.',
    },
    {
      id: 3,
      title: 'Incident Response Policy',
      description: 'A structured approach to handling AI-related incidents and mitigating risks effectively.',
    },
    {
      id: 4,
      title: 'Model Governance Policy',
      description: 'A policy template for governing AI models, including versioning, monitoring, and auditing.',
    },
    {
      id: 5,
      title: 'Bias Mitigation Policy',
      description: 'A policy template to identify, measure, and mitigate biases in AI systems.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Policy Templates</h1>
      <p className="text-lg text-gray-600 mb-8">
        Explore our collection of customizable policy templates designed to align with the AI Adoption & Management Framework (AI-AMF).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <h2 className="text-xl font-semibold text-gray-800">{template.title}</h2>
            <p className="text-gray-600 mt-2">{template.description}</p>
            <button
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            >
              View Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;
