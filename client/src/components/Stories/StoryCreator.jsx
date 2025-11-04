import React, { useState, useRef } from 'react';
import { X, Upload, Image, Video, Type, Smile, Send } from 'lucide-react';
import { storiesAPI } from '../../services/api';

const StoryCreator = ({ onClose, onStoryCreated }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('media');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateStory = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', selectedFile);
      formData.append('caption', caption);
      formData.append('type', selectedFile.type.startsWith('video/') ? 'video' : 'image');

      const response = await storiesAPI.createStory(formData);
      onStoryCreated(response.data.data);
      onClose();
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Create Story</h2>
          <button onClick={onClose} className="p-2">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="w-64 border-r p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('media')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg ${
                  activeTab === 'media' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <Image size={20} />
                <span>Media</span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg ${
                  activeTab === 'text' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <Type size={20} />
                <span>Text</span>
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {activeTab === 'media' && (
              <>
                {!previewUrl ? (
                  <div
                    className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg m-4"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <Upload size={48} className="text-gray-400 mb-4" />
                    <p className="text-lg font-medium mb-2">Drag photos and videos here</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Select from computer
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col p-4">
                    <div className="relative bg-black rounded-lg flex-1 flex items-center justify-center">
                      {selectedFile.type.startsWith('video/') ? (
                        <video
                          src={previewUrl}
                          className="max-h-full max-w-full object-contain"
                          controls
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Add a caption..."
                        className="w-full p-3 border rounded-lg resize-none"
                        rows="2"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'text' && (
              <div className="flex-1 flex flex-col p-4">
                <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center p-8">
                  <div className="text-center">
                    <Type size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Text stories coming soon</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={handleCreateStory}
            disabled={!selectedFile || isUploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send size={20} />
            <span>{isUploading ? 'Sharing...' : 'Share to Story'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryCreator;