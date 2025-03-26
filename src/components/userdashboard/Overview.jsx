import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Clock,
  Plus
} from 'react-feather';
import { cn } from '../../lib/utils';

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        onClick={() => navigate('/dashboard/new-policy')}
        className={cn(
          "flex items-center gap-3 p-4",
          "bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border",
          "hover:border-indigo-500 dark:hover:border-indigo-500",
          "transition-colors duration-200"
        )}
      >
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
          <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-dark-heading">New Policy</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Create from scratch or template</p>
        </div>
      </button>
      <button
        className={cn(
          "flex items-center gap-3 p-4",
          "bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border",
          "hover:border-indigo-500 dark:hover:border-indigo-500",
          "transition-colors duration-200"
        )}
      >
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
          <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-dark-heading">Export Policies</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Download as PDF or Word</p>
        </div>
      </button>
    </div>
  );
};

export const PolicyStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[
      { label: 'Active Policies', value: '12', change: '+2 this month' },
      { label: 'Policy Views', value: '2.4k', change: '+15% vs last month' },
      { label: 'Templates Used', value: '8', change: '4 this week' }
    ].map((stat, i) => (
      <div
        key={i}
        className="p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border"
      >
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-dark-heading">{stat.value}</p>
        <p className="mt-1 text-xs text-green-600 dark:text-green-400">{stat.change}</p>
      </div>
    ))}
  </div>
);

export const RecentActivity = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-heading">Recent Activity</h3>
    <div className="space-y-2">
      {[1, 2, 3].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border"
        >
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-dark-heading">Privacy Policy Updated</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const Overview = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-heading">Dashboard Overview</h2>
      </div>

      <QuickActions />
      <PolicyStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Policies */}
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-heading">Recent Policies</h3>
              <button
                onClick={() => navigate('/dashboard/policies')}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg",
                    "border border-gray-200 dark:border-dark-border",
                    "hover:border-indigo-500 dark:hover:border-indigo-500",
                    "transition-colors duration-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-heading">Privacy Policy v1.2</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last edited 2 days ago</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-6">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
};

// export default Overview;
