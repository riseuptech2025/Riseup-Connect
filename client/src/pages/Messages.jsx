import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Send, MoreVertical, Phone, Video, Image, Smile, Paperclip, Loader, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { messagesAPI } from '../services/api';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we have a selected conversation from navigation
  useEffect(() => {
    if (location.state?.selectedConversation) {
      handleSelectChat(location.state.selectedConversation);
    }
  }, [location.state]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getConversations();
      if (response.data.success) {
        setConversations(response.data.data || []);
        console.log('Conversations loaded:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      const response = await messagesAPI.getMessages(conversationId);
      if (response.data.success) {
        setMessages(response.data.data || []);
        console.log('Messages loaded:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleSelectChat = (conversation) => {
    setSelectedChat(conversation);
    // On mobile, show chat view
    if (window.innerWidth < 768) {
      setIsMobileChatOpen(true);
    }
  };

  const handleBackToConversations = () => {
    setSelectedChat(null);
    setIsMobileChatOpen(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSending(true);
      
      const tempMessage = {
        _id: Date.now().toString(),
        content: newMessage,
        sender: currentUser._id,
        createdAt: new Date().toISOString(),
        isSending: true
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      const response = await messagesAPI.sendMessage(selectedChat._id, newMessage);
      
      if (response.data.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id ? response.data.data : msg
          )
        );
        console.log('Message sent successfully:', response.data.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!conversation.participants) return false;
    
    const otherParticipant = conversation.participants.find(
      participant => participant._id !== currentUser._id
    );
    
    if (!otherParticipant) return false;
    
    return otherParticipant.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getOtherParticipant = (conversation) => {
    if (!conversation.participants) return null;
    return conversation.participants.find(participant => participant._id !== currentUser._id);
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    const message = conversation.lastMessage;
    return message.sender === currentUser._id ? `You: ${message.content}` : message.content;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Render Conversations List (for mobile and desktop)
  const renderConversationsList = () => (
    <div className={`w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col ${
      isMobileChatOpen ? 'hidden md:flex' : 'flex'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Messages
          </h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading conversations...</span>
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => {
            const otherUser = getOtherParticipant(conversation);
            if (!otherUser) return null;

            return (
              <div
                key={conversation._id}
                onClick={() => handleSelectChat(conversation)}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedChat?._id === conversation._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {otherUser.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 bg-green-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {otherUser.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatTime(conversation.lastMessage?.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {getLastMessagePreview(conversation)}
                    </p>
                  </div>

                  {conversation.unreadCount > 0 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Start a conversation by connecting with other developers'
              }
            </p>
            {!searchTerm && (
              <Link
                to="/connections"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Find connections
              </Link>
            )}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render Chat Area
  const renderChatArea = () => (
    <div className={`flex-1 flex flex-col ${
      isMobileChatOpen ? 'flex' : 'hidden md:flex'
    }`}>
      {selectedChat ? (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Back button for mobile */}
              <button 
                onClick={handleBackToConversations}
                className="md:hidden p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {getOtherParticipant(selectedChat)?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {getOtherParticipant(selectedChat)?.name}
                </h3>
                <p className="text-sm text-green-500 dark:text-green-400">
                  Online
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <Phone className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender === currentUser._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative ${
                      message.sender === currentUser._id
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-600'
                    } ${message.isSending ? 'opacity-70' : ''}`}
                  >
                    <p className="break-words">{message.content}</p>
                    <div className={`flex justify-end mt-1 text-xs ${
                      message.sender === currentUser._id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.createdAt)}
                      {message.isSending && (
                        <span className="ml-1">• Sending</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Send a message to start the conversation
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex space-x-4">
              <div className="flex space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  <Image className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  <Smile className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  rows="1"
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                  disabled={sending}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
            <p>Choose a conversation from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex"
      >
        {/* Conversations List */}
        {renderConversationsList()}

        {/* Chat Area */}
        {renderChatArea()}

        {/* Mobile View - No Chat Selected (only shows when no chat is selected on mobile) */}
        {!isMobileChatOpen && window.innerWidth < 768 && !selectedChat && (
          <div className="flex-1 hidden md:flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Messages;