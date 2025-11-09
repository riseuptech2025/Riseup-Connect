import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Lock, 
  User, 
  Palette, 
  HelpCircle, 
  MessageSquare, 
  ArrowRight,
  Bell,
  Eye,
  EyeOff,
  Languages,
  Download,
  Trash2,
  Shield,
  Mail,
  Smartphone,
  Globe,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('general');
  const [profilePrivacy, setProfilePrivacy] = useState('public');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    email: '',
    phone: '',
    language: 'en',
    timezone: 'UTC'
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    postLikes: true,
    comments: true,
    newFollowers: true,
    mentions: true,
    marketingEmails: false,
    soundEnabled: true
  });

  const navigate = useNavigate();

  const handleSave = () => {
    // Handle settings save
    console.log('Settings saved', {
      profilePrivacy,
      theme,
      formData,
      notifications
    });
    // Show success message or handle API call
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const supportOptions = [
    {
      icon: <HelpCircle className="h-5 w-5" />,
      title: 'Help & Support',
      description: 'Get help, browse FAQs, and contact support',
      path: '/help-and-support',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: 'Send Feedback',
      description: 'Share your thoughts and report issues',
      path: '/feedback',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  ];

  const settingsSections = [
    { id: 'general', label: 'General', icon: <User className="h-4 w-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'account', label: 'Account', icon: <Lock className="h-4 w-4" /> }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'zh', name: '中文' }
  ];

  const timezones = [
    'UTC',
    'EST',
    'PST',
    'CET',
    'IST',
    'JST'
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-8"
      >
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Settings
            </h2>
            <nav className="space-y-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {section.icon}
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account settings and preferences
            </p>
          </div>

          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              {/* Profile Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <User className="h-6 w-6 text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Profile Information
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+977 98XXXXXXXX"
                        className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Language & Region */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Languages className="h-6 w-6 text-purple-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Language & Region
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    >
                      {timezones.map(tz => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Palette className="h-6 w-6 text-purple-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Appearance
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full max-w-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                        notifications.soundEnabled
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {notifications.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      <span>Sound Effects</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="h-6 w-6 text-green-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Privacy Settings
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Profile Visibility
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          value="public"
                          checked={profilePrivacy === 'public'}
                          onChange={(e) => setProfilePrivacy(e.target.value)}
                          className="text-blue-500 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">Public Profile</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Anyone can view your profile and posts
                          </p>
                        </div>
                      </label>
                      
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          value="private"
                          checked={profilePrivacy === 'private'}
                          onChange={(e) => setProfilePrivacy(e.target.value)}
                          className="text-blue-500 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">Private Profile</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Only your connections can view your profile and posts
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Data Sharing
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">Allow data for analytics</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Help us improve by sharing usage data
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="rounded text-blue-500 focus:ring-blue-500"
                          defaultChecked
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">Personalized ads</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Show ads based on your interests
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="rounded text-blue-500 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Bell className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Notification Preferences
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Notification Channels
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">Email Notifications</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive notifications via email
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={() => handleNotificationChange('emailNotifications')}
                          className="rounded text-blue-500 focus:ring-blue-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">Push Notifications</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive push notifications on your device
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.pushNotifications}
                          onChange={() => handleNotificationChange('pushNotifications')}
                          className="rounded text-blue-500 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Activity Notifications
                    </h3>
                    <div className="space-y-3">
                      {['postLikes', 'comments', 'newFollowers', 'mentions', 'marketingEmails'].map((key) => (
                        <label key={key} className="flex items-center justify-between cursor-pointer">
                          <span className="text-gray-700 dark:text-gray-300 font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <input
                            type="checkbox"
                            checked={notifications[key]}
                            onChange={() => handleNotificationChange(key)}
                            className="rounded text-blue-500 focus:ring-blue-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Settings */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Lock className="h-6 w-6 text-green-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Change Password
                  </h2>
                </div>
                
                <div className="space-y-4 max-w-md">
                  {[
                    { key: 'current', label: 'Current Password', value: formData.currentPassword },
                    { key: 'new', label: 'New Password', value: formData.newPassword },
                    { key: 'confirm', label: 'Confirm New Password', value: formData.confirmPassword }
                  ].map(({ key, label, value }) => (
                    <div key={key} className="relative">
                      <input
                        type={showPasswords[key] ? 'text' : 'password'}
                        placeholder={label}
                        value={value}
                        onChange={(e) => setFormData(prev => ({ ...prev, [`${key}Password`]: e.target.value }))}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(key)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Download className="h-6 w-6 text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Data Management
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <button className="w-full max-w-md flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">Export Data</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Download a copy of your data
                      </div>
                    </div>
                    <Download className="h-5 w-5 text-gray-400" />
                  </button>
                  
                  <button className="w-full max-w-md flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400">
                    <div className="text-left">
                      <div className="font-medium">Delete Account</div>
                      <div className="text-sm">
                        Permanently delete your account and data
                      </div>
                    </div>
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Help & Support Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <HelpCircle className="h-6 w-6 text-orange-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Help & Support
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supportOptions.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigation(option.path)}
                      className={`${option.bgColor} border border-gray-200 dark:border-gray-600 rounded-xl p-4 text-left hover:shadow-md transition-all cursor-pointer group`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={option.color}>
                            {option.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300">
                              {option.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Save className="h-5 w-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;