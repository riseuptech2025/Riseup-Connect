import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, UserPlus, Users, UserCheck, MapPin, Briefcase, Mail, Loader, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { connectionsAPI, usersAPI, messagesAPI } from '../services/api';

const Connections = () => {
  const [activeTab, setActiveTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: 'connections', label: 'Connections', count: connections.length, icon: UserCheck },
    { id: 'followers', label: 'Followers', count: followers.length, icon: Users },
    { id: 'following', label: 'Following', count: following.length, icon: Users },
    { id: 'suggestions', label: 'Suggestions', count: suggestions.length, icon: UserPlus },
    { id: 'pending', label: 'Pending', count: pendingRequests.length, icon: Clock }
  ];

  useEffect(() => {
    fetchConnectionsData();
  }, []);

  const fetchConnectionsData = async () => {
    try {
      setLoading(true);
      
      // Fetch connections data
      const connectionsResponse = await connectionsAPI.getConnections();
      if (connectionsResponse.data.success) {
        const { connections: conns, followers: folls, following: folling, pendingRequests: pending } = connectionsResponse.data.data;
        setConnections(conns || []);
        setFollowers(folls || []);
        setFollowing(folling || []);
        setPendingRequests(pending || []);
      }

      // Fetch suggestions
      const suggestionsResponse = await connectionsAPI.getSuggestions();
      if (suggestionsResponse.data.success) {
        setSuggestions(suggestionsResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching connections data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const response = await usersAPI.followUser(userId);
      if (response.data.success) {
        // Update the user in suggestions
        setSuggestions(prev => prev.filter(user => user._id !== userId));
        
        // Add to following list
        const userToAdd = suggestions.find(user => user._id === userId);
        if (userToAdd) {
          setFollowing(prev => [...prev, userToAdd]);
        }
        
        // Refresh data to get updated counts
        fetchConnectionsData();
      }
    } catch (error) {
      console.error('Error following user:', error);
      alert(error.response?.data?.message || 'Failed to follow user');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const response = await usersAPI.followUser(userId);
      if (response.data.success) {
        // Remove from following list
        setFollowing(prev => prev.filter(user => user._id !== userId));
        
        // Refresh data
        fetchConnectionsData();
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert(error.response?.data?.message || 'Failed to unfollow user');
    }
  };

  const handleConnect = async (userId) => {
    try {
      console.log('Sending connection request to:', userId);
      const response = await connectionsAPI.sendRequest(userId);
      console.log('Connection request response:', response.data);
      
      if (response.data.success) {
        alert('Connection request sent successfully!');
        // Remove from suggestions and refresh data
        setSuggestions(prev => prev.filter(user => user._id !== userId));
        fetchConnectionsData();
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send connection request';
      alert(errorMessage);
    }
  };

  const handleAcceptRequest = async (connectionId) => {
    try {
      const response = await connectionsAPI.acceptRequest(connectionId);
      if (response.data.success) {
        alert('Connection request accepted!');
        // Remove from pending requests and refresh data
        setPendingRequests(prev => prev.filter(req => req._id !== connectionId));
        fetchConnectionsData();
      }
    } catch (error) {
      console.error('Error accepting connection request:', error);
      alert(error.response?.data?.message || 'Failed to accept connection request');
    }
  };

  const handleMessage = async (userId) => {
  try {
    console.log('Starting conversation with user:', userId);
    
    // Try to create conversation
    const response = await messagesAPI.createConversation(userId);
    
    if (response.data.success) {
      const conversation = response.data.data;
      console.log('Conversation created successfully:', conversation);
      
      // Navigate to messages page with the conversation
      navigate('/messages', { 
        state: { 
          selectedConversation: conversation
        } 
      });
    }
  } catch (error) {
    console.error('Error starting conversation:', error);
    
    // Even if there's an error, navigate to messages page
    // The conversation might have been created but we got an error response
    navigate('/messages');
    
    // Show user-friendly message
    const errorMessage = error.response?.data?.message || 'Redirecting to messages...';
    console.log(errorMessage);
    
    // Don't show alert for 500 errors to avoid annoying users
    if (error.response?.status !== 500) {
      alert(errorMessage);
    }
  }
};

  const renderUserCard = (user, options = {}) => {
    const {
      showMutual = true,
      showFollowButton = false,
      isFollowing = false,
      showConnectButton = true,
      showAcceptButton = false,
      connectionId = null
    } = options;

    return (
      <motion.div
        key={user._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Link to={`/profile/${user._id}`} className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>
            
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${user._id}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-500 transition-colors">
                  {user.name}
                </h3>
              </Link>
              {user.position && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{user.position}</p>
              )}
              {user.company && (
                <p className="text-gray-500 dark:text-gray-500 text-sm">{user.company}</p>
              )}
              
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {showMutual && user.followers && user.followers.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{user.followers.length} followers</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {showAcceptButton ? (
              <button 
                onClick={() => handleAcceptRequest(connectionId)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-sm"
              >
                <UserCheck className="h-4 w-4" />
                <span>Accept</span>
              </button>
            ) : showFollowButton ? (
              isFollowing ? (
                <button 
                  onClick={() => handleUnfollow(user._id)}
                  className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Following</span>
                </button>
              ) : (
                <button 
                  onClick={() => handleFollow(user._id)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Follow</span>
                </button>
              )
            ) : showConnectButton && (
              <button 
                onClick={() => handleConnect(user._id)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-sm"
              >
                <UserPlus className="h-4 w-4" />
                <span>Connect</span>
              </button>
            )}
            
            <button 
              onClick={() => handleMessage(user._id)}
              className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              <Mail className="h-4 w-4" />
              <span>Message</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const filteredConnections = connections.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFollowers = followers.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFollowing = following.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuggestions = suggestions.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPendingRequests = pendingRequests.filter(request =>
    request.fromUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.fromUser?.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.fromUser?.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading connections...</span>
        </div>
      );
    }

    let usersToRender = [];
    let emptyMessage = '';
    let renderOptions = {};

    switch (activeTab) {
      case 'connections':
        usersToRender = filteredConnections;
        emptyMessage = 'You haven\'t connected with anyone yet. Start building your network!';
        renderOptions = { showConnectButton: false };
        break;
      case 'followers':
        usersToRender = filteredFollowers;
        emptyMessage = 'You don\'t have any followers yet. Start posting and engaging with the community!';
        renderOptions = { showFollowButton: true, isFollowing: false };
        break;
      case 'following':
        usersToRender = filteredFollowing;
        emptyMessage = 'You\'re not following anyone yet. Discover amazing developers to follow!';
        renderOptions = { showFollowButton: true, isFollowing: true };
        break;
      case 'suggestions':
        usersToRender = filteredSuggestions;
        emptyMessage = 'No suggestions available right now. Check back later for new connections!';
        renderOptions = { showFollowButton: true, isFollowing: false, showConnectButton: true };
        break;
      case 'pending':
        usersToRender = filteredPendingRequests.map(req => ({ ...req.fromUser, connectionId: req._id }));
        emptyMessage = 'No pending connection requests.';
        renderOptions = { showAcceptButton: true, showConnectButton: false, showFollowButton: false };
        break;
      default:
        usersToRender = [];
    }

    if (usersToRender.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No results found' : 'Nothing here yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {searchTerm ? 'Try adjusting your search terms' : emptyMessage}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear search
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {usersToRender.map((user) => 
          renderUserCard(user, {
            ...renderOptions,
            connectionId: user.connectionId
          })
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Network
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your connections and discover new professionals
        </p>
      </motion.div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name, position, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 mb-6">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
                <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs min-w-6">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        {renderContent()}
      </motion.div>

      {/* Stats Summary */}
      {!loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Network Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{connections.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{followers.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{following.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{suggestions.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Suggestions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;