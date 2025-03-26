import React from 'react';
import { cn } from '../lib/utils';

const buttonVariants = {
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none",
  variants: {
    default: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-dark-bg",
    secondary: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-dark-bg",
    outline: "border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-dark-bg",
    ghost: "text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-dark-bg",
    destructive: "bg-red-600 dark:bg-red-900 text-white hover:bg-red-700 dark:hover:bg-red-800 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-dark-bg"
  },
  sizes: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  },
  states: {
    disabled: "disabled:opacity-50 disabled:cursor-not-allowed"
  }
};

const Button = React.forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  asChild = false, 
  disabled = false,
  children,
  ...props 
}, ref) => {
  const Comp = asChild ? React.Fragment : 'button';
  
  return (
    <Comp
      className={cn(
        buttonVariants.base,
        buttonVariants.variants[variant],
        buttonVariants.sizes[size],
        disabled && buttonVariants.states.disabled,
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {asChild ? React.Children.only(children) : children}
    </Comp>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
