import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ShieldCheck, Database } from 'lucide-react';
import { cn, themeClasses, gradientClasses } from '../lib/utils';
import DashboardLayout from '../components/userdashboard/DashboardLayout';

const POLICY_TYPES = [
  {
    title: 'AI Ethics Policy',
    description: 'Comprehensive guidelines for ethical AI development',
    icon: ShieldCheck,
    color: 'text-cyan-400',
    href: '/dashboard/new-policy/ethics'
  },
  {
    title: 'Data Governance',
    description: 'Structured framework for data management',
    icon: Database,
    color: 'text-sky-400',
    href: '/dashboard/new-policy/data'
  },
  {
    title: 'Model Usage Policy',
    description: 'Best practices for AI model deployment',
    icon: FileText,
    color: 'text-blue-400',
    href: '/dashboard/new-policy/model'
  }
];

const PolicyPackageSelector = () => {
  const navigate = useNavigate();
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className={cn(
            "text-4xl font-extrabold mb-4",
            themeClasses.heading
          )}>
            Choose Your Policy Type
          </h1>
          <p className={cn(
            "text-lg",
            themeClasses.text
          )}>
            Select a policy type to get started with customized templates and guidelines
          </p>
        </div>

        {/* Policy Type Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {POLICY_TYPES.map((policy) => (
              <button
                key={policy.title}
                onClick={() => {
                  setSelectedPolicy(policy.title);
                  navigate(policy.href);
                }}
                className={cn(
                  "flex flex-col p-8 rounded-xl text-left",
                  "transition-all duration-200",
                  "hover:shadow-lg hover:shadow-navy-900/30",
                  themeClasses.card,
                  themeClasses.border,
                  "border",
                  selectedPolicy === policy.title && "ring-2 ring-cyan-500"
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center mb-6",
                  "bg-navy-700"
                )}>
                  <policy.icon className={cn(
                    "w-8 h-8",
                    policy.color
                  )} />
                </div>

                <h3 className={cn(
                  "text-xl font-semibold mb-3",
                  themeClasses.heading
                )}>
                  {policy.title}
                </h3>

                <p className={cn(
                  "text-base mb-6",
                  themeClasses.text
                )}>
                  {policy.description}
                </p>

                <div className={cn(
                  "mt-auto pt-6 border-t",
                  themeClasses.border
                )}>
                  <ul className="space-y-3">
                    <li className="flex items-center text-cyan-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2" />
                      <span className="text-sm">Customizable templates</span>
                    </li>
                    <li className="flex items-center text-sky-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mr-2" />
                      <span className="text-sm">Industry best practices</span>
                    </li>
                    <li className="flex items-center text-blue-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2" />
                      <span className="text-sm">Compliance ready</span>
                    </li>
                  </ul>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Start Guide */}
          <div className={cn(
            "mt-12 p-8 rounded-xl",
            themeClasses.card,
            themeClasses.border,
            "border"
          )}>
            <h3 className={cn(
              "text-xl font-semibold mb-4",
              themeClasses.heading
            )}>
              Quick Start Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Choose Policy Type',
                  description: 'Select from our pre-built policy templates'
                },
                {
                  step: '02',
                  title: 'Customize Content',
                  description: 'Tailor the policy to your needs'
                },
                {
                  step: '03',
                  title: 'Review & Export',
                  description: 'Generate your finalized policy document'
                }
              ].map((step) => (
                <div key={step.step} className="relative">
                  <div className={cn(
                    "text-4xl font-bold mb-4",
                    gradientClasses.text
                  )}>
                    {step.step}
                  </div>
                  <h4 className={cn(
                    "text-lg font-semibold mb-2",
                    themeClasses.heading
                  )}>
                    {step.title}
                  </h4>
                  <p className={themeClasses.text}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PolicyPackageSelector;
