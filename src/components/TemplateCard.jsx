import React from 'react';
import Card from './Card';
import Button from './Button';

const TemplateCard = ({
  icon,
  title,
  description,
  category,
  onClick
}) => {
  const categoryConfig = {
    Governance: {
      color: 'indigo',
      icon: 'fa-shield-alt'
    },
    Operations: {
      color: 'purple',
      icon: 'fa-cogs'
    },
    Compliance: {
      color: 'blue',
      icon: 'fa-check-circle'
    }
  };

  const config = categoryConfig[category] || { color: 'indigo', icon: 'fa-file-alt' };
  const { color } = config;

  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/30',
      hover: 'group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-900/30',
      hover: 'group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/30',
      hover: 'group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
    }
  };

  return (
    <Card 
      hover 
      className="group flex flex-col h-full transition-all duration-200"
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-lg ${colorStyles[color].bg} ${colorStyles[color].hover} transition-colors duration-200 flex items-center justify-center mb-4`}>
        <i className={`fas ${icon || config.icon} text-lg ${colorStyles[color].text}`} />
      </div>

      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-heading mb-2">
          {title}
        </h3>

        <p className="text-base text-gray-500 dark:text-dark-text mb-6">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
        <span className={`text-sm font-medium ${colorStyles[color].text} flex items-center`}>
          <i className={`fas ${config.icon} mr-2 opacity-75`} />
          {category}
        </span>

        <Button
          variant="ghost"
          size="sm"
          icon="arrow-right"
          className={`${colorStyles[color].text} ${colorStyles[color].hover} -mr-2`}
        >
          Use Template
        </Button>
      </div>
    </Card>
  );
};

export default TemplateCard;
