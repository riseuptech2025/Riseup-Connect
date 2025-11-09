import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share, MoreVertical, Play, Pause, Volume2, VolumeX, Clock, X, Image, Video } from 'lucide-react';
import { momentsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MomentCard = ({ moment, onLike, onComment, onShare, isActive }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const videoRef = useRef(null);
  const { user: currentUser } = useAuth();

  // Check if current user has liked this moment
  useEffect(() => {
    if (moment.likes && currentUser) {
      const liked = moment.likes.some(like => 
        like.user?._id === currentUser._id || like.user === currentUser._id
      );
      setIsLiked(liked);
    }
  }, [moment.likes, currentUser]);

  // Handle video play/pause based on active state
  useEffect(() => {
    if (moment.mediaType === 'video' && videoRef.current && !mediaError) {
      if (isActive && isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, isPlaying, moment.mediaType, mediaError]);

  // Check if URL is a blob URL and mark it as error
  useEffect(() => {
    if (moment.media && moment.media.startsWith('blob:')) {
      setMediaError(true);
    } else {
      setMediaError(false);
    }
  }, [moment.media]);

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      const response = await momentsAPI.likeMoment(moment._id);
      if (response.data.success) {
        setIsLiked(response.data.data.isLiked);
        onLike?.(moment._id, response.data.data.isLiked);
      }
    } catch (error) {
      console.error('Error liking moment:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;

    setIsSubmittingComment(true);
    try {
      const response = await momentsAPI.addComment(moment._id, commentText);
      if (response.data.success) {
        setCommentText('');
        onComment?.(moment._id, response.data.data);
        setShowComments(false);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleVideoClick = () => {
    if (moment.mediaType === 'video' && !mediaError) {
      if (isPlaying) {
        videoRef.current?.pause();
      } else {
        videoRef.current?.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleMediaError = () => {
    console.error('Media failed to load:', moment.media);
    setMediaError(true);
  };

  const calculateTimeLeft = () => {
    const expires = new Date(moment.expiresAt);
    const now = new Date();
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Check if moment is expired
  const isExpired = new Date(moment.expiresAt) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-screen bg-black flex items-center justify-center"
    >
      {/* Media Content */}
      <div className="relative w-full h-full max-w-md mx-auto">
        {mediaError || isExpired ? (
          // Error or expired state
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center text-white p-8">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                {isExpired ? (
                  <Clock className="h-10 w-10 text-gray-400" />
                ) : (
                  <X className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isExpired ? 'Moment Expired' : 'Media Unavailable'}
              </h3>
              <p className="text-gray-400">
                {isExpired 
                  ? 'This moment has disappeared after 24 hours.' 
                  : 'This moment is no longer available.'
                }
              </p>
            </div>
          </div>
        ) : moment.mediaType === 'image' ? (
          <img
            src={moment.media}
            alt={moment.caption || 'Moment'}
            className="w-full h-full object-cover"
            onError={handleMediaError}
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={moment.media}
              className="w-full h-full object-cover"
              loop
              muted={isMuted}
              onClick={handleVideoClick}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={handleMediaError}
            />
            
            {/* Video Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <button
                onClick={toggleMute}
                className="p-2 bg-black bg-opacity-50 rounded-full text-white"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              
              {!isPlaying && (
                <button
                  onClick={handleVideoClick}
                  className="p-3 bg-black bg-opacity-50 rounded-full text-white"
                >
                  <Play className="h-6 w-6" />
                </button>
              )}
            </div>
          </>
        )}

        {/* Only show content if media is available and not expired */}
        {!mediaError && !isExpired && (
          <>
            {/* Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent" />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {moment.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold">{moment.user?.name || 'User'}</h3>
                  <p className="text-sm text-gray-300">
                    {calculateTimeLeft()} left
                  </p>
                </div>
              </div>

              {/* Caption */}
              {moment.caption && (
                <p className="text-white mb-4 line-clamp-3">
                  {moment.caption}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <span>{moment.views?.length || 0} views</span>
                <span>{moment.likes?.length || 0} likes</span>
                <span>{moment.comments?.length || 0} comments</span>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons (Right Side) - Only show if media is available */}
        {!mediaError && !isExpired && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className="flex flex-col items-center space-y-1"
            >
              <div className={`p-3 rounded-full transition-colors ${
                isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
              }`}>
                <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-white text-xs font-medium">
                {moment.likes?.length || 0}
              </span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(true)}
              className="flex flex-col items-center space-y-1"
            >
              <div className="p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors">
                <MessageCircle className="h-6 w-6" />
              </div>
              <span className="text-white text-xs font-medium">
                {moment.comments?.length || 0}
              </span>
            </button>

            {/* Share Button */}
            <button className="flex flex-col items-center space-y-1">
              <div className="p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors">
                <Share className="h-6 w-6" />
              </div>
              <span className="text-white text-xs font-medium">Share</span>
            </button>

            {/* More Options */}
            <button className="p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors">
              <MoreVertical className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* 24h Badge - Only show if media is available */}
        {!mediaError && !isExpired && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            24h
          </div>
        )}
      </div>

      {/* Comments Panel */}
      {showComments && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="absolute inset-0 bg-white dark:bg-gray-900 z-10"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comments ({moment.comments?.length || 0})
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {moment.comments?.length > 0 ? (
                moment.comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {comment.user?.name}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {comment.text}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(comment.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? '...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MomentCard;