import React from 'react';
import { cn, themeClasses } from '../lib/utils';
import { ArrowRight } from 'lucide-react';

const PolicyCard = ({ policy, isSelected, onSelect }) => {
  // Color schemes based on policy type
  const getColors = (type) => {
    switch (type) {
      case 'auto':
        return {
          border: isSelected ? 'border-cyan-500' : themeClasses.border,
          bg: isSelected ? 'bg-cyan-500/10' : themeClasses.card,
          iconBg: isSelected ? 'bg-cyan-500/20' : 'bg-navy-700',
          iconColor: isSelected ? 'text-cyan-400' : 'text-slate-400'
        };
      case 'home':
        return {
          border: isSelected ? 'border-sky-500' : themeClasses.border,
          bg: isSelected ? 'bg-sky-500/10' : themeClasses.card,
          iconBg: isSelected ? 'bg-sky-500/20' : 'bg-navy-700',
          iconColor: isSelected ? 'text-sky-400' : 'text-slate-400'
        };
      case 'life':
        return {
          border: isSelected ? 'border-blue-500' : themeClasses.border,
          bg: isSelected ? 'bg-blue-500/10' : themeClasses.card,
          iconBg: isSelected ? 'bg-blue-500/20' : 'bg-navy-700',
          iconColor: isSelected ? 'text-blue-400' : 'text-slate-400'
        };
      default:
        return {
          border: isSelected ? 'border-cyan-500' : themeClasses.border,
          bg: isSelected ? 'bg-cyan-500/10' : themeClasses.card,
          iconBg: isSelected ? 'bg-cyan-500/20' : 'bg-navy-700',
          iconColor: isSelected ? 'text-cyan-400' : 'text-slate-400'
        };
    }
  };

  const colors = getColors(policy.type);

  return (
    <div
      onClick={() => onSelect(policy.id)}
      className={cn(
        'relative rounded-2xl border p-6 cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:shadow-navy-900/30',
        colors.border,
        colors.bg,
        isSelected && 'ring-2 ring-offset-2 ring-offset-navy-900'
      )}
    >
      <div className="flex items-start">
        {/* Icon */}
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            colors.iconBg
          )}
        >
          {policy.icon}
        </div>

        {/* Content */}
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={cn(
                  'text-lg font-semibold',
                  isSelected ? themeClasses.heading : 'text-slate-300'
                )}
              >
                {policy.title}
              </h3>
              <p
                className={cn(
                  'mt-1 text-sm',
                  isSelected ? 'text-slate-300' : 'text-slate-400'
                )}
              >
                {policy.description}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className={cn(
            'border-t pt-4 mt-4',
            themeClasses.border
          )}>
            <h4
              className={cn(
                'text-sm font-medium',
                isSelected ? themeClasses.heading : 'text-slate-300'
              )}
            >
              Features
            </h4>
            <ul className="mt-2 space-y-1">
              {policy.features.map((feature, index) => (
                <li
                  key={index}
                  className={cn(
                    'flex items-center text-sm',
                    isSelected ? 'text-slate-300' : 'text-slate-400'
                  )}
                >
                  <ArrowRight
                    className={cn(
                      'mr-2 h-4 w-4',
                      isSelected ? colors.iconColor : 'text-slate-500'
                    )}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;
