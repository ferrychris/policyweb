import React from 'react';

const Launchpad = () => {
  return (
    <main>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="absolute inset-0">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-blue-600"></div>
        </div>
        <div className="relative max-w-7xl mx-auto lg:grid lg:grid-cols-5">
          <div className="lg:col-span-3 py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                AI Strategy Launchpad
              </h1>
              <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
                Accelerate your AI journey with a strategic roadmap tailored to your organization's unique needs and goals.
              </p>
              <div className="mt-10 max-w-sm mx-auto lg:mx-0">
                <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-1 sm:gap-5">
                  <a
                    href="#signup"
                    className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50"
                  >
                    Get Started
                    <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 lg:relative">
            <div className="hidden lg:block h-full">
              <img
                className="absolute inset-0 h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                alt="People working on a strategic plan"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Our Approach</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A Strategic Framework for AI Success
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our AI Strategy Launchpad provides a structured approach to help organizations build a robust AI strategy aligned with their business objectives.
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <i className="fas fa-search text-xl"></i>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">1. Assessment & Discovery</h3>
                  <p className="mt-2 text-base text-gray-500">
                    We evaluate your organization's AI readiness across people, processes, data, and technology dimensions. Through stakeholder interviews and data analysis, we identify your unique challenges and opportunities.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <i className="fas fa-bullseye text-xl"></i>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">2. Vision & Alignment</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Through facilitated workshops, we help you articulate an AI vision that aligns with your strategic business goals. This ensures executive buy-in and cross-functional alignment.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <i className="fas fa-map text-xl"></i>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">3. Opportunity Mapping</h3>
                  <p className="mt-2 text-base text-gray-500">
                    We identify high-impact AI use cases through a structured evaluation framework, prioritizing them based on business value, technical feasibility, and implementation complexity.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <i className="fas fa-cogs text-xl"></i>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">4. Implementation Planning</h3>
                  <p className="mt-2 text-base text-gray-500">
                    We develop a practical implementation roadmap with clear milestones, required resources, and governance recommendations to execute your AI strategy effectively.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div id="signup" className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to launch your AI strategy?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Get started with our AI Strategy Launchpad engagement for $3,500.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <a
                href="/generator"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Begin Your AI Strategy Journey
                <i className="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
            <div className="ml-3 inline-flex">
              <a
                href="#"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Launchpad;
