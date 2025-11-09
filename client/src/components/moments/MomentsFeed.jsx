import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Loader } from 'lucide-react';
import MomentCard from './MomentCard';
import CreateMoment from './CreateMoment';
import { momentsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MomentsFeed = () => {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreatingMoment, setIsCreatingMoment] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const containerRef = useRef(null);
  const { isAuthenticated } = useAuth();

  const fetchMoments = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await momentsAPI.getMomentsFeed(pageNum, 10);
      
      if (response.data.success) {
        if (pageNum === 1) {
          setMoments(response.data.data);
        } else {
          setMoments(prev => [...prev, ...response.data.data]);
        }
        setHasMore(response.data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error fetching moments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoments();
  }, []);

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    
    if (event.deltaY > 50 && currentIndex < moments.length - 1) {
      // Scroll down - next moment
      setCurrentIndex(prev => prev + 1);
    } else if (event.deltaY < -50 && currentIndex > 0) {
      // Scroll up - previous moment
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, moments.length]);

  const handleTouchStart = useCallback((event) => {
    const touchStartY = event.touches[0].clientY;
    
    const handleTouchMove = (moveEvent) => {
      const touchCurrentY = moveEvent.touches[0].clientY;
      const deltaY = touchStartY - touchCurrentY;
      
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0 && currentIndex < moments.length - 1) {
          // Swipe up - next moment
          setCurrentIndex(prev => prev + 1);
        } else if (deltaY < 0 && currentIndex > 0) {
          // Swipe down - previous moment
          setCurrentIndex(prev => prev - 1);
        }
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', () => {
      document.removeEventListener('touchmove', handleTouchMove);
    }, { once: true });
  }, [currentIndex, moments.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      
      return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, [handleWheel, handleTouchStart]);

  // Load more when near the end
  useEffect(() => {
    if (currentIndex >= moments.length - 2 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMoments(nextPage);
    }
  }, [currentIndex, moments.length, hasMore, loading, page]);

  const handleMomentCreated = (newMoment) => {
    setMoments(prev => [newMoment, ...prev]);
    setIsCreatingMoment(false);
  };

  const handleLike = (momentId, isLiked) => {
    setMoments(prev => prev.map(moment => 
      moment._id === momentId 
        ? {
            ...moment,
            likes: isLiked 
              ? [...moment.likes, { user: { _id: 'current-user' } }]
              : moment.likes.filter(like => 
                  like.user?._id !== 'current-user' && like.user !== 'current-user'
                )
          }
        : moment
    ));
  };

  const handleComment = (momentId, newComment) => {
    setMoments(prev => prev.map(moment => 
      moment._id === momentId 
        ? {
            ...moment,
            comments: [...moment.comments, newComment]
          }
        : moment
    ));
  };

  if (loading && moments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading moments...</p>
        </div>
      </div>
    );
  }

  if (moments.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md mx-auto">
          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">This Features Comming Soon...</h2>
          <p className="text-gray-400 mb-8">
            We are working hard to bring you amazing moments from developers around the world. Stay tuned!
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setIsCreatingMoment(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Moment</span>
            </button>
          )}
          
          {/* Create Moment Modal */}
          <CreateMoment
            isOpen={isCreatingMoment}
            onClose={() => setIsCreatingMoment(false)}
            onMomentCreated={handleMomentCreated}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Progress Indicator */}
      <div className="absolute top-4 left-4 right-4 z-30 flex space-x-1">
        {moments.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white' 
                : 'bg-gray-600'
            } ${
              index < currentIndex ? 'bg-white' : ''
            }`}
          />
        ))}
      </div>

      {/* Create Moment Button - Fixed z-index and positioning */}
      {isAuthenticated && (
        <button
          onClick={() => setIsCreatingMoment(true)}
          className="absolute top-4 right-4 z-40 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
          style={{ zIndex: 40 }}
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Moments Container */}
      <div 
        ref={containerRef}
        className="relative h-full w-full"
        style={{ zIndex: 10 }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0"
            style={{ zIndex: 20 }}
          >
            <MomentCard
              moment={moments[currentIndex]}
              onLike={handleLike}
              onComment={handleComment}
              isActive={true}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Hints */}
      {moments.length > 1 && (
        <div className="absolute bottom-20 left-0 right-0 text-center z-30">
          <p className="text-white text-sm bg-black bg-opacity-50 inline-block px-4 py-2 rounded-full">
            Scroll or swipe to navigate
          </p>
        </div>
      )}

      {/* Create Moment Modal */}
      <CreateMoment
        isOpen={isCreatingMoment}
        onClose={() => setIsCreatingMoment(false)}
        onMomentCreated={handleMomentCreated}
      />

      {/* Loading More Indicator */}
      {loading && moments.length > 0 && (
        <div className="absolute bottom-4 left-0 right-0 text-center z-30">
          <Loader className="h-6 w-6 animate-spin text-white inline-block" />
        </div>
      )}
    </div>
  );
};

export default MomentsFeed;