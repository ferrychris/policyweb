import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn, themeClasses } from '../lib/utils';

const Select = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  required = false,
  className,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={selectId}
          className={cn(
            "block text-sm font-medium mb-1.5",
            themeClasses.text
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          className={cn(
            "block w-full rounded-lg shadow-sm",
            "bg-navy-800/50 border border-navy-700",
            "text-white placeholder-slate-400",
            "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-navy-800 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
