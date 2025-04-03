import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Menu, X, ExternalLink } from "lucide-react";
import logo from "./image/policylogo.png";
import whiteLogo from "./image/polaicywhite.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'About', href: '/about' },
    { name: 'Managed AI Services', href: '/services', hasDropdown: true },
    { name: 'Consulting', href: '/consulting', hasDropdown: true },
    { name: 'Products', href: '/products', hasDropdown: true },
  ];

  return (
    <header className="fixed w-full z-50 bg-black py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src={whiteLogo} alt="FinePolicy Logo" className="h-20 sm:h-22 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          {/* <div className="hidden lg:flex items-center space-x-10">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="group relative text-lg text-white hover:text-[#7121ef] transition-colors duration-200 font-medium"
            >
              <div className="flex items-center">
                {item.name}
                {item.hasDropdown && (
                  <svg 
                    className="ml-1 h-5 w-5 text-white group-hover:text-[#7121ef] transition-colors duration-200" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                )}
              </div>
            </Link>
          ))}

            <Link
              to="/executive"
              className="flex items-center text-lg text-white hover:text-[#7121ef] transition-colors duration-200 font-medium"
            >
              <span>The AI Executive</span>
              <ExternalLink className="ml-1 h-5 w-5 text-white" />
            </Link>
          </div> */}

          {/* Mobile menu button */}
          {/* <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-white hover:text-[#7121ef] transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div> */}
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{ height: isMenuOpen ? 'auto' : 0 }}
        className="lg:hidden overflow-hidden border-t border-gray-800 mt-4"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="block py-2 text-lg font-medium text-white hover:text-[#7121ef] transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center justify-between">
                {item.name}
                {item.hasDropdown && (
                  <svg
                    className="h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </Link>
          ))}

          <Link
            to="/executive"
            className="block py-2 text-lg font-medium text-white hover:text-[#7121ef] transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center">
              <span>The AI Executive</span>
              <ExternalLink className="ml-1 h-5 w-5 text-white" />
            </div>
          </Link>
        </div>
      </motion.div>
    </header>
  );
};

export default Header; 