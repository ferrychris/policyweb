import React from 'react';
import { Link } from 'react-router-dom';

export const Button = ({ 
  children, 
  variant = 'primary', 
  to, 
  onClick,
  size = 'md',
  className = '',
  icon,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-all duration-200 font-medium focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2',
    lg: 'px-8 py-3 text-lg'
  };

  const variants = {
    primary: 'gradient-bg text-white hover:opacity-90 focus:ring-offset-white dark:focus:ring-offset-dark-bg',
    secondary: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/30',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-dark-border'
  };

  const classes = `${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`;

  const content = (
    <>
      {icon && <i className={`fas fa-${icon} ${children ? 'mr-2' : ''}`} />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} {...props}>
      {content}
    </button>
  );
};
