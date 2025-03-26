import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <HeroSection
        title="WhitegloveAI Policy Generator"
        subtitle="Enterprise AI Governance Platform"
        primaryCta={{ text: 'Generate Your Policies', link: '/pricing' }}
        secondaryCta={{ text: 'View Templates', link: '/templates' }}
      />
      <FeaturesSection />
    </div>
  );
};

export default Home;