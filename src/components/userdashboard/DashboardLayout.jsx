import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Sun, Moon, Home, Package, User, CreditCard, FileText, LogOut, Menu, X } from 'lucide-react';
import { getUserSubscription, getCurrentUser } from '../../lib/userService';
import { getPackagesFromDatabase } from '../../lib/policySettings';
import logo from '../landing/image/policylogo.png';
import { cn } from '../../lib/utils';

const DashboardLayout = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [pricingPackages, setPricingPackages] = useState([]);
  const location = useLocation();

  useEffect(() => {
    // Toggle dark mode class on the document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save dark mode preference to localStorage
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Fetch user subscription
    const fetchSubscription = async () => {
      try {
        const userSubscription = getUserSubscription();
        setSubscription(userSubscription);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    fetchSubscription();
  }, []);

  useEffect(() => {
    // Fetch pricing packages
    const fetchPackages = async () => {
      try {
        const packages = getPackagesFromDatabase();
        setPricingPackages(packages);
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    // Close sidebar on mobile when location changes
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: 'Dashboard',
      path: '/dashboard',
      exact: true
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Policies',
      path: '/dashboard/policies'
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'New Policy',
      path: '/dashboard/new-policy'
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: 'Packages',
      path: '/dashboard/packages'
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: 'Subscription',
      path: '/dashboard/subscription'
    },
    {
      icon: <User className="w-5 h-5" />,
      label: 'Profile',
      path: '/dashboard/profile'
    }
  ];

  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-10 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/dashboard" className="flex items-center">
              <img src={logo} alt="FinePolicy Logo" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  location.pathname === item.path
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{user?.email || 'user@example.com'}</p>
            </div>

            <button
              onClick={toggleDarkMode}
              className="flex items-center w-full px-2 py-3 mt-2 rounded-lg text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              <span className="ml-3 font-medium">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            <Link
              to="/login"
              className="flex items-center w-full px-2 py-3 mt-2 rounded-lg text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3 font-medium">Log Out</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-white hover:text-white dark:hover:text-white lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="ml-auto flex items-center">
              {subscription && (
                <div className="mr-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${subscription.packageKey === 'premium'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                    : subscription.packageKey === 'professional'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                    {subscription.packageKey.charAt(0).toUpperCase() + subscription.packageKey.slice(1)}
                  </span>
                </div>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-white hover:text-white dark:hover:text-white"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
