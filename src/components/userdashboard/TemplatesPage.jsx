import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Star,
  Copy,
  Plus
} from 'react-feather';
import { cn } from '../../lib/utils';

const MOCK_TEMPLATES = [
  {
    id: '1',
    name: 'GDPR Privacy Policy',
    category: 'privacy',
    description: 'Comprehensive privacy policy template compliant with GDPR requirements',
    popularity: 'high',
    lastUsed: '2025-03-15'
  },
  {
    id: '2',
    name: 'Standard Terms of Service',
    category: 'terms',
    description: 'General terms of service template suitable for most websites',
    popularity: 'medium',
    lastUsed: '2025-03-14'
  },
  {
    id: '3',
    name: 'E-commerce Cookie Policy',
    category: 'cookie',
    description: 'Cookie policy template optimized for e-commerce websites',
    popularity: 'high',
    lastUsed: '2025-03-13'
  }
];

const TemplateCard = ({ template }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-heading">
              {template.name}
            </h3>
            {template.popularity === 'high' && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                Popular
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {template.description}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Last used {template.lastUsed}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
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
          <span>Use Template</span>
        </button>
        <button
          className={cn(
            "p-2 rounded-lg text-gray-600 dark:text-gray-400",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "transition-colors duration-200"
          )}
          title="Copy"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const TemplatesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTemplates = MOCK_TEMPLATES.filter(template => {
    if (selectedCategory !== 'all' && template.category !== selectedCategory) {
      return false;
    }
    if (searchQuery) {
      return template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             template.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-heading">
          Templates
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={cn(
              "pl-10 pr-8 py-2 rounded-lg appearance-none",
              "bg-white dark:bg-dark-card",
              "border border-gray-200 dark:border-dark-border",
              "focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
              "focus:border-indigo-500 dark:focus:border-indigo-400",
              "text-gray-900 dark:text-dark-text"
            )}
          >
            <option value="all">All Categories</option>
            <option value="privacy">Privacy Policies</option>
            <option value="terms">Terms of Service</option>
            <option value="cookie">Cookie Policies</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full inline-flex">
            <Star className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-dark-heading">
            No templates found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
