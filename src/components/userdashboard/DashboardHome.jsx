import React, { useState } from 'react';
import {
  FaDollarSign,
  FaChartLine,
  FaUsers,
  FaPercent,
  FaFileAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaHistory,
  FaPlus,
  FaDownload,
  FaCodeBranch
} from 'react-icons/fa';
import StatCard from './components/StatCard';
import PolicyMetricsChart from './components/CampaignChart';
import PolicyTable from './components/CampaignTable';
import RecommendationCard from './components/RecommendationCard';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const navigate = useNavigate();

  // Mock data for policy generation metrics
  const policyPerformanceData = [
    { name: 'Jan', value: 120, newPolicies: 20, updatedPolicies: 15 },
    { name: 'Feb', value: 150, newPolicies: 25, updatedPolicies: 18 },
    { name: 'Mar', value: 180, newPolicies: 30, updatedPolicies: 22 },
    { name: 'Apr', value: 220, newPolicies: 35, updatedPolicies: 25 },
    { name: 'May', value: 280, newPolicies: 40, updatedPolicies: 30 },
    { name: 'Jun', value: 350, newPolicies: 45, updatedPolicies: 35 }
  ];

  const policyStats = {
    totalPolicies: {
      value: 350,
      change: 25,
      label: 'Total Policies',
      icon: FaClock,
      trend: 'up'
    },
    activePolicies: {
      value: 280,
      change: 15,
      label: 'Active Policies',
      icon: FaShieldAlt,
      trend: 'up'
    },
    policyCompliance: {
      value: 98.5,
      change: 2.1,
      label: 'Compliance Rate',
      icon: FaCheckCircle,
      trend: 'up'
    },
    pendingReviews: {
      value: 12,
      change: -5,
      label: 'Pending Reviews',
      icon: FaExclamationCircle,
      trend: 'down'
    },
    averageReviewTime: {
      value: '2.5',
      change: -0.5,
      label: 'Avg. Review Time (days)',
      icon: FaClock,
      trend: 'up'
    },
    policyVersions: {
      value: '1,250',
      change: 45,
      label: 'Total Versions',
      icon: FaHistory,
      trend: 'up'
    }
  };

  const policyCategories = [
    { name: 'HR Policies', count: 120, compliance: 98.5 },
    { name: 'Security Policies', count: 85, compliance: 99.2 },
    { name: 'Compliance Policies', count: 65, compliance: 97.8 },
    { name: 'Operational Policies', count: 80, compliance: 98.9 }
  ];

  const activePolicies = [
    {
      id: 1,
      name: 'Employee Handbook 2024',
      status: 'Active',
      lastUpdated: '2 days ago',
      compliance: 98.5,
      reviews: 3,
      version: 'v2.1',
      category: 'HR Policies'
    },
    {
      id: 2,
      name: 'Data Protection Policy',
      status: 'Active',
      lastUpdated: '1 week ago',
      compliance: 99.2,
      reviews: 2,
      version: 'v3.0',
      category: 'Security Policies'
    },
    {
      id: 3,
      name: 'Workplace Safety Guidelines',
      status: 'Active',
      lastUpdated: '3 days ago',
      compliance: 97.8,
      reviews: 4,
      version: 'v1.5',
      category: 'Compliance Policies'
    },
    {
      id: 4,
      name: 'Remote Work Policy',
      status: 'Active',
      lastUpdated: '5 days ago',
      compliance: 98.9,
      reviews: 2,
      version: 'v2.0',
      category: 'HR Policies'
    }
  ];

  const recommendations = [
    {
      title: 'Update Employee Handbook',
      description: 'The current version is due for review. Consider updating sections on remote work and new benefits.',
      impact: 'High',
      priority: 'Urgent',
      category: 'HR Policies',
      suggestedChanges: ['Remote work guidelines', 'Updated benefits package', 'New leave policies'],
      estimatedTime: '2-3 days'
    },
    {
      title: 'Review Data Protection Policy',
      description: 'Recent regulatory changes require updates to data handling procedures.',
      impact: 'Medium',
      priority: 'Important',
      category: 'Security Policies',
      suggestedChanges: ['GDPR compliance updates', 'Data retention policies', 'Security protocols'],
      estimatedTime: '1-2 days'
    },
    {
      title: 'Enhance Safety Guidelines',
      description: 'Add new sections on emergency procedures and updated safety protocols.',
      impact: 'High',
      priority: 'Important',
      category: 'Compliance Policies',
      suggestedChanges: ['Emergency response procedures', 'Updated safety protocols', 'Training requirements'],
      estimatedTime: '2-3 days'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E2DDFF]">Policy Dashboard</h1>
          <p className="text-[#B4A5FF] mt-1">Manage and track your organization's policies</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/dashboard/new-policy')}
            className="px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Create Policy
          </button>
          <button
            onClick={() => {/* Implement export functionality */ }}
            className="px-4 py-2 bg-[#B4A5FF]/20 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors flex items-center gap-2"
          >
            <FaDownload className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Policies Card */}
        <div className="bg-[#13091F] rounded-xl p-6 shadow-lg border border-[#2E1D4C]/30 hover:border-[#B4A5FF]/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#B4A5FF]/10 rounded-lg">
              <FaFileAlt className="w-6 h-6 text-[#B4A5FF]" />
            </div>
            <div className="flex items-center gap-1 text-[#B4A5FF]/80 text-sm">
              <span className="flex items-center gap-1 text-green-400">
                <FaChartLine className="w-4 h-4" />
                25
              </span>
              <span>vs last month</span>
            </div>
          </div>
          <h3 className="text-[#E2DDFF]/80 text-sm font-medium mb-1">Total Policies</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#E2DDFF]">350</span>
            <span className="text-[#B4A5FF]/60 text-sm">policies</span>
          </div>
        </div>

        {/* Active Policies Card */}
        <div className="bg-[#13091F] rounded-xl p-6 shadow-lg border border-[#2E1D4C]/30 hover:border-[#B4A5FF]/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#B4A5FF]/10 rounded-lg">
              <FaShieldAlt className="w-6 h-6 text-[#B4A5FF]" />
            </div>
            <div className="flex items-center gap-1 text-[#B4A5FF]/80 text-sm">
              <span className="flex items-center gap-1 text-green-400">
                <FaChartLine className="w-4 h-4" />
                15
              </span>
              <span>vs last month</span>
            </div>
          </div>
          <h3 className="text-[#E2DDFF]/80 text-sm font-medium mb-1">Active Policies</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#E2DDFF]">280</span>
            <span className="text-[#B4A5FF]/60 text-sm">policies</span>
          </div>
        </div>

        {/* Compliance Rate Card */}
        <div className="bg-[#13091F] rounded-xl p-6 shadow-lg border border-[#2E1D4C]/30 hover:border-[#B4A5FF]/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#B4A5FF]/10 rounded-lg">
              <FaCheckCircle className="w-6 h-6 text-[#B4A5FF]" />
            </div>
            <div className="flex items-center gap-1 text-[#B4A5FF]/80 text-sm">
              <span className="flex items-center gap-1 text-green-400">
                <FaChartLine className="w-4 h-4" />
                2.1%
              </span>
              <span>vs last month</span>
            </div>
          </div>
          <h3 className="text-[#E2DDFF]/80 text-sm font-medium mb-1">Compliance Rate</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#E2DDFF]">98.5%</span>
            <span className="text-[#B4A5FF]/60 text-sm">target: 95%</span>
          </div>
        </div>

        {/* Pending Reviews Card */}
        <div className="bg-[#13091F] rounded-xl p-6 shadow-lg border border-[#2E1D4C]/30 hover:border-[#B4A5FF]/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#B4A5FF]/10 rounded-lg">
              <FaClock className="w-6 h-6 text-[#B4A5FF]" />
            </div>
            <div className="flex items-center gap-1 text-[#B4A5FF]/80 text-sm">
              <span className="flex items-center gap-1 text-red-400">
                <FaChartLine className="w-4 h-4" />
                5
              </span>
              <span>vs last month</span>
            </div>
          </div>
          <h3 className="text-[#E2DDFF]/80 text-sm font-medium mb-1">Pending Reviews</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#E2DDFF]">12</span>
            <span className="text-[#B4A5FF]/60 text-sm">reviews</span>
          </div>
        </div>

        {/* Average Review Time Card */}
        <div className="bg-[#13091F] rounded-xl p-6 shadow-lg border border-[#2E1D4C]/30 hover:border-[#B4A5FF]/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#B4A5FF]/10 rounded-lg">
              <FaClock className="w-6 h-6 text-[#B4A5FF]" />
            </div>
            <div className="flex items-center gap-1 text-[#B4A5FF]/80 text-sm">
              <span className="flex items-center gap-1 text-green-400">
                <FaChartLine className="w-4 h-4" />
                0.5
              </span>
              <span>vs last month</span>
            </div>
          </div>
          <h3 className="text-[#E2DDFF]/80 text-sm font-medium mb-1">Avg. Review Time</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#E2DDFF]">2.5</span>
            <span className="text-[#B4A5FF]/60 text-sm">days</span>
          </div>
        </div>

        {/* Total Versions Card */}
        <div className="bg-[#13091F] rounded-xl p-6 shadow-lg border border-[#2E1D4C]/30 hover:border-[#B4A5FF]/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#B4A5FF]/10 rounded-lg">
              <FaCodeBranch className="w-6 h-6 text-[#B4A5FF]" />
            </div>
            <div className="flex items-center gap-1 text-[#B4A5FF]/80 text-sm">
              <span className="flex items-center gap-1 text-green-400">
                <FaChartLine className="w-4 h-4" />
                45
              </span>
              <span>vs last month</span>
            </div>
          </div>
          <h3 className="text-[#E2DDFF]/80 text-sm font-medium mb-1">Total Versions</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#E2DDFF]">1,250</span>
            <span className="text-[#B4A5FF]/60 text-sm">versions</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PolicyMetricsChart
          data={policyPerformanceData}
          title="Policy Generation Trends"
          className="lg:col-span-2"
        />
        <div className="space-y-6">
          {/* Policy Categories */}
          <div className="p-6 rounded-xl bg-[#13091F] border border-[#2E1D4C]/30">
            <h3 className="text-lg font-semibold text-[#E2DDFF] mb-4">Policy Categories</h3>
            <div className="space-y-4">
              {policyCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className="w-4 h-4 text-[#B4A5FF]" />
                    <span className="text-[#E2DDFF]">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#B4A5FF]">{category.count} policies</span>
                    <span className={cn(
                      "text-sm",
                      category.compliance >= 98 ? "text-green-400" :
                        category.compliance >= 95 ? "text-yellow-400" :
                          "text-red-400"
                    )}>
                      {category.compliance}% compliance
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="p-6 rounded-xl bg-[#13091F] border border-[#2E1D4C]/30">
            <h3 className="text-lg font-semibold text-[#E2DDFF] mb-4">AI Recommendations</h3>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <RecommendationCard
                  key={index}
                  title={rec.title}
                  description={rec.description}
                  impact={rec.impact}
                  priority={rec.priority}
                  category={rec.category}
                  suggestedChanges={rec.suggestedChanges}
                  estimatedTime={rec.estimatedTime}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Policies Table */}
      <div className="p-6 rounded-xl bg-[#13091F] border border-[#2E1D4C]/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#E2DDFF]">Active Policies</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-[#B4A5FF]/20 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors text-sm">
              Filter
            </button>
            <button className="px-3 py-1.5 bg-[#B4A5FF]/20 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors text-sm">
              Sort
            </button>
          </div>
        </div>
        <PolicyTable data={activePolicies} />
      </div>
    </div>
  );
};

export default DashboardHome;
