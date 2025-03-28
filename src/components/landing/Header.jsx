import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, themeClasses } from '../../lib/utils';
import { Menu, X } from 'lucide-react';
import logo from './image/policylogo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="fixed w-full z-50 bg-navy-900/80 backdrop-blur-lg border-b border-navy-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="FinePolicy Logo" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    "text-blue-300 hover:text-white",
                    "hover:bg-navy-800/50",
                    "transition-colors duration-200"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium",
                  "text-white hover:text-white",
                  "hover:bg-navy-800/50",
                  "transition-colors duration-200"
                )}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium",
                  "bg-gradient-to-r from-cyan-500 to-blue-500",
                  "text-white hover:from-cyan-600 hover:to-blue-600",
                  "transition-all duration-200"
                )}
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "p-2 rounded-md",
                "text-blue-300 hover:text-white",
                "hover:bg-navy-800/50",
                "transition-colors duration-200"
              )}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{ height: isMenuOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "block px-3 py-2 rounded-md text-base font-medium",
                "text-blue-300 hover:text-white",
                "hover:bg-navy-800/50",
                "transition-colors duration-200"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 pb-3 border-t border-navy-700">
            <div className="space-y-1">
              <Link
                to="/login"
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  "text-white hover:text-white",
                  "hover:bg-navy-800/50",
                  "transition-colors duration-200"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  "bg-gradient-to-r from-cyan-500 to-blue-500",
                  "text-white hover:from-cyan-600 hover:to-blue-600",
                  "transition-all duration-200"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  );
};

export default Header; 