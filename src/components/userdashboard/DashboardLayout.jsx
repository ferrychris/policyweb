import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  Sun, Moon, Home, Package, User, CreditCard, FileText,
  LogOut, Menu, X, Bell, Settings, BarChart, Star,
  Activity, Globe, Users, ChevronRight, ChevronLeft
} from 'lucide-react';
import { getUserSubscription, getCurrentUser } from '../../lib/userService';
import { getPackagesFromDatabase } from '../../lib/policySettings';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { toast } from 'sonner';
import logo from '../landing/image/policylogo.png';
import { cn } from '../../lib/utils';
import TeamManagement from '../teams/TeamManagement';
import whiteLogo from '../landing/image/polaicywhite.png';

const DashboardLayout = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [pricingPackages, setPricingPackages] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTeamSidebar, setShowTeamSidebar] = useState(false);

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
      label: 'All Policies',
      path: '/dashboard/policies'
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: 'Policy Templates',
      path: '/dashboard/templates'
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: 'Policy Activity',
      path: '/dashboard/activity'
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Team Management',
      onClick: () => setShowTeamSidebar(true),
      special: true
    },
    {
      icon: <Globe className="w-5 h-5" />,
      label: 'Platforms',
      path: '/dashboard/platforms'
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      path: '/dashboard/settings'
    }
  ];

  const user = getCurrentUser();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A0B2E]">
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#13091F] transform transition-transform duration-200 ease-in-out border-r border-[#2E1D4C]/30",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-[#2E1D4C]/30">
            <Link to="/dashboard" className="flex items-center">
              <img src={whiteLogo} alt="FinePolicy Logo" className="h-14 sm:h-16 w-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {menuItems.map((item) => (
              item.special ? (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={cn(
                    "w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150",
                    "text-[#B4A5FF] hover:bg-[#2E1D4C]/50"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150",
                    location.pathname === item.path
                      ? "bg-[#2E1D4C] text-[#E2DDFF]"
                      : "text-[#B4A5FF] hover:bg-[#2E1D4C]/50"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              )
            ))}
          </nav>

          {/* User Profile */}
          <div className="px-4 py-4 border-t border-[#2E1D4C]/30">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2E1D4C] text-[#E2DDFF]">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-[#E2DDFF]">{user?.name || 'User'}</p>
                <p className="text-xs text-[#B4A5FF]">Marketing Director</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Management Sidebar */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 w-80 bg-[#13091F] transform transition-transform duration-200 ease-in-out border-l border-[#2E1D4C]/30",
        showTeamSidebar ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="absolute -left-10 top-1/2 -translate-y-1/2">
          <button
            onClick={() => setShowTeamSidebar(!showTeamSidebar)}
            className="flex items-center justify-center w-10 h-20 bg-[#13091F] border-l border-t border-b border-[#2E1D4C] rounded-l-lg text-[#E2DDFF] hover:text-[#B4A5FF] transition-colors"
          >
            {showTeamSidebar ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
          </button>
        </div>
        <div className="h-full overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#E2DDFF]">Team Management</h2>
            <button
              onClick={() => setShowTeamSidebar(false)}
              className="p-2 rounded-lg hover:bg-[#2E1D4C]/50 text-[#B4A5FF]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <TeamManagement
            userId={user?.id}
            organizationId={user?.organizationId}
            onClose={() => setShowTeamSidebar(false)}
          />
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "lg:pl-64 transition-all duration-200",
        showTeamSidebar ? "lg:pr-80" : ""
      )}>
        {/* Header */}
        <header className="bg-[#13091F] sticky top-0 z-10 border-b border-[#2E1D4C]/30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-[#B4A5FF] hover:bg-[#2E1D4C]/50 lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:flex ml-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 px-4 py-2 text-sm text-[#E2DDFF] bg-[#2E1D4C]/30 rounded-lg border border-[#2E1D4C]/50 focus:outline-none focus:border-[#B4A5FF]/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-[#B4A5FF] hover:bg-[#2E1D4C]/50 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#B4A5FF] text-[#13091F] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-[#B4A5FF] hover:bg-[#2E1D4C]/50"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Export Data Button */}
              <button className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-[#E2DDFF] bg-[#2E1D4C] rounded-lg hover:bg-[#2E1D4C]/80 transition-colors">
                <span>Export Data</span>
              </button>
              
              {/* Logout Button - More prominent */}
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 text-sm font-medium text-[#E2DDFF] bg-[#B4A5FF]/20 rounded-lg hover:bg-[#B4A5FF]/30 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-4 top-16 mt-2 w-80 bg-[#13091F] rounded-lg shadow-lg z-50 border border-[#2E1D4C]/30">
          <div className="p-4 border-b border-[#2E1D4C]/30 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#E2DDFF]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-[#B4A5FF] hover:text-[#E2DDFF]"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-[#B4A5FF]">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b border-[#2E1D4C]/30 hover:bg-[#2E1D4C]/20"
                >
                  <p className="text-[#E2DDFF]">{notification.message}</p>
                  <p className="text-xs text-[#B4A5FF] mt-1">{notification.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
