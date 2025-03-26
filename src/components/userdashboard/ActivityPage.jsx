import React, { useState } from 'react';
import {
  Clock,
  FileText,
  Edit2,
  Download,
  Eye,
  Search,
  Filter,
  Calendar
} from 'react-feather';
import { cn } from '../../lib/utils';

const MOCK_ACTIVITIES = [
  {
    id: '1',
    type: 'edit',
    policyName: 'Privacy Policy v1.2',
    timestamp: '2025-03-15T14:30:00',
    user: 'John Doe',
    details: 'Updated GDPR compliance section'
  },
  {
    id: '2',
    type: 'view',
    policyName: 'Terms of Service',
    timestamp: '2025-03-15T13:45:00',
    user: 'External User',
    details: 'Policy viewed by external user'
  },
  {
    id: '3',
    type: 'download',
    policyName: 'Cookie Policy',
    timestamp: '2025-03-15T12:15:00',
    user: 'John Doe',
    details: 'Downloaded PDF version'
  }
];

export const ActivityIcon = ({ type }) => {
  const icons = {
    edit: Edit2,
    view: Eye,
    download: Download,
    create: FileText
  };

  const Icon = icons[type] || Clock;

  return (
    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
      <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
    </div>
  );
};

export const ActivityItem = ({ activity }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border">
      <ActivityIcon type={activity.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-dark-heading truncate">
            {activity.policyName}
          </p>
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatTime(activity.timestamp)}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {activity.details}
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          by {activity.user}
        </p>
      </div>
    </div>
  );
};

export const ActivityPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredActivities = MOCK_ACTIVITIES.filter(activity => {
    if (selectedFilter !== 'all' && activity.type !== selectedFilter) {
      return false;
    }
    if (searchQuery) {
      return activity.policyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.details.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-heading">
          Activity Log
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities..."
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
            <option value="all">All Activities</option>
            <option value="edit">Edits</option>
            <option value="view">Views</option>
            <option value="download">Downloads</option>
          </select>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={cn(
              "pl-10 pr-4 py-2 rounded-lg",
              "bg-white dark:bg-dark-card",
              "border border-gray-200 dark:border-dark-border",
              "focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
              "focus:border-indigo-500 dark:focus:border-indigo-400",
              "text-gray-900 dark:text-dark-text"
            )}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredActivities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full inline-flex">
            <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-dark-heading">
            No activities found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
