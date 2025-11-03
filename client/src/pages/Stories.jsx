import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Camera, Users, MessageCircle, Heart } from 'lucide-react';

const Stories = () => {
  const features = [
    {
      icon: <Camera className="h-6 w-6" />,
      title: "Visual Stories",
      description: "Share your coding journey through images and short videos"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "24-Hour Stories",
      description: "Stories disappear after 24 hours to keep content fresh"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Engagement",
      description: "Connect with developers through interactive stories"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Real-time Reactions",
      description: "React and comment on stories as they happen"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Story Reactions",
      description: "Show appreciation with likes and direct messages"
    }
  ];

  const upcomingUpdates = [
    "Image and video upload support",
    "Story creation interface",
    "Story viewer with progress bar",
    "Direct messaging on stories",
    "Story analytics and insights"
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stories</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Hero Section */}
          <div className="mb-12">
            <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Stories are
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-3">
                Coming Soon!
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              We're building an amazing new way for developers to share their coding journey 
              through visual stories that bring the community closer together.
            </p>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              What to Expect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Development Progress
            </h2>
            
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Development Progress
                </span>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  65%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: '65%' }}
                ></div>
              </div>
            </div>

            {/* Upcoming Updates */}
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Coming in the next update:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcomingUpdates.map((update, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">{update}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="mb-6 opacity-90">
              Be the first to know when Stories launch and get early access to new features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Notify Me When It's Ready
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors">
                Learn More About Updates
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12">
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              We're working hard to bring you the best experience. Thank you for your patience!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Stories;