import React from 'react';
import { cn } from '../lib/utils';

const PolicyOption = ({
  title,
  description,
  selected = false,
  onClick,
  icon = null
}) => {
  return (
    <div 
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'group cursor-pointer border-2 rounded-xl p-5 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg',
        selected 
          ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20 ring-2 ring-indigo-500' 
          : 'border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card hover:border-indigo-500/50 dark:hover:border-indigo-500/50'
      )}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {icon && (
          <div className={cn(
            'p-3 rounded-full transition-colors duration-300',
            selected 
              ? 'bg-indigo-500/20 dark:bg-indigo-500/30' 
              : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20'
          )}>
            {icon}
          </div>
        )}
        <div>
          <h4 className={cn(
            'font-bold text-lg transition-colors duration-300',
            selected 
              ? 'text-gray-900 dark:text-dark-heading' 
              : 'text-gray-700 dark:text-dark-text group-hover:text-gray-900 dark:group-hover:text-dark-heading'
          )}>
            {title}
          </h4>
          {description && (
            <p className={cn(
              'text-sm transition-colors duration-300',
              selected 
                ? 'text-gray-600 dark:text-gray-300' 
                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyOption;
