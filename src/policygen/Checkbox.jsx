import React from 'react';
import { Check } from 'react-feather';
import { cn } from '../lib/utils';

const Checkbox = React.forwardRef(({ 
  label,
  name,
  checked = false,
  onChange,
  disabled = false,
  required = false,
  error,
  className,
  description,
  ...props
}, ref) => {
  return (
    <div className={cn("flex items-start space-x-2", className)}>
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          id={name}
          name={name}
          ref={ref}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={cn(
            "h-4 w-4 rounded",
            "border-gray-300 dark:border-dark-border",
            "text-indigo-600 dark:text-indigo-500",
            "focus:ring-indigo-500 dark:focus:ring-indigo-400",
            "bg-white dark:bg-dark-card",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500 dark:border-red-500"
          )}
          {...props}
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor={name}
          className={cn(
            "text-sm font-medium select-none",
            disabled ? "text-gray-500 dark:text-gray-400" : "text-gray-700 dark:text-dark-text",
            error && "text-red-500 dark:text-red-400"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {description && (
          <p className={cn(
            "text-sm",
            disabled ? "text-gray-400 dark:text-gray-500" : "text-gray-500 dark:text-gray-400"
          )}>
            {description}
          </p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
