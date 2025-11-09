import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Search, Send, MoreVertical, Phone, Video, Image, Smile, Paperclip, Menu, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { messagesAPI, connectionsAPI } from '../services/api';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const { user: currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { conversationId } = useParams();

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle URL parameters for mobile deep linking
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv._id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        if (isMobileView) {
          setShowConversationList(false);
        }
      }
    }
  }, [conversationId, conversations, isMobileView]);

  useEffect(() => {
    fetchConversations();
    fetchConnectedUsers();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      // Update URL for mobile deep linking
      if (isMobileView) {
        navigate(`/messages/${selectedConversation._id}`, { replace: true });
      }
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getConversations();
      if (response.data.success) {
        setConversations(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectedUsers = async () => {
    try {
      const response = await connectionsAPI.getConnections();
      if (response.data.success) {
        const { connections } = response.data.data;
        setConnectedUsers(connections || []);
      }
    } catch (error) {
      console.error('Error fetching connected users:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      const response = await messagesAPI.getMessages(conversationId);
      if (response.data.success) {
        setMessages(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageContent = newMessage;
      setNewMessage('');

      // Optimistically add message to UI
      const tempMessage = {
        _id: Date.now().toString(),
        content: messageContent,
        sender: currentUser,
        conversationId: selectedConversation._id,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };

      setMessages(prev => [...prev, tempMessage]);

      // Send to API
      const response = await messagesAPI.sendMessage(
        selectedConversation._id, 
        messageContent
      );

      if (response.data.success) {
        // Replace optimistic message with real one
        setMessages(prev => 
          prev.map(msg => 
            msg.isOptimistic ? response.data.data : msg
          )
        );
        
        // Update conversations list with new last message
        setConversations(prev => 
          prev.map(conv => 
            conv._id === selectedConversation._id 
              ? { ...conv, lastMessage: response.data.data }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.isOptimistic));
      alert('Failed to send message');
    }
  };

  const handleStartConversation = async (user) => {
    try {
      const response = await messagesAPI.createConversation(user._id);
      if (response.data.success) {
        const conversation = response.data.data;
        setSelectedConversation(conversation);
        setConversations(prev => [conversation, ...prev]);
        
        if (isMobileView) {
          setShowConversationList(false);
          navigate(`/messages/${conversation._id}`);
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation');
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    if (isMobileView) {
      setShowConversationList(false);
    }
  };

  const handleBackToConversations = () => {
    setShowConversationList(true);
    setSelectedConversation(null);
    navigate('/messages');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherUser = (conversation) => {
    return conversation.participants.find(p => p._id !== currentUser._id);
  };

  const getLastMessage = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    const message = conversation.lastMessage;
    return message.sender?._id === currentUser._id 
      ? `You: ${message.content}`
      : message.content;
  };

  const filteredConversations = conversations.filter(conversation => {
    const otherUser = getOtherUser(conversation);
    return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredConnectedUsers = connectedUsers.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Render Conversations List
  const renderConversationsList = () => (
    <div className="lg:col-span-1 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
          {isMobileView && (
            <Link 
              to="/connections"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              return (
                <motion.div
                  key={conversation._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?._id === conversation._id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {otherUser?.name || 'Unknown User'}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {getLastMessage(conversation)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Render Chat Area
  const renderChatArea = () => (
    <div className="lg:col-span-2 flex flex-col h-full">
      {selectedConversation ? (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isMobileView && (
                <button 
                  onClick={handleBackToConversations}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {getOtherUser(selectedConversation)?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {getOtherUser(selectedConversation)?.name || 'Unknown User'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getOtherUser(selectedConversation)?.position || 'Developer'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Video className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messagesLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No messages yet. Start a conversation!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender?._id === currentUser._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender?._id === currentUser._id
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender?._id === currentUser._id
                          ? 'text-blue-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Image className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Smile className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*,document/*"
              onChange={(e) => {
                // Handle file upload
                console.log('File selected:', e.target.files[0]);
              }}
            />
          </form>
        </>
      ) : (
        /* Empty State - Show connected users when no conversation is selected */
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Send className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
            Choose a conversation from the list or start a new one with your connections
          </p>
          
          {/* Connected Users Grid */}
          {searchTerm && filteredConnectedUsers.length > 0 && (
            <div className="w-full max-w-2xl">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Start a conversation with:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredConnectedUsers.map((user) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleStartConversation(user)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 dark:text-white truncate">
                        {user.name}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.position}
                      </p>
                    </div>
                    <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                      <Send className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Main render logic
  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-80px)]">
      <div className="h-full bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Desktop View */}
        {!isMobileView && (
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {renderConversationsList()}
            {renderChatArea()}
          </div>
        )}

        {/* Mobile View */}
        {isMobileView && (
          <AnimatePresence mode="wait">
            {showConversationList || !selectedConversation ? (
              <motion.div
                key="conversation-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderConversationsList()}
              </motion.div>
            ) : (
              <motion.div
                key="chat-area"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderChatArea()}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Messages;