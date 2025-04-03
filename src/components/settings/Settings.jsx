import React, { useState, useEffect } from 'react';
import {
    Bell,
    Moon,
    Sun,
    Globe,
    Shield,
    Mail,
    User,
    Palette,
    Key,
    Languages,
    CreditCard,
    Lock,
    Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabaseClient';

const Settings = ({ userId, organizationId }) => {
    const [activeTab, setActiveTab] = useState('appearance');
    const [darkMode, setDarkMode] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        policyUpdates: true,
        teamInvites: true,
        weeklyDigest: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        company: '',
        role: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    const [apiKeys, setApiKeys] = useState([]);
    const [language, setLanguage] = useState('en');

    // Initialize dark mode on component mount
    useEffect(() => {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(isDarkMode);
        if (isDarkMode) {
            document.documentElement?.classList.add('dark');
        } else {
            document.documentElement?.classList.remove('dark');
        }
    }, []);

    // Profile handlers
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', userId);

            if (error) throw error;
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    // Password change handler
    const handlePasswordChange = async ({ currentPassword, newPassword }) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            toast.success('Password updated successfully');
            setShowPasswordModal(false);
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    // 2FA handlers
    const handle2FASetup = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp'
            });

            if (error) throw error;
            // Show QR code from data.qr_code
            setShow2FAModal(true);
        } catch (error) {
            console.error('Error setting up 2FA:', error);
            toast.error('Failed to setup 2FA');
        } finally {
            setIsLoading(false);
        }
    };

    // API key handlers
    const generateApiKey = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('api_keys')
                .insert([
                    { user_id: userId, name: 'API Key ' + (apiKeys.length + 1) }
                ])
                .select();

            if (error) throw error;
            setApiKeys([...apiKeys, data[0]]);
            toast.success('API key generated successfully');
        } catch (error) {
            console.error('Error generating API key:', error);
            toast.error('Failed to generate API key');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle dark mode changes
    const handleDarkModeToggle = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', String(newDarkMode));

        // Safely toggle dark mode class
        if (document.documentElement) {
            if (newDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        toast.success(`${newDarkMode ? 'Dark' : 'Light'} mode enabled`);
    };

    const handleNotificationChange = (key) => {
        setNotificationSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        toast.success('Notification settings updated');
    };

    const tabs = [
        {
            id: 'profile',
            label: 'Profile',
            icon: User,
            content: (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#E2DDFF]">Profile Settings</h3>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-[#B4A5FF] mb-2">Full Name</label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF]"
                            />
                        </div>
                        <div>
                            <label className="block text-[#B4A5FF] mb-2">Email</label>
                            <input
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                className="w-full px-4 py-2 bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF]"
                            />
                        </div>
                        <div>
                            <label className="block text-[#B4A5FF] mb-2">Company</label>
                            <input
                                type="text"
                                value={profileData.company}
                                onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                                className="w-full px-4 py-2 bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            )
        },
        {
            id: 'appearance',
            label: 'Appearance',
            icon: Palette,
            content: (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#E2DDFF]">Theme Settings</h3>
                    <div className="flex items-center justify-between p-4 bg-[#2E1D4C]/30 rounded-lg">
                        <div className="flex items-center gap-3">
                            {darkMode ? <Moon className="w-5 h-5 text-[#B4A5FF]" /> : <Sun className="w-5 h-5 text-[#B4A5FF]" />}
                            <div>
                                <p className="text-[#E2DDFF] font-medium">Dark Mode</p>
                                <p className="text-[#B4A5FF] text-sm">Toggle dark mode theme</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDarkModeToggle}
                            className={cn(
                                "w-12 h-6 rounded-full transition-colors relative",
                                darkMode ? "bg-[#B4A5FF]" : "bg-[#2E1D4C]"
                            )}
                        >
                            <div className={cn(
                                "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                                darkMode ? "translate-x-6" : "translate-x-0.5"
                            )} />
                        </button>
                    </div>
                </div>
            )
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            content: (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#E2DDFF]">Notification Preferences</h3>
                    <div className="space-y-4">
                        {Object.entries(notificationSettings).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-[#2E1D4C]/30 rounded-lg">
                                <div>
                                    <p className="text-[#E2DDFF] font-medium">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </p>
                                    <p className="text-[#B4A5FF] text-sm">
                                        Receive notifications for {key.toLowerCase().replace(/([A-Z])/g, ' $1')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleNotificationChange(key)}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-colors relative",
                                        value ? "bg-[#B4A5FF]" : "bg-[#2E1D4C]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                                        value ? "translate-x-6" : "translate-x-0.5"
                                    )} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'security',
            label: 'Security',
            icon: Shield,
            content: (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#E2DDFF]">Security Settings</h3>
                    <div className="space-y-4">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full flex items-center justify-between p-4 bg-[#2E1D4C]/30 rounded-lg text-left hover:bg-[#2E1D4C]/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-[#B4A5FF]" />
                                <div>
                                    <p className="text-[#E2DDFF] font-medium">Change Password</p>
                                    <p className="text-[#B4A5FF] text-sm">Update your account password</p>
                                </div>
                            </div>
                            <Shield className="w-5 h-5 text-[#B4A5FF]" />
                        </button>
                        <button
                            onClick={handle2FASetup}
                            className="w-full flex items-center justify-between p-4 bg-[#2E1D4C]/30 rounded-lg text-left hover:bg-[#2E1D4C]/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-[#B4A5FF]" />
                                <div>
                                    <p className="text-[#E2DDFF] font-medium">Two-Factor Authentication</p>
                                    <p className="text-[#B4A5FF] text-sm">Add an extra layer of security</p>
                                </div>
                            </div>
                            <Shield className="w-5 h-5 text-[#B4A5FF]" />
                        </button>
                    </div>
                </div>
            )
        },
        {
            id: 'api',
            label: 'API Keys',
            icon: Key,
            content: (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#E2DDFF]">API Keys</h3>
                    <div className="space-y-4">
                        <button
                            onClick={generateApiKey}
                            disabled={isLoading}
                            className="px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors disabled:opacity-50"
                        >
                            Generate New API Key
                        </button>
                        <div className="space-y-4">
                            {apiKeys.map((key) => (
                                <div key={key.id} className="p-4 bg-[#2E1D4C]/30 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[#E2DDFF] font-medium">{key.name}</p>
                                        <button
                                            onClick={() => {/* Handle revoke */ }}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                    <p className="text-[#B4A5FF] text-sm mt-2">{key.key}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'language',
            label: 'Language',
            icon: Languages,
            content: (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#E2DDFF]">Language Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-[#B4A5FF]" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="px-4 py-2 bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF]"
                            >
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                                <option value="it">Italiano</option>
                                <option value="pt">Português</option>
                            </select>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="bg-[#13091F] min-h-screen">
            <div className="max-w-4xl mx-auto p-6">
                <h2 className="text-2xl font-bold text-[#E2DDFF] mb-8">Settings</h2>

                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="w-64 shrink-0">
                        <div className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                        activeTab === tab.id
                                            ? "bg-[#2E1D4C] text-[#E2DDFF]"
                                            : "text-[#B4A5FF] hover:bg-[#2E1D4C]/50"
                                    )}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-[#13091F]/50 rounded-xl p-6 border border-[#2E1D4C]/30">
                        {tabs.find(tab => tab.id === activeTab)?.content}
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#13091F] rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-[#E2DDFF] mb-4">Change Password</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            handlePasswordChange({
                                currentPassword: formData.get('currentPassword'),
                                newPassword: formData.get('newPassword')
                            });
                        }} className="space-y-4">
                            <div>
                                <label className="block text-[#B4A5FF] mb-2">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    required
                                    className="w-full px-4 py-2 bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF]"
                                />
                            </div>
                            <div>
                                <label className="block text-[#B4A5FF] mb-2">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    required
                                    className="w-full px-4 py-2 bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF]"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2FA Setup Modal */}
            {show2FAModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#13091F] rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-[#E2DDFF] mb-4">Set Up Two-Factor Authentication</h3>
                        {/* Add QR code display and verification code input here */}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => setShow2FAModal(false)}
                                className="px-4 py-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {/* Handle 2FA verification */ }}
                                className="px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings; 