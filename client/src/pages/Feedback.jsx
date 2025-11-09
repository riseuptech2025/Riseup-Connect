import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Send, 
  Smile, 
  Frown, 
  Meh,
  Heart,
  Bug,
  Lightbulb,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { feedbackAPI } from '../services/api';

const Feedback = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    email: '',
    category: 'suggestion',
    allowContact: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const { user: currentUser } = useAuth();

  // Feedback categories
  const feedbackCategories = [
    {
      id: 'general',
      label: 'General Feedback',
      icon: <MessageCircle className="h-5 w-5" />,
      description: 'Share your overall experience and suggestions'
    },
    {
      id: 'bug',
      label: 'Bug Report',
      icon: <Bug className="h-5 w-5" />,
      description: 'Report technical issues or unexpected behavior'
    },
    {
      id: 'suggestion',
      label: 'Feature Request',
      icon: <Lightbulb className="h-5 w-5" />,
      description: 'Suggest new features or improvements'
    }
  ];

  // Mood options for quick feedback
  const moodOptions = [
    {
      id: 'love',
      label: 'Love it!',
      icon: <Heart className="h-6 w-6" />,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    {
      id: 'like',
      label: 'Like it',
      icon: <ThumbsUp className="h-6 w-6" />,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'neutral',
      label: 'It\'s okay',
      icon: <Meh className="h-6 w-6" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    {
      id: 'dislike',
      label: 'Not great',
      icon: <ThumbsDown className="h-6 w-6" />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      id: 'hate',
      label: 'Hate it',
      icon: <Frown className="h-6 w-6" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (activeTab === 'general' && rating === 0) {
      alert('Please provide a rating for general feedback');
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        type: activeTab,
        title: formData.title.trim(),
        description: formData.description.trim(),
        rating: activeTab === 'general' ? rating : undefined,
        mood: selectedMood || '',
        category: formData.category,
        email: formData.email.trim() || currentUser?.email || '',
        allowContact: formData.allowContact,
        isAnonymous: !formData.email.trim() && !currentUser?.email
      };

      const response = await feedbackAPI.submitFeedback(feedbackData);
      
      if (response.data.success) {
        setIsSubmitted(true);
      } else {
        throw new Error(response.data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join(', ') || 
                          'Failed to submit feedback. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      email: currentUser?.email || '',
      category: 'suggestion',
      allowContact: false
    });
    setRating(0);
    setSelectedMood('');
    setActiveTab('general');
    setIsSubmitted(false);
  };

  const handleQuickFeedback = (moodId) => {
    setSelectedMood(moodId);
    setActiveTab('general');
    
    // Auto-fill some fields based on mood
    const moodMap = {
      'love': { rating: 5, category: 'general' },
      'like': { rating: 4, category: 'general' },
      'neutral': { rating: 3, category: 'suggestion' },
      'dislike': { rating: 2, category: 'bug' },
      'hate': { rating: 1, category: 'bug' }
    };

    const { rating: autoRating, category } = moodMap[moodId];
    setRating(autoRating);
    setFormData(prev => ({ ...prev, category }));
  };

  // Pre-fill email with user's email if available
  React.useEffect(() => {
    if (currentUser?.email && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: currentUser.email
      }));
    }
  }, [currentUser]);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Thank You for Your Feedback!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              Your {activeTab === 'bug' ? 'bug report' : 'feedback'} has been received. 
              We appreciate you helping us improve the platform.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>What happens next?</strong>
                </p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                  <li>• We'll review your {activeTab === 'bug' ? 'bug report' : 'feedback'}</li>
                  <li>• You may hear from our team if we need more details</li>
                  <li>• We'll use your input to make improvements</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={resetForm}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Submit More Feedback
              </button>
              <button
                onClick={() => window.history.back()}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Return to App
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to App
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Share Your Feedback
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Help us improve your experience. We read every piece of feedback.
          </p>
        </motion.div>

        {/* Quick Feedback Mood Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            How are you liking the platform so far?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {moodOptions.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleQuickFeedback(mood.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedMood === mood.id
                    ? `${mood.bgColor} ${mood.borderColor} transform scale-105`
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className={`${mood.color} mb-2`}>
                  {mood.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mood.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feedback Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex overflow-x-auto">
                  {feedbackCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveTab(category.id)}
                      className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === category.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {category.icon}
                      <span className="ml-2 whitespace-nowrap">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* Rating Stars */}
                {activeTab === 'general' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Overall Rating *
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= (hoverRating || rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                )}

                {/* Title Input */}
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {activeTab === 'bug' ? 'Issue Title *' : 'Title *'}
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder={
                      activeTab === 'bug' 
                        ? 'Briefly describe the issue...' 
                        : 'What would you like to share?'
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Description Textarea */}
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {activeTab === 'bug' ? 'Detailed Description *' : 'Description *'}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder={
                      activeTab === 'bug'
                        ? 'Please include:\n• Steps to reproduce the issue\n• What you expected to happen\n• What actually happened\n• Screenshots if possible'
                        : 'Tell us more about your experience, suggestions, or ideas...'
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  />
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {currentUser?.email ? 'Your account email is pre-filled' : 'Optional - for follow-up questions'}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    >
                      <option value="suggestion">Suggestion</option>
                      <option value="ui-ux">UI/UX Improvement</option>
                      <option value="performance">Performance</option>
                      <option value="content">Content Related</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Contact Permission */}
                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="allowContact"
                    name="allowContact"
                    checked={formData.allowContact}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowContact" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Allow us to contact you for follow-up questions
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim() || !formData.description.trim() || (activeTab === 'general' && rating === 0)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Tips Card */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <Lightbulb className="h-6 w-6 text-blue-500 mb-3" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Tips for Great Feedback
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <li>• Be specific and detailed</li>
                  <li>• Include steps to reproduce bugs</li>
                  <li>• Suggest solutions if possible</li>
                  <li>• Keep it constructive and respectful</li>
                </ul>
              </div>

              {/* What Happens Next Card */}
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                <MessageCircle className="h-6 w-6 text-gray-500 dark:text-gray-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What Happens Next?
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• We review all feedback weekly</li>
                  <li>• Bug reports are prioritized</li>
                  <li>• Feature requests are evaluated</li>
                  <li>• We may reach out for more details</li>
                </ul>
              </div>

              {/* Response Time Card */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <CheckCircle className="h-6 w-6 text-green-500 mb-3" />
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Response Time
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  We aim to respond to all bug reports within 48 hours and feature requests within 1 week.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;