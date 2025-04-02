import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import Section from './Section';

const HeroSection = ({ 
  title, 
  subtitle, 
  description,
  primaryCta, 
  secondaryCta,
  image = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
}) => {
  return (
    <Section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
      <div className="relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1>
              <span className="block text-4xl tracking-tight font-extrabold text-gray-900 dark:text-dark-heading sm:text-5xl md:text-6xl">
                {title}
              </span>
              <span className="mt-3 block gradient-text text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
                {subtitle}
              </span>
            </h1>
            
            <p className="mt-6 text-base text-gray-500 dark:text-dark-text sm:text-lg md:text-xl lg:text-lg xl:text-xl">
              {description}
            </p>
            
            <div className="mt-8 sm:mt-12 sm:flex sm:justify-center lg:justify-start space-x-4">
              <Button
                to={primaryCta.link}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                {primaryCta.text}
              </Button>
              
              <Button
                to={secondaryCta.link}
                variant="secondary"
                size="lg"
                className="mt-3 sm:mt-0 w-full sm:w-auto"
              >
                {secondaryCta.text}
              </Button>
            </div>
          </div>
          
          <div className="relative mt-12 sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <div className="relative block w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt="AI Governance"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 dark:from-indigo-500/30 dark:to-purple-600/30 mix-blend-multiply" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 hidden lg:block">
        <div className="w-96 h-96 transform rotate-45 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/5 dark:to-purple-900/5 rounded-3xl opacity-50" />
      </div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 hidden lg:block">
        <div className="w-96 h-96 transform -rotate-45 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/5 dark:to-indigo-900/5 rounded-3xl opacity-50" />
      </div>
    </Section>
  );
};

export default HeroSection;
