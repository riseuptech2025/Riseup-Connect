import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bell, Heart, MessageCircle, UserPlus, Share, Trash2, Check, CheckCheck, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationsAPI } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchNotifications();
    fetchNotificationCount();
  }, []);

  const fetchNotifications = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getNotifications(pageNum);
      
      if (response.data.success) {
        if (pageNum === 1) {
          setNotifications(response.data.data);
        } else {
          setNotifications(prev => [...prev, ...response.data.data]);
        }
        
        setHasMore(pageNum < response.data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await notificationsAPI.getNotificationCount();
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await notificationsAPI.markAsRead(notificationId);
      if (response.data.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationsAPI.markAllAsRead();
      if (response.data.success) {
        // Update all notifications to read
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await notificationsAPI.deleteNotification(notificationId);
      if (response.data.success) {
        // Remove from local state
        setNotifications(prev =>
          prev.filter(notification => notification._id !== notificationId)
        );
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'connection':
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case 'share':
        return <Share className="h-5 w-5 text-orange-500" />;
      case 'mention':
        return <MessageCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notification) => {
    if (notification.message) {
      return notification.message;
    }

    const userName = notification.fromUser?.name || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return `${userName} liked your post`;
      case 'comment':
        return `${userName} commented on your post`;
      case 'follow':
        return `${userName} started following you`;
      case 'connection':
        return `${userName} sent you a connection request`;
      case 'share':
        return `${userName} shared your post`;
      case 'mention':
        return `${userName} mentioned you in a post`;
      default:
        return 'New notification';
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.link) {
      return notification.link;
    }

    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'share':
      case 'mention':
        return notification.post ? `/post/${notification.post._id}` : '/';
      case 'follow':
        return `/profile/${notification.fromUser?._id}`;
      case 'connection':
        return '/connections';
      default:
        return '/';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated with your network activity
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all ${
                notification.isRead
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-l-4 border-l-blue-500 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={getNotificationLink(notification)}
                      className="block hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg -mx-2 px-2 py-1 transition-colors"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {notification.fromUser && (
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {notification.fromUser.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <p className="text-gray-900 dark:text-white text-sm">
                          {getNotificationMessage(notification)}
                        </p>
                      </div>

                      {notification.comment && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 mt-2">
                          "{notification.comment}"
                        </p>
                      )}

                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </Link>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification._id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              When you get notifications, they'll appear here
            </p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && notifications.length > 0 && (
          <div className="text-center pt-4">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {notifications.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notification Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{notifications.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {notifications.filter(n => n.isRead).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{unreadCount}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {notifications.filter(n => n.type === 'like').length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Likes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;