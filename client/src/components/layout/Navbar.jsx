import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  MessageCircle, 
  User, 
  Home, 
  Users, 
  HelpCircle, 
  LogOut, 
  Settings, 
  Heart,
  FileText,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { messagesAPI, notificationsAPI } from '../../services/api';
import logo from '../../assets/logo.svg';

const Navbar = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
        setIsMessagesOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch conversations only (removed notifications fetch)
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      if (response.data.success) {
        setConversations(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = () => {
    // Navigate to notifications page and close dropdown
    navigate('/notifications');
    setIsNotificationsOpen(false);
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation.participants) return null;
    return conversation.participants.find(participant => 
      participant._id !== user?._id
    );
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    const message = conversation.lastMessage;
    return message.sender === user?._id ? `You: ${message.content}` : message.content;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/stories', label: 'Stories', icon: FileText },
    { path: '/connections', label: 'Connections', icon: Users },
    { path: '/questions', label: 'Questions', icon: HelpCircle },
  ];

  const mobileNavItems = [
    { path: '/', label: 'Home', icon: Home },
    // { path: '/stories', label: 'Stories', icon: FileText },
    { path: '/connections', label: 'Connections', icon: Users },
    { path: '/questions', label: 'Questions', icon: HelpCircle },
    { type: 'notification', label: 'Notifications', icon: Bell },
    { type: 'messages', label: 'Messages', icon: MessageCircle },
    { type: 'profile', label: 'Profile', icon: User },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleMobileNavClick = (item) => {
    if (item.type === 'notification') {
      // Navigate to notifications page for mobile
      navigate('/notifications');
    } else if (item.type === 'messages') {
      setIsMessagesOpen(true);
    } else if (item.type === 'profile') {
      setIsProfileOpen(true);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:block bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo & Search */}
          <div className="flex items-center space-x-6 flex-1">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logo.svg" 
                alt="Riseup-Connect Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback if logo.svg doesn't exist in public folder
                  console.error('Logo not found in public folder, using fallback');
                  e.target.style.display = 'none';
                  // You can add a fallback element here if needed
                }}
              />
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search Riseup-Connect..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Center Section - Navigation Links */}
          <div className="flex items-center justify-center flex-1 mx-6">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-center p-3 rounded-lg transition-all ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-1" ref={dropdownRef}>
            {/* Notifications - Now redirects to notifications page */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                title="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {/* You can still show notification count if you fetch it from API */}
                {/* {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )} */}
              </button>
            </div>

            {/* Messages Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsMessagesOpen(!isMessagesOpen);
                  setIsNotificationsOpen(false);
                  setIsProfileOpen(false);
                }}
                className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                title="Messages"
              >
                <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {conversations.filter(conv => conv.unreadCount > 0).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {conversations.filter(conv => conv.unreadCount > 0).length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isMessagesOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Messages
                        </h3>
                        <Link 
                          to="/messages" 
                          className="text-sm text-blue-500 hover:text-blue-600"
                          onClick={() => setIsMessagesOpen(false)}
                        >
                          See all
                        </Link>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {conversations.length > 0 ? (
                          conversations.slice(0, 5).map((conversation) => {
                            const otherUser = getOtherParticipant(conversation);
                            if (!otherUser) return null;

                            return (
                              <div
                                key={conversation._id}
                                onClick={() => {
                                  navigate('/messages', { 
                                    state: { selectedConversation: conversation } 
                                  });
                                  setIsMessagesOpen(false);
                                }}
                                className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {getUserInitials(otherUser.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {otherUser.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {getLastMessagePreview(conversation)}
                                  </p>
                                </div>
                                {conversation.unreadCount > 0 && (
                                  <div className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {conversation.unreadCount}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4">
                            <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              No messages yet
                            </p>
                            <Link 
                              to="/connections" 
                              className="text-blue-500 hover:text-blue-600 text-sm"
                              onClick={() => setIsMessagesOpen(false)}
                            >
                              Find connections
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                  setIsMessagesOpen(false);
                }}
                className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Profile"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  {getUserInitials(user?.name)}
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <div className="p-2">
                      {/* User Info */}
                      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {user?.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="space-y-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                        
                        <Link
                          to="/settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                        
                        <Link
                          to="/help"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <HelpCircle className="h-4 w-4" />
                          <span>Help & Support</span>
                        </Link>
                        
                        <Link
                          to="/feedback"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                          <span>Give Feedback</span>
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        {/* Upper Mobile Navbar - App Name & Search (Same Line) */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {/* App Name with Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <img 
                src="/logo.svg" 
                alt="Riseup-Connect Logo" 
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  console.error('Logo not found in public folder, using fallback');
                  e.target.style.display = 'none';
                }}
              />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Riseup-Connect
              </span>
            </Link>

            {/* Search Bar (inline with app name) */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Lower Mobile Navbar - Navigation Icons */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            {mobileNavItems.map((item, index) => {
              const Icon = item.icon;
              const active = item.path ? isActive(item.path) : false;
              
              if (item.type) {
                // Special items (notifications, messages, profile)
                return (
                  <div key={item.type} className="relative">
                    <button
                      onClick={() => handleMobileNavClick(item)}
                      className={`flex items-center justify-center p-3 rounded-lg transition-all ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      title={item.label}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                    {/* Notification badge removed since we're redirecting to notifications page */}
                    {/* You can add it back if you fetch notification count from API */}
                  </div>
                );
              }

              // Regular navigation items
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-center p-3 rounded-lg transition-all ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Dropdowns - Removed notifications dropdown since we're redirecting to page */}
      <AnimatePresence>
        {isMessagesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-sm max-h-96 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Messages
                  </h3>
                  <button
                    onClick={() => setIsMessagesOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {conversations.length > 0 ? (
                    conversations.slice(0, 5).map((conversation) => {
                      const otherUser = getOtherParticipant(conversation);
                      if (!otherUser) return null;

                      return (
                        <div
                          key={conversation._id}
                          onClick={() => {
                            navigate('/messages', { 
                              state: { selectedConversation: conversation } 
                            });
                            setIsMessagesOpen(false);
                          }}
                          className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {getUserInitials(otherUser.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {otherUser.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {getLastMessagePreview(conversation)}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4">
                      <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No messages yet
                      </p>
                      <Link 
                        to="/connections" 
                        className="text-blue-500 hover:text-blue-600 text-sm"
                        onClick={() => setIsMessagesOpen(false)}
                      >
                        Find connections
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isProfileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-sm overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Profile
                  </h3>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* User Info */}
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  
                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  
                  <Link
                    to="/help"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Help & Support</span>
                  </Link>
                  
                  <Link
                    to="/feedback"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Give Feedback</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;