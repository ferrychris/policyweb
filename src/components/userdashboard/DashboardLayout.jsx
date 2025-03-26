import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Sun, Moon, Home, Package, User, CreditCard, FileText, LogOut, Menu, X } from 'lucide-react';
import { getUserSubscription, getCurrentUser } from '../../lib/userService';
import { getPackagesFromDatabase } from '../../lib/policySettings';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-10 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md flex items-center justify-center text-white font-bold">
                FP
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">FinePolicy</span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none lg:hidden"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${(item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path))
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
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
              className="flex items-center w-full px-2 py-3 mt-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
              className="flex items-center w-full px-2 py-3 mt-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3 font-medium">Log Out</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="ml-auto flex items-center">
              {subscription && (
                <div className="mr-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${subscription.packageKey === 'premium'
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
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
