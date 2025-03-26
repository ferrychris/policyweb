import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Edit2,
  Trash2,
  Plus,
  Search,
  Filter,
  Copy,
  ExternalLink
} from 'react-feather';
import { cn } from '../../lib/utils';

const MOCK_POLICIES = [
  {
    id: '1',
    name: 'Privacy Policy v1.2',
    type: 'privacy',
    lastEdited: '2025-03-15',
    status: 'published',
    views: 245
  },
  {
    id: '2',
    name: 'Terms of Service',
    type: 'terms',
    lastEdited: '2025-03-14',
    status: 'draft',
    views: 0
  },
  {
    id: '3',
    name: 'Cookie Policy',
    type: 'cookie',
    lastEdited: '2025-03-13',
    status: 'published',
    views: 123
  }
];

export const PolicyCard = ({ policy }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-heading">
              {policy.name}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Last edited {policy.lastEdited}</span>
              <span>•</span>
              <span>{policy.views} views</span>
            </div>
          </div>
        </div>
        <span className={cn(
          "px-2.5 py-0.5 rounded-full text-xs font-medium",
          getStatusColor(policy.status)
        )}>
          {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          className={cn(
            "p-2 rounded-lg text-gray-600 dark:text-gray-400",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "transition-colors duration-200"
          )}
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          className={cn(
            "p-2 rounded-lg text-gray-600 dark:text-gray-400",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "transition-colors duration-200"
          )}
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          className={cn(
            "p-2 rounded-lg text-gray-600 dark:text-gray-400",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "transition-colors duration-200"
          )}
          title="Copy Link"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          className={cn(
            "p-2 rounded-lg text-gray-600 dark:text-gray-400",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "transition-colors duration-200"
          )}
          title="View"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
        <button
          className={cn(
            "p-2 rounded-lg text-red-600 dark:text-red-400",
            "hover:bg-red-100 dark:hover:bg-red-900/30",
            "transition-colors duration-200"
          )}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const PoliciesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredPolicies = MOCK_POLICIES.filter(policy => {
    if (selectedFilter !== 'all' && policy.status !== selectedFilter) {
      return false;
    }
    if (searchQuery) {
      return policy.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-heading">
          Policies
        </h2>
        <button
          onClick={() => navigate('/dashboard/new-policy')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-indigo-600 text-white",
            "hover:bg-indigo-700",
            "transition-colors duration-200"
          )}
        >
          <Plus className="w-4 h-4" />
          <span>New Policy</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies..."
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-lg",
              "bg-white dark:bg-dark-card",
              "border border-gray-200 dark:border-dark-border",
              "focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
              "focus:border-indigo-500 dark:focus:border-indigo-400",
              "text-gray-900 dark:text-dark-text",
              "placeholder-gray-500 dark:placeholder-gray-400"
            )}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className={cn(
              "pl-10 pr-8 py-2 rounded-lg appearance-none",
              "bg-white dark:bg-dark-card",
              "border border-gray-200 dark:border-dark-border",
              "focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
              "focus:border-indigo-500 dark:focus:border-indigo-400",
              "text-gray-900 dark:text-dark-text"
            )}
          >
            <option value="all">All Policies</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPolicies.map((policy) => (
          <PolicyCard key={policy.id} policy={policy} />
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="text-center py-12">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full inline-flex">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-dark-heading">
            No policies found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery
              ? "Try adjusting your search or filter"
              : "Get started by creating your first policy"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate('/dashboard/new-policy')}
              className={cn(
                "mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-indigo-600 text-white",
                "hover:bg-indigo-700",
                "transition-colors duration-200"
              )}
            >
              <Plus className="w-4 h-4" />
              <span>Create Policy</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PoliciesPage;
