import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Video, Image, Clock, Send, Loader } from 'lucide-react';
import { momentsAPI, uploadAPI } from '../../services/api'; // Make sure you have uploadAPI
import { useAuth } from '../../contexts/AuthContext';

const CreateMoment = ({ onMomentCreated, isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [mediaType, setMediaType] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type and size
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
      alert('Please select an image (JPEG, PNG, GIF, WebP) or video (MP4, MOV, WebM) file.');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 50MB.');
      return;
    }

    setSelectedFile(file);
    setMediaType(validImageTypes.includes(file.type) ? 'image' : 'video');
    
    // Create preview URL
    const previewURL = URL.createObjectURL(file);
    setPreviewUrl(previewURL);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const inputEvent = { target: { files: [file] } };
      handleFileSelect(inputEvent);
    }
  };

  // Function to upload file to server
  const uploadFileToServer = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'moment'); // You can use this to organize uploads

    try {
      const response = await uploadAPI.uploadMomentMedia(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });

      if (response.data.success) {
        return response.data.data; // Should contain { url: 'uploaded-file-url' }
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  };

  // Function to get video duration
  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = function() {
          window.URL.revokeObjectURL(video.src);
          resolve(Math.round(video.duration));
        };
        
        video.onerror = function() {
          resolve(0);
        };
        
        video.src = URL.createObjectURL(file);
      } else {
        resolve(0);
      }
    });
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get video duration if it's a video
      const duration = await getVideoDuration(selectedFile);

      // Step 2: Upload file to server
      const uploadResult = await uploadFileToServer(selectedFile);
      
      // Step 3: Create moment with the server file URL
      const momentData = {
        media: uploadResult.url, // Use the server URL, not blob URL
        mediaType,
        caption: caption.trim(),
        duration
      };

      const response = await momentsAPI.createMoment(momentData);

      if (response.data.success) {
        onMomentCreated(response.data.data);
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Error creating moment:', error);
      alert(error.message || 'Failed to create moment. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    // Clean up blob URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    setCaption('');
    setMediaType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Clean up blob URLs when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Create Moment
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isUploading}
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {!selectedFile ? (
              // File upload area
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Upload your moment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Drag and drop an image or video, or click to browse
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Image className="h-4 w-4 mr-1" />
                    <span>Image</span>
                  </div>
                  <div className="flex items-center">
                    <Video className="h-4 w-4 mr-1" />
                    <span>Video</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Supports JPEG, PNG, GIF, WebP, MP4, MOV • Max 50MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              // Preview and caption area
              <div className="space-y-4">
                {/* Upload Progress */}
                {isUploading && (
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}

                <div className="relative rounded-xl overflow-hidden bg-black">
                  {mediaType === 'image' ? (
                    <img
                      src={previewUrl}
                      alt="Moment preview"
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      className="w-full h-64 object-cover"
                      controls
                    />
                  )}
                  
                  {/* 24-hour badge */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    24h
                  </div>
                </div>

                {/* Caption input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Caption (optional)
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption to your moment..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                    disabled={isUploading}
                  />
                </div>

                {/* User info */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Will disappear in 24 hours
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Uploading... {uploadProgress}%</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Share Moment</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateMoment;