import React, { useState } from 'react';
import {
  User,
  Moon,
  Sun,
  Bell,
  Lock,
  Globe,
  Monitor,
  ChevronRight
} from 'react-feather';
import { cn } from '../../lib/utils';

const SettingsSection = ({ title, children }) => (
  <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-heading mb-6">
      {title}
    </h3>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const SettingsRow = ({ icon: Icon, title, description, children }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
        <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-dark-heading">
          {title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
    <div className="flex items-center">
      {children}
    </div>
  </div>
);

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState('system');
  const [notifications, setNotifications] = useState({
    policyUpdates: true,
    securityAlerts: true,
    newsletter: false
  });
  const [language, setLanguage] = useState('en');

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-heading">
        Settings
      </h2>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Settings */}
        <SettingsSection title="Profile">
          <SettingsRow
            icon={User}
            title="Personal Information"
            description="Update your name, email, and profile picture"
          >
            <button
              className={cn(
                "p-2 rounded-lg text-gray-600 dark:text-gray-400",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-colors duration-200"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </SettingsRow>
          <SettingsRow
            icon={Lock}
            title="Password"
            description="Change your password or enable 2FA"
          >
            <button
              className={cn(
                "p-2 rounded-lg text-gray-600 dark:text-gray-400",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-colors duration-200"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </SettingsRow>
        </SettingsSection>

        {/* Appearance Settings */}
        <SettingsSection title="Appearance">
          <SettingsRow
            icon={Monitor}
            title="Theme"
            description="Select your preferred color theme"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode('light')}
                className={cn(
                  "p-2 rounded-lg",
                  darkMode === 'light'
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDarkMode('dark')}
                className={cn(
                  "p-2 rounded-lg",
                  darkMode === 'dark'
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDarkMode('system')}
                className={cn(
                  "p-2 rounded-lg",
                  darkMode === 'system'
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </SettingsRow>
          <SettingsRow
            icon={Globe}
            title="Language"
            description="Choose your preferred language"
          >
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={cn(
                "pl-3 pr-8 py-1.5 rounded-lg appearance-none",
                "bg-white dark:bg-dark-card",
                "border border-gray-200 dark:border-dark-border",
                "focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                "focus:border-indigo-500 dark:focus:border-indigo-400",
                "text-gray-900 dark:text-dark-text"
              )}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </SettingsRow>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection title="Notifications">
          <SettingsRow
            icon={Bell}
            title="Policy Updates"
            description="Get notified when your policies are viewed or need updates"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications.policyUpdates}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  policyUpdates: e.target.checked
                }))}
              />
              <div className={cn(
                "w-11 h-6 rounded-full peer",
                "bg-gray-200 dark:bg-gray-700",
                "peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500",
                "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                "after:bg-white after:rounded-full after:h-5 after:w-5",
                "after:transition-all peer-checked:after:translate-x-full"
              )} />
            </label>
          </SettingsRow>
          <SettingsRow
            icon={Lock}
            title="Security Alerts"
            description="Receive alerts about security updates and suspicious activity"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications.securityAlerts}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  securityAlerts: e.target.checked
                }))}
              />
              <div className={cn(
                "w-11 h-6 rounded-full peer",
                "bg-gray-200 dark:bg-gray-700",
                "peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500",
                "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                "after:bg-white after:rounded-full after:h-5 after:w-5",
                "after:transition-all peer-checked:after:translate-x-full"
              )} />
            </label>
          </SettingsRow>
          <SettingsRow
            icon={Bell}
            title="Newsletter"
            description="Receive our monthly newsletter with policy tips and updates"
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications.newsletter}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  newsletter: e.target.checked
                }))}
              />
              <div className={cn(
                "w-11 h-6 rounded-full peer",
                "bg-gray-200 dark:bg-gray-700",
                "peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500",
                "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                "after:bg-white after:rounded-full after:h-5 after:w-5",
                "after:transition-all peer-checked:after:translate-x-full"
              )} />
            </label>
          </SettingsRow>
        </SettingsSection>
      </div>
    </div>
  );
};

export default SettingsPage;
