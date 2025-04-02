import React, { useState } from 'react';
import { Activity, FileText, Users, ClipboardList, X } from 'lucide-react';
import { cn, themeClasses, gradientClasses } from '../lib/utils';
import DashboardLayout from '../components/userdashboard/DashboardLayout';
import PolicyCreationForm from '../components/forms/PolicyCreationForm';
import PolicyGenerator from '../components/generator/PolicyGenerator';

const STATS = [
  {
    label: 'Total Policies',
    value: '12',
    icon: FileText,
    trend: '+2 this month'
  },
  {
    label: 'Active Views',
    value: '2.4k',
    icon: Activity,
    trend: '+20% vs last month'
  },
  {
    label: 'Templates Used',
    value: '8',
    icon: ClipboardList,
    trend: '3 new templates'
  },
  {
    label: 'Team Members',
    value: '24',
    icon: Users,
    trend: '+4 this week'
  }
];

const RECENT_POLICIES = [
  {
    name: 'AI Ethics Policy v2.0',
    updatedAt: '2 hours ago',
    status: 'In Review',
    type: 'ethics'
  },
  {
    name: 'Data Governance Framework',
    updatedAt: '5 hours ago',
    status: 'Published',
    type: 'data'
  },
  {
    name: 'Model Usage Guidelines',
    updatedAt: '1 day ago',
    status: 'Draft',
    type: 'model'
  }
];

const RECENT_ACTIVITY = [
  {
    action: 'Policy Updated',
    description: 'AI Ethics Policy v2.0 was updated by John',
    time: '2 hours ago'
  },
  {
    action: 'New Comment',
    description: 'Sarah commented on Data Governance Framework',
    time: '4 hours ago'
  },
  {
    action: 'Policy Published',
    description: 'Model Usage Guidelines was published',
    time: '1 day ago'
  }
];

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicyType, setSelectedPolicyType] = useState(null);
  const [organizationDetails, setOrganizationDetails] = useState(null);
  const [step, setStep] = useState('form'); // 'form' or 'generator'

  const handlePolicyClick = (policyType) => {
    setSelectedPolicyType(policyType);
    setStep('form');
    setShowModal(true);
  };

  const handleFormSubmit = (formData) => {
    setOrganizationDetails(formData);
    setStep('generator');
  };

  const handleClose = () => {
    setShowModal(false);
    setStep('form');
    setSelectedPolicyType(null);
    setOrganizationDetails(null);
  };

  return (
    <DashboardLayout>
      {showModal && (
        <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={cn(
            "relative w-full max-w-2xl rounded-xl",
            themeClasses.card,
            themeClasses.border,
            "border"
          )}>
            <button
              onClick={handleClose}
              className={cn(
                "absolute top-4 right-4",
                "p-2 rounded-lg",
                "hover:bg-navy-700/50",
                "transition-colors"
              )}
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
            <div className="p-6">
              <h2 className={cn(
                "text-2xl font-semibold mb-6",
                themeClasses.heading
              )}>
                {step === 'form' ? 'Create New Policy' : 'Generate Policy Content'}
              </h2>
              {step === 'form' ? (
                <PolicyCreationForm
                  initialPolicyType={selectedPolicyType}
                  onSubmit={handleFormSubmit}
                />
              ) : (
                <PolicyGenerator
                  policyType={selectedPolicyType}
                  organizationDetails={organizationDetails}
                  onClose={handleClose}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats and Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className={cn(
                    "p-6 rounded-xl",
                    themeClasses.card,
                    themeClasses.border,
                    "border"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn("text-sm", themeClasses.text)}>
                        {stat.label}
                      </p>
                      <h3 className={cn(
                        "text-2xl font-bold mt-2",
                        themeClasses.heading
                      )}>
                        {stat.value}
                      </h3>
                      <p className="text-sm text-cyan-400 mt-1">
                        {stat.trend}
                      </p>
                    </div>
                    <div className={cn(
                      "p-3 rounded-lg",
                      "bg-navy-700"
                    )}>
                      <stat.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Policies */}
            <div className={cn(
              "p-6 rounded-xl",
              themeClasses.card,
              themeClasses.border,
              "border"
            )}>
              <h2 className={cn(
                "text-xl font-semibold mb-6",
                themeClasses.heading
              )}>
                Recent Policies
              </h2>
              <div className="space-y-4">
                {RECENT_POLICIES.map((policy, index) => (
                  <button
                    key={policy.name}
                    onClick={() => handlePolicyClick(policy.type)}
                    className={cn(
                      "w-full text-left",
                      "p-4 rounded-lg",
                      "bg-navy-800/50",
                      "hover:bg-navy-700/50",
                      "transition-colors",
                      index !== RECENT_POLICIES.length - 1 && "border-b",
                      themeClasses.border
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={themeClasses.heading}>
                          {policy.name}
                        </h3>
                        <p className={cn(
                          "text-sm mt-1",
                          themeClasses.text
                        )}>
                          Updated {policy.updatedAt}
                        </p>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm",
                        policy.status === 'Published' ? "bg-green-500/20 text-green-400" :
                          policy.status === 'In Review' ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-blue-500/20 text-blue-400"
                      )}>
                        {policy.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className={cn(
              "p-6 rounded-xl",
              themeClasses.card,
              themeClasses.border,
              "border"
            )}>
              <h2 className={cn(
                "text-xl font-semibold mb-6",
                themeClasses.heading
              )}>
                Activity Feed
              </h2>
              <div className="space-y-4">
                {RECENT_ACTIVITY.map((activity, index) => (
                  <div
                    key={activity.action}
                    className={cn(
                      "p-4 rounded-lg",
                      "bg-navy-800/50",
                      index !== RECENT_ACTIVITY.length - 1 && "border-b",
                      themeClasses.border
                    )}
                  >
                    <h3 className={cn(
                      "text-sm font-medium",
                      gradientClasses.text
                    )}>
                      {activity.action}
                    </h3>
                    <p className={cn(
                      "text-sm mt-1",
                      themeClasses.text
                    )}>
                      {activity.description}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="lg:col-span-1">
            <div className={cn(
              "p-6 rounded-xl",
              themeClasses.card,
              themeClasses.border,
              "border"
            )}>
              <h2 className={cn(
                "text-xl font-semibold mb-6",
                themeClasses.heading
              )}>
                Quick Actions
              </h2>
              <div className="space-y-4">
                {['ethics', 'data', 'model'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handlePolicyClick(type)}
                    className={cn(
                      "w-full p-4 rounded-lg",
                      "bg-navy-800/50",
                      "hover:bg-navy-700/50",
                      "transition-colors",
                      "text-left"
                    )}
                  >
                    <h3 className={themeClasses.heading}>
                      Create {type === 'ethics' ? 'AI Ethics Policy' :
                        type === 'data' ? 'Data Governance Policy' :
                          'Model Usage Policy'}
                    </h3>
                    <p className={cn(
                      "text-sm mt-1",
                      themeClasses.text
                    )}>
                      {type === 'ethics' ? 'Define ethical AI guidelines' :
                        type === 'data' ? 'Set data handling standards' :
                          'Establish model usage rules'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;