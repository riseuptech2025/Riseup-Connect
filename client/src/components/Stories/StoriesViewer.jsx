import React, { useState, useEffect, useRef } from 'react';
import { storiesAPI } from '../../services/api';
import { X, ChevronLeft, ChevronRight, Play, Pause, Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';

const StoriesViewer = ({ stories, initialIndex = 0, onClose, onStoryUpdate }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const videoRef = useRef(null);
  const progressInterval = useRef(null);

  const currentStory = stories[currentStoryIndex];
  const isVideo = currentStory?.content?.includes('video') || currentStory?.mediaType === 'video';

  useEffect(() => {
    if (isPlaying) {
      startProgress();
    } else {
      clearProgress();
    }

    return () => clearProgress();
  }, [currentStoryIndex, isPlaying]);

  useEffect(() => {
    // Reset progress when story changes
    setProgress(0);
    setHasLiked(currentStory?.likes?.includes(currentUser?.id));
  }, [currentStoryIndex]);

  const startProgress = () => {
    clearProgress();
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + 0.5; // 5 seconds per story
      });
    }, 25);
  };

  const clearProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  const handleLike = async () => {
    try {
      await storiesAPI.likeStory(currentStory._id);
      setHasLiked(!hasLiked);
      onStoryUpdate();
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handlePausePlay = () => {
    setIsPlaying(!isPlaying);
    if (isVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  if (!stories.length) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {stories.map((_, index) => (
          <div key={index} className="h-1 bg-gray-600 flex-1 rounded-full">
            <div
              className={`h-full bg-white rounded-full transition-all duration-100 ${
                index === currentStoryIndex ? 'w-full' : index < currentStoryIndex ? 'w-full' : 'w-0'
              }`}
              style={{
                width: index === currentStoryIndex ? `${progress}%` : index < currentStoryIndex ? '100%' : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevStory}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 z-10"
        disabled={currentStoryIndex === 0}
      >
        <ChevronLeft size={32} />
      </button>

      <button
        onClick={nextStory}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 z-10"
        disabled={currentStoryIndex === stories.length - 1}
      >
        <ChevronRight size={32} />
      </button>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 z-10"
      >
        <X size={24} />
      </button>

      {/* Story content */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isVideo ? (
          <video
            ref={videoRef}
            src={currentStory.content}
            className="max-w-full max-h-full object-contain"
            autoPlay
            muted
            onEnded={nextStory}
          />
        ) : (
          <img
            src={currentStory.content}
            alt="Story"
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Story info overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={currentStory.author.avatar}
                alt={currentStory.author.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-semibold">{currentStory.author.name}</span>
              <span className="text-sm text-gray-300">
                {new Date(currentStory.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={handlePausePlay} className="p-2">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button onClick={handleLike} className={`p-2 ${hasLiked ? 'text-red-500' : ''}`}>
                <Heart size={20} fill={hasLiked ? 'currentColor' : 'none'} />
              </button>
              <button onClick={() => setShowComments(true)} className="p-2">
                <MessageCircle size={20} />
              </button>
              <button className="p-2">
                <Share size={20} />
              </button>
              <button className="p-2">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments sidebar */}
      {showComments && (
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white">
          {/* Comments component would go here */}
          <div className="p-4">
            <h3 className="text-lg font-semibold">Comments</h3>
            {/* Comments list */}
            <button
              onClick={() => setShowComments(false)}
              className="absolute top-4 right-4"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesViewer;