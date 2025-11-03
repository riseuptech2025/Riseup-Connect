import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Calendar, Link, Users, Mail, Briefcase, GraduationCap, Heart, FileText, Settings, UserPlus, UserCheck } from 'lucide-react';
import FeedCard from '../components/feed/FeedCard';
import { usersAPI, postsAPI, connectionsAPI } from '../services/api';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?._id;

  useEffect(() => {
    if (currentUser) {
      if (isOwnProfile) {
        setProfileUser(currentUser);
        setIsFollowing(false);
        fetchUserPosts(currentUser._id);
        setLoading(false);
      } else if (userId) {
        fetchUserProfile(userId);
        fetchUserPosts(userId);
      }
    }
  }, [userId, currentUser, isOwnProfile]);

  const fetchUserProfile = async (id) => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching user profile for ID:', id);
      const response = await usersAPI.getProfile(id);
      console.log('User profile response:', response.data);
      
      if (response.data.success) {
        setProfileUser(response.data.data);
        setIsFollowing(response.data.data.followers?.some(follower => follower._id === currentUser?._id) || false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (id) => {
    try {
      console.log('Fetching user posts for ID:', id);
      const response = await usersAPI.getUserPosts(id);
      console.log('User posts response:', response.data);
      
      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setPosts([]);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await usersAPI.followUser(profileUser._id);
      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
        setProfileUser(prev => ({
          ...prev,
          followers: response.data.isFollowing 
            ? [...prev.followers, { _id: currentUser._id, name: currentUser.name, avatar: currentUser.avatar }]
            : prev.followers.filter(f => f._id !== currentUser._id)
        }));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await connectionsAPI.sendRequest(profileUser._id);
      if (response.data.success) {
        alert('Connection request sent successfully!');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const tabs = [
    { id: 'posts', label: 'Posts', icon: FileText, count: posts.length },
    { id: 'about', label: 'About', icon: Users }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <FeedCard key={post._id} post={post} />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isOwnProfile ? 'You haven\'t created any posts yet.' : 'This user hasn\'t posted anything yet.'}
                </p>
              </div>
            )}
          </div>
        );
      
      case 'about':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
              <div className="space-y-3">
                {profileUser?.company && (
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Works at</p>
                      <p className="text-gray-900 dark:text-white">{profileUser.company}</p>
                    </div>
                  </div>
                )}
                {profileUser?.position && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
                      <p className="text-gray-900 dark:text-white">{profileUser.position}</p>
                    </div>
                  </div>
                )}
                {profileUser?.education && (
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Education</p>
                      <p className="text-gray-900 dark:text-white">{profileUser.education}</p>
                    </div>
                  </div>
                )}
                {profileUser?.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                      <p className="text-gray-900 dark:text-white">{profileUser.location}</p>
                    </div>
                  </div>
                )}
                {profileUser?.website && (
                  <div className="flex items-center space-x-3">
                    <Link className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                      <a 
                        href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {profileUser.website}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                    <p className="text-gray-900 dark:text-white">
                      {profileUser?.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Bio */}
            <div className="space-y-6">
              {profileUser?.bio && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bio</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {profileUser.bio}
                  </p>
                </div>
              )}

              {profileUser?.skills && profileUser.skills.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
                <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
                  <div className="w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-800"></div>
                  <div className="pb-4">
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Error loading profile
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          User not found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          The user you're looking for doesn't exist or you don't have permission to view this profile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6"
      >
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {isOwnProfile && (
            <button className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Edit Cover</span>
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center text-white text-4xl font-bold">
                  {profileUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                {isOwnProfile && (
                  <button className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="pb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {profileUser.name}
                </h1>
                {profileUser.position && profileUser.company && (
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {profileUser.position} at {profileUser.company}
                  </p>
                )}
                {profileUser.bio && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-2xl text-sm">
                    {profileUser.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {profileUser.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  {profileUser.website && (
                    <div className="flex items-center space-x-1">
                      <Link className="h-4 w-4" />
                      <a 
                        href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {profileUser.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && (
              <div className="flex space-x-3">
                <button 
                  onClick={handleFollow}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isFollowing
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
                <button 
                  onClick={handleConnect}
                  className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Connect</span>
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex space-x-8 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center cursor-pointer hover:text-blue-500 transition-colors">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser.postsCount || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
            </div>
            <div className="text-center cursor-pointer hover:text-blue-500 transition-colors">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser.connections?.length || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Connections</div>
            </div>
            <div className="text-center cursor-pointer hover:text-blue-500 transition-colors">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser.followers?.length || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
            </div>
            <div className="text-center cursor-pointer hover:text-blue-500 transition-colors">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser.following?.length || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 mb-6">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
};

export default Profile;