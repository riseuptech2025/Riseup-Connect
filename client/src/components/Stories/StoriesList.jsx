import React, { useState, useEffect } from 'react';
import { Plus, Play } from 'lucide-react';
import { storiesAPI } from '../../services/api';
import StoriesViewer from './StoriesViewer';
import StoryCreator from './StoryCreator';

const StoriesList = () => {
  const [stories, setStories] = useState([]);
  const [userStories, setUserStories] = useState([]);
  const [followingStories, setFollowingStories] = useState([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const [allResponse, followingResponse, userResponse] = await Promise.all([
        storiesAPI.getStories(),
        storiesAPI.getFollowingStories(),
        storiesAPI.getUserStories()
      ]);

      setStories(allResponse.data.data || []);
      setFollowingStories(followingResponse.data.data || []);
      setUserStories(userResponse.data.data || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStory = (storyIndex) => {
    setSelectedStoryIndex(storyIndex);
    setShowViewer(true);
  };

  const handleStoryCreated = () => {
    loadStories(); // Reload stories after creation
  };

  const groupStoriesByUser = (storiesList) => {
    const grouped = {};
    storiesList.forEach(story => {
      if (!grouped[story.author._id]) {
        grouped[story.author._id] = {
          author: story.author,
          stories: []
        };
      }
      grouped[story.author._id].stories.push(story);
    });
    return Object.values(grouped);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const allStories = [...userStories, ...followingStories, ...stories];
  const groupedStories = groupStoriesByUser(allStories);

  return (
    <>
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {/* Create Story */}
          <div className="flex flex-col items-center space-y-2 flex-shrink-0">
            <button
              onClick={() => setShowCreator(true)}
              className="relative w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
            >
              <Plus size={24} className="text-white" />
            </button>
            <span className="text-xs font-medium">Your Story</span>
          </div>

          {/* Other users' stories */}
          {groupedStories.map((userStoryGroup, index) => (
            <div key={userStoryGroup.author._id} className="flex flex-col items-center space-y-2 flex-shrink-0">
              <button
                onClick={() => openStory(index)}
                className="relative w-16 h-16 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full p-0.5"
              >
                <img
                  src={userStoryGroup.author.avatar}
                  alt={userStoryGroup.author.name}
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
                {userStoryGroup.stories.some(story => !story.seen) && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              <span className="text-xs font-medium truncate max-w-[64px]">
                {userStoryGroup.author.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stories Viewer */}
      {showViewer && selectedStoryIndex !== null && (
        <StoriesViewer
          stories={groupedStories.flatMap(group => group.stories)}
          initialIndex={selectedStoryIndex}
          onClose={() => setShowViewer(false)}
          onStoryUpdate={loadStories}
        />
      )}

      {/* Story Creator */}
      {showCreator && (
        <StoryCreator
          onClose={() => setShowCreator(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}
    </>
  );
};

export default StoriesList;