import React from 'react';

export const Card = ({ 
  children, 
  className = '',
  hover = false,
  gradient = false,
  border = false,
  padding = 'default',
  onClick,
  ...props 
}) => {
  const baseClasses = 'bg-white dark:bg-dark-card rounded-lg transition-all';
  
  const shadowClasses = hover 
    ? 'shadow-md hover:shadow-xl dark:shadow-dark-border/5 dark:hover:shadow-indigo-500/10' 
    : 'shadow-lg dark:shadow-dark-border/5';
  
  const borderClasses = border 
    ? 'border border-gray-200 dark:border-dark-border' 
    : '';
  
  const gradientClasses = gradient 
    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10' 
    : '';

  const paddingVariants = {
    none: '',
    small: 'p-4',
    default: 'p-6',
    large: 'p-8'
  };

  const paddingClasses = paddingVariants[padding];
  
  return (
    <div 
      className={`${baseClasses} ${shadowClasses} ${borderClasses} ${gradientClasses} ${paddingClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`mb-4 border-b border-gray-200 dark:border-dark-border pb-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <h3 
      className={`text-xl font-semibold text-gray-900 dark:text-dark-heading ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardContent = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
