import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share, Bookmark, Code, Trash2 } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useAuth } from '../../contexts/AuthContext';

const FeedCard = ({ post, onLike, onComment, onDelete }) => {
  const [isLiked, setIsLiked] = useState(post?.likes?.some(like => like._id === 'current-user') || false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Safe user data access
  const userName = post?.user?.name || 'Unknown User';
  const userAvatar = post?.user?.avatar || post?.user?.name?.charAt(0) || 'U';
  const postContent = post?.content || '';
  const timestamp = post?.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Just now';
  
  const likesCount = post?.likes?.length || 0;
  const commentsCount = post?.comments?.length || 0;
  const isOwnPost = user?._id === post?.user?._id;

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like posts');
      return;
    }
    
    try {
      setIsLiked(!isLiked);
      await onLike(post._id);
    } catch (error) {
      setIsLiked(!isLiked); // Revert on error
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isAuthenticated) {
      alert('Please login to comment on posts');
      return;
    }

    try {
      await onComment(post._id, commentText);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = () => {
    if (!isAuthenticated) {
      alert('Please login to share posts');
      return;
    }
    // TODO: Implement share functionality
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      alert('Please login to bookmark posts');
      return;
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await onDelete(post._id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-4"
    >
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {userAvatar.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {userName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {timestamp}
              </p>
            </div>
          </div>
          
          {isOwnPost && (
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        {postContent && (
          <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
            {postContent}
          </p>
        )}
        
        {post?.codeSnippet && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Code className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Code Snippet
              </span>
            </div>
            <SyntaxHighlighter
              language={post.codeSnippet.language || 'javascript'}
              style={atomOneDark}
              className="rounded-lg text-sm"
              showLineNumbers
            >
              {post.codeSnippet.code || ''}
            </SyntaxHighlighter>
          </div>
        )}

        {post?.image && (
          <img
            src={post.image}
            alt="Post content"
            className="rounded-lg w-full h-auto object-cover mb-4"
          />
        )}
      </div>

      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        {likesCount > 0 && (
          <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
        )}
        {commentsCount > 0 && (
          <span className="ml-4">{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>Like</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Comment</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Share className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>

          <button
            onClick={handleBookmark}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {/* Add Comment */}
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </form>

            {/* Comments List */}
            {post?.comments?.map((comment) => (
              <div key={comment._id || comment.createdAt} className="flex space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {comment.user?.name}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {comment.content}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FeedCard;