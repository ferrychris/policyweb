import React from 'react';
import Card from './Card';

const TestimonialCard = ({
  name,
  company,
  sector,
  content,
  rating,
  image,
  colorScheme = 'indigo'
}) => {
  const sectorColors = {
    Technology: 'indigo',
    Healthcare: 'purple',
    Education: 'green',
    Financial: 'blue'
  };

  const color = sectorColors[sector] || colorScheme;

  const colorVariants = {
    indigo: {
      light: 'from-indigo-500 to-indigo-600',
      dark: 'from-indigo-400 to-indigo-500',
      text: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    purple: {
      light: 'from-purple-500 to-purple-600',
      dark: 'from-purple-400 to-purple-500',
      text: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    green: {
      light: 'from-green-500 to-green-600',
      dark: 'from-green-400 to-green-500',
      text: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    blue: {
      light: 'from-blue-500 to-blue-600',
      dark: 'from-blue-400 to-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`fas fa-star ${
          index < rating
            ? colorVariants[color].text
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <Card 
      hover 
      className="relative overflow-hidden" 
      padding="large"
    >
      {/* Decorative corner gradient */}
      <div 
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorVariants[color].light} dark:${colorVariants[color].dark} opacity-10 rounded-bl-[6rem] transform rotate-6`} 
      />
      
      <div className="flex items-center mb-6">
        <div className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center ${colorVariants[color].bg}`}>
          {image ? (
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <i className={`fas fa-user-circle text-2xl ${colorVariants[color].text}`} />
          )}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-heading">
            {name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-text">
            {company}
          </p>
        </div>
      </div>

      <div className="flex mb-4 space-x-1">
        {renderStars(rating)}
      </div>

      <blockquote className="relative mb-6">
        <i className="fas fa-quote-left absolute -top-4 -left-2 text-4xl opacity-10 dark:opacity-5" />
        <p className="text-gray-600 dark:text-dark-text leading-relaxed">
          {content}
        </p>
      </blockquote>

      <div className="flex items-center pt-4 border-t border-gray-100 dark:border-dark-border">
        <span className={`text-sm font-medium ${colorVariants[color].text}`}>
          {sector} Sector
        </span>
      </div>
    </Card>
  );
};

export default TestimonialCard;
