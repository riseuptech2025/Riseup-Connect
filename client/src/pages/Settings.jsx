import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Lock, User, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [profilePrivacy, setProfilePrivacy] = useState('public');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = () => {
    // Handle settings save
    console.log('Settings saved');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage your account settings and preferences
        </p>

        {/* Profile Privacy */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Profile Privacy
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={profilePrivacy === 'public'}
                  onChange={(e) => setProfilePrivacy(e.target.value)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Public Profile</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={profilePrivacy === 'private'}
                  onChange={(e) => setProfilePrivacy(e.target.value)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Private Profile</span>
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profilePrivacy === 'public' 
                ? 'Anyone can view your profile and posts'
                : 'Only your connections can view your profile and posts'
              }
            </p>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Theme Settings
            </h2>
          </div>
          
          <div className="space-y-4">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full max-w-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
              <option value="system">System Default</option>
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose how Riseup-Connect looks to you
            </p>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Change Password
            </h2>
          </div>
          
          <div className="space-y-4 max-w-md">
            <input
              type="password"
              placeholder="Current Password"
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

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
      </motion.div>
    </div>
  );
};

export default Settings;