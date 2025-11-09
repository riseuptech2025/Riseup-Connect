import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CreatePost from '../components/feed/CreatePost';
import FeedCard from '../components/feed/FeedCard';
import MomentsFeed from '../components/moments/MomentsFeed';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../services/api';

const Home = () => {
  const [activeTab, setActiveTab] = useState('foryou');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const tabs = [
    { id: 'foryou', label: 'For You' },
    { id: 'following', label: 'Following' },
    { id: 'moments', label: 'Moments' }
  ];

  useEffect(() => {
    if (activeTab !== 'moments') {
      fetchPosts();
    }
  }, [activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'foryou') {
        response = await postsAPI.getPosts();
      } else {
        response = await postsAPI.getFollowingPosts();
      }

      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };

  const handleLike = async (postId) => {
    try {
      const response = await postsAPI.likePost(postId);
      if (response.data.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? {
                  ...post,
                  likes: response.data.isLiked 
                    ? [...post.likes, { _id: 'current-user' }]
                    : post.likes.filter(like => like._id !== 'current-user')
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const response = await postsAPI.addComment(postId, content);
      if (response.data.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId ? response.data.data : post
          )
        );
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const renderContent = () => {
    if (activeTab === 'moments') {
      return <MomentsFeed />;
    } else {
      return (
        <>
          {isAuthenticated && <CreatePost onPostCreated={handlePostCreated} />}
          
          <div className="space-y-4 mt-6">
            {loading ? (
              // Posts loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
              ))
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <FeedCard 
                  key={post._id} 
                  post={post} 
                  onLike={handleLike}
                  onComment={handleComment}
                  onDelete={handlePostDeleted}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeTab === 'following' 
                    ? "You're not following anyone yet. Start following developers to see their posts here!"
                    : "There are no posts to show right now. Be the first to post!"
                  }
                </p>
              </div>
            )}
          </div>
        </>
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 mb-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {renderContent()}
    </div>
  );
};

export default Home;