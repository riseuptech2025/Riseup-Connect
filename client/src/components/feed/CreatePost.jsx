import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Image, Code, Smile, Send, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { postsAPI } from '../../services/api';

const CreatePost = ({ onPostCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [codeSnippet, setCodeSnippet] = useState({ language: 'javascript', code: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setImage(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !codeSnippet.code.trim() && !image) {
      setError('Please add some content to your post');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // For now, let's test without image first to isolate the issue
      const postData = {
        content: content.trim(),
        isPublic: true
      };

      // Add code snippet if it's a code post
      if (postType === 'code' && codeSnippet.code.trim()) {
        postData.codeSnippet = codeSnippet;
      }

      console.log('🔄 Sending post data:', postData);

      // Test with simple JSON first (no image)
      const response = await postsAPI.createPost(postData);
      
      console.log('✅ Post created successfully:', response.data);

      if (response.data.success) {
        onPostCreated(response.data.data);
        // Reset form
        setContent('');
        setCodeSnippet({ language: 'javascript', code: '' });
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setIsOpen(false);
        setError('');
      }
    } catch (error) {
      console.error('❌ Error creating post:', error);
      
      // Detailed error logging
      if (error.response) {
        // Server responded with error status
        console.error('📊 Server response:', error.response.status);
        console.error('📄 Response data:', error.response.data);
        console.error('🔧 Response headers:', error.response.headers);
        
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error ||
                            `Server error: ${error.response.status}`;
        setError(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        console.error('🚫 No response received:', error.request);
        setError('No response from server. Please check your connection.');
      } else {
        // Something else happened
        console.error('⚙️ Request setup error:', error.message);
        setError('Failed to create post: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Simple version without image upload for testing
  const handleSubmitSimple = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !codeSnippet.code.trim()) {
      setError('Please add some content to your post');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const postData = {
        content: content.trim(),
        isPublic: true
      };

      if (postType === 'code' && codeSnippet.code.trim()) {
        postData.codeSnippet = codeSnippet;
      }

      console.log('🔄 Testing simple post creation:', postData);

      const response = await postsAPI.createPost(postData);
      
      console.log('✅ Simple post successful:', response.data);

      if (response.data.success) {
        onPostCreated(response.data.data);
        setContent('');
        setCodeSnippet({ language: 'javascript', code: '' });
        setIsOpen(false);
        setError('');
      }
    } catch (error) {
      console.error('❌ Simple post failed:', error);
      
      if (error.response) {
        console.error('📊 Error details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        setError(`Server error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`);
      } else {
        setError('Network error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 text-gray-500 dark:text-gray-400">
            What's on your mind, {user?.name?.split(' ')[0]}?
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Create Post
        </h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setError('');
          }}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          disabled={loading}
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm font-medium">Error: {error}</p>
          <p className="text-red-600 dark:text-red-400 text-xs mt-1">
            Check browser console for details
          </p>
        </div>
      )}

      <form onSubmit={handleSubmitSimple}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.name}
            </p>
          </div>
        </div>

        {/* Post Type Selector */}
        <div className="flex space-x-2 mb-4">
          <button
            type="button"
            onClick={() => setPostType('text')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              postType === 'text'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Text
          </button>
          <button
            type="button"
            onClick={() => setPostType('code')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              postType === 'code'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Code
          </button>
        </div>

        {/* Content Input */}
        {postType === 'text' && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-32 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 dark:text-white"
            disabled={loading}
          />
        )}

        {postType === 'code' && (
          <div className="space-y-3">
            <select
              value={codeSnippet.language}
              onChange={(e) => setCodeSnippet({ ...codeSnippet, language: e.target.value })}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              disabled={loading}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
            <textarea
              value={codeSnippet.code}
              onChange={(e) => setCodeSnippet({ ...codeSnippet, code: e.target.value })}
              placeholder="Paste your code here..."
              className="w-full h-32 font-mono text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 dark:text-white"
              disabled={loading}
            />
          </div>
        )}

        {/* Image Upload (Disabled for now) */}
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            <strong>Note:</strong> Image upload is temporarily disabled while we fix the server issues.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={triggerImageUpload}
              className="p-2 rounded-lg text-gray-400 cursor-not-allowed"
              disabled={true}
              title="Image upload temporarily disabled"
            >
              <Image className="h-5 w-5" />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              disabled={true}
            />

            <button
              type="button"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              <Code className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              <Smile className="h-5 w-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={(!content.trim() && !codeSnippet.code.trim()) || loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{loading ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreatePost;