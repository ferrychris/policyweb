import React from 'react';
import FeatureCard from './FeatureCard';

const features = [
  {
    icon: 'fa-file-alt',
    title: 'Customizable Policy Templates',
    description: '18+ pre-built policy templates aligned with industry standards and the AI-AMF framework, easily customizable to your organization\'s needs.'
  },
  {
    icon: 'fa-sitemap',
    title: 'Process-Centric Orchestration',
    description: 'Build a semantic layer for your organization with our ontology generator, representing your data and processes in a business-centric way.'
  },
  {
    icon: 'fa-code',
    title: 'Business as Code',
    description: 'Transform business documents into structured knowledge bases with markdown formats, making your policies machine-readable and versionable.'
  },
  {
    icon: 'fa-tasks',
    title: 'Compliance Tracking',
    description: 'Monitor policy implementation and compliance across your organization with dashboards and reporting tools.'
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-12 bg-white dark:bg-dark-card shadow-lg rounded-lg mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base gradient-text font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-dark-heading sm:text-4xl">
            Everything you need for AI governance
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-dark-text lg:mx-auto">
            Our platform provides a comprehensive solution for creating, managing, and implementing AI policies across your organization.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
