import React from 'react';
import { Card } from './Card';

const Section = ({ 
  children,
  title,
  subtitle,
  gradientTitle = false,
  centered = false,
  withCard = false,
  className = '',
  spacing = 'default',
  divider = false,
  ...props 
}) => {
  const spacingVariants = {
    none: '',
    small: 'py-4 mb-8',
    default: 'py-8 mb-12',
    large: 'py-12 mb-16'
  };

  const titleClasses = `text-3xl font-extrabold tracking-tight ${
    gradientTitle ? 'gradient-text' : 'text-gray-900 dark:text-dark-heading'
  } sm:text-4xl`;

  const subtitleClasses = 'mt-4 text-xl text-gray-500 dark:text-dark-text max-w-2xl';

  const content = (
    <>
      {(title || subtitle) && (
        <div className={`${centered ? 'text-center' : ''} ${centered ? 'mx-auto' : ''} mb-8`}>
          {title && <h2 className={titleClasses}>{title}</h2>}
          {subtitle && (
            <p className={`${subtitleClasses} ${centered ? 'mx-auto' : ''}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </>
  );

  return (
    <section 
      className={`${spacingVariants[spacing]} ${className} ${
        divider ? 'border-b border-gray-200 dark:border-dark-border' : ''
      }`} 
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {withCard ? (
          <Card gradient={gradientTitle} className="overflow-hidden">
            {content}
          </Card>
        ) : (
          content
        )}
      </div>
    </section>
  );
};

export default Section;
