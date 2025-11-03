import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  HelpCircle, 
  Search, 
  Filter, 
  ThumbsUp, 
  MessageCircle, 
  Eye, 
  Bookmark, 
  MoreVertical,
  Loader,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Share
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { questionsAPI } from '../services/api';
import AnswerForm from './AnswerForm';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAskForm, setShowAskForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({});
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [submittingAnswers, setSubmittingAnswers] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { user, isAuthenticated } = useAuth();

  // Get current state from URL params
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentFilter = searchParams.get('filter') || 'all';
  const searchTerm = searchParams.get('q') || '';
  const tagFilter = searchParams.get('tag') || '';

  const filters = [
    { id: 'all', label: 'All Questions' },
    { id: 'unanswered', label: 'Unanswered' },
    { id: 'popular', label: 'Most Popular' },
    { id: 'recent', label: 'Most Recent' }
  ];

  // Memoized fetch function
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (searchTerm || tagFilter) {
        response = await questionsAPI.searchQuestions(
          searchTerm, 
          tagFilter, 
          currentPage
        );
      } else {
        response = await questionsAPI.getQuestions(
          currentPage, 
          10, 
          currentFilter
        );
      }

      if (response.data.success) {
        setQuestions(response.data.data.questions || []);
        setPagination(response.data.data.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentFilter, searchTerm, tagFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to ask a question');
      return;
    }

    const formData = new FormData(e.target);
    const title = formData.get('title');
    const content = formData.get('content');
    const tags = formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag);

    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await questionsAPI.createQuestion({
        title,
        content,
        tags
      });

      if (response.data.success) {
        setShowAskForm(false);
        e.target.reset();
        fetchQuestions();
        alert('Question posted successfully!');
      }
    } catch (error) {
      console.error('Error posting question:', error);
      alert('Failed to post question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Optimized like handler
  const handleLikeQuestion = useCallback(async (questionId) => {
    if (!isAuthenticated) {
      alert('Please login to like questions');
      return;
    }

    const question = questions.find(q => q._id === questionId);
    if (!question) return;

    const wasLiked = question.isLiked;
    const newLikes = wasLiked 
      ? question.likes.filter(id => id !== user._id)
      : [...question.likes, user._id];

    // Immediate optimistic update
    setQuestions(prev => 
      prev.map(q => 
        q._id === questionId 
          ? { ...q, isLiked: !wasLiked, likes: newLikes }
          : q
      )
    );

    try {
      await questionsAPI.likeQuestion(questionId);
      // Refresh to ensure sync with server
      fetchQuestions();
    } catch (error) {
      console.error('Error liking question:', error);
      // Revert on error
      setQuestions(prev => 
        prev.map(q => 
          q._id === questionId 
            ? { ...q, isLiked: wasLiked, likes: question.likes }
            : q
        )
      );
    }
  }, [questions, user?._id, isAuthenticated, fetchQuestions]);

  // Optimized bookmark handler
  const handleBookmarkQuestion = useCallback(async (questionId) => {
    if (!isAuthenticated) {
      alert('Please login to bookmark questions');
      return;
    }

    const question = questions.find(q => q._id === questionId);
    if (!question) return;

    const wasBookmarked = question.isBookmarked;

    // Immediate optimistic update
    setQuestions(prev => 
      prev.map(q => 
        q._id === questionId 
          ? { ...q, isBookmarked: !wasBookmarked }
          : q
      )
    );

    try {
      await questionsAPI.bookmarkQuestion(questionId);
    } catch (error) {
      console.error('Error bookmarking question:', error);
      // Revert on error
      setQuestions(prev => 
        prev.map(q => 
          q._id === questionId 
            ? { ...q, isBookmarked: wasBookmarked }
            : q
        )
      );
    }
  }, [questions, isAuthenticated]);

  // Optimized answer submission
  const handleSubmitAnswer = useCallback(async (questionId, content) => {
    if (!isAuthenticated) {
      alert('Please login to answer questions');
      return;
    }

    try {
      setSubmittingAnswers(prev => ({ ...prev, [questionId]: true }));
      
      await questionsAPI.addAnswer(questionId, { content });
      
      // Refresh to get updated answers
      await fetchQuestions();
      
      // Keep the question expanded after adding answer
      setExpandedQuestion(questionId);
      
    } catch (error) {
      console.error('Error posting answer:', error);
      alert('Failed to post answer');
    } finally {
      setSubmittingAnswers(prev => ({ ...prev, [questionId]: false }));
    }
  }, [isAuthenticated, fetchQuestions]);

  // Optimized answer like handler
  const handleLikeAnswer = useCallback(async (questionId, answerId) => {
    if (!isAuthenticated) {
      alert('Please login to like answers');
      return;
    }

    const question = questions.find(q => q._id === questionId);
    if (!question) return;

    const answer = question.answers.find(a => a._id === answerId);
    if (!answer) return;

    const wasLiked = answer.isLiked;
    const newLikes = wasLiked 
      ? answer.likes.filter(id => id !== user._id)
      : [...answer.likes, user._id];

    // Immediate optimistic update
    setQuestions(prev => 
      prev.map(q => 
        q._id === questionId 
          ? {
              ...q,
              answers: q.answers.map(a =>
                a._id === answerId
                  ? { ...a, isLiked: !wasLiked, likes: newLikes }
                  : a
              )
            }
          : q
      )
    );

    try {
      await questionsAPI.likeAnswer(questionId, answerId);
    } catch (error) {
      console.error('Error liking answer:', error);
      // Revert on error
      setQuestions(prev => 
        prev.map(q => 
          q._id === questionId 
            ? {
                ...q,
                answers: q.answers.map(a =>
                  a._id === answerId
                    ? { ...a, isLiked: wasLiked, likes: answer.likes }
                    : a
                )
              }
            : q
        )
      );
    }
  }, [questions, user?._id, isAuthenticated]);

  const handleAcceptAnswer = useCallback(async (questionId, answerId) => {
    if (!isAuthenticated) {
      alert('Please login to accept answers');
      return;
    }

    const question = questions.find(q => q._id === questionId);
    if (question.user._id !== user._id) {
      alert('Only the question owner can accept answers');
      return;
    }

    try {
      // Optimistic update
      setQuestions(prev => 
        prev.map(q => 
          q._id === questionId 
            ? {
                ...q,
                isAnswered: true,
                answers: q.answers.map(a => ({
                  ...a,
                  isAccepted: a._id === answerId
                }))
              }
            : q
        )
      );

      await questionsAPI.acceptAnswer(questionId, answerId);
      alert('Answer accepted!');
    } catch (error) {
      console.error('Error accepting answer:', error);
      alert('Failed to accept answer');
      // Refresh to revert optimistic update
      fetchQuestions();
    }
  }, [questions, user?._id, isAuthenticated, fetchQuestions]);

  const handleShareQuestion = useCallback(async (questionId) => {
    const question = questions.find(q => q._id === questionId);
    const shareText = `${question.title}\n\n${question.content.substring(0, 100)}...`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: question.title,
          text: shareText,
          url: `${window.location.origin}/questions/${questionId}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Question copied to clipboard!');
    }
  }, [questions]);

  const toggleQuestionExpansion = useCallback((questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  }, [expandedQuestion]);

  const handleFilterChange = useCallback((filterId) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', filterId);
    params.delete('page');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get('search');
    
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (tagFilter) params.set('tag', tagFilter);
    params.delete('page');
    setSearchParams(params);
  }, [tagFilter, setSearchParams]);

  const handlePageChange = useCallback((newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const getUserInitials = useCallback((name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // Memoized QuestionCard component
  const QuestionCard = React.memo(({ question }) => {
    const isExpanded = expandedQuestion === question._id;
    const isSubmittingAnswer = submittingAnswers[question._id] || false;

    const handleLikeClick = useCallback(() => {
      handleLikeQuestion(question._id);
    }, [question._id, handleLikeQuestion]);

    const handleBookmarkClick = useCallback(() => {
      handleBookmarkQuestion(question._id);
    }, [question._id, handleBookmarkQuestion]);

    const handleShareClick = useCallback(() => {
      handleShareQuestion(question._id);
    }, [question._id, handleShareQuestion]);

    const handleToggleExpansion = useCallback(() => {
      toggleQuestionExpansion(question._id);
    }, [question._id, toggleQuestionExpansion]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6"
      >
        {/* Question Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {getUserInitials(question.user?.name)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {question.user?.name || 'Unknown User'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTime(question.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {question.isAnswered && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                  Answered
                </span>
              )}
              <button 
                onClick={handleShareClick}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Share className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {question.title}
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {question.content}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <button
                onClick={handleLikeClick}
                className={`flex items-center space-x-1 transition-colors ${
                  question.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ThumbsUp className={`h-4 w-4 ${question.isLiked ? 'fill-current' : ''}`} />
                <span>{question.likes?.length || 0}</span>
              </button>

              <button
                onClick={handleToggleExpansion}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{question.answers?.length || 0}</span>
              </button>

              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{question.views || 0}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleBookmarkClick}
                className={`p-2 rounded-lg transition-colors ${
                  question.isBookmarked
                    ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${question.isBookmarked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleToggleExpansion}
                className="p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Answers Section - Expandable */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 dark:border-gray-700"
            >
              {/* Answers List */}
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Answers ({question.answers?.length || 0})
                </h3>

                {question.answers?.length > 0 ? (
                  question.answers.map((answer) => (
                    <AnswerItem 
                      key={answer._id}
                      answer={answer}
                      question={question}
                      onLikeAnswer={handleLikeAnswer}
                      onAcceptAnswer={handleAcceptAnswer}
                      isAuthenticated={isAuthenticated}
                      user={user}
                      getUserInitials={getUserInitials}
                      formatTime={formatTime}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                    No answers yet. Be the first to answer!
                  </p>
                )}
              </div>

              {/* Answer Form */}
              {isAuthenticated && (
                <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                  <AnswerForm
                    questionId={question._id}
                    onSubmit={handleSubmitAnswer}
                    isSubmitting={isSubmittingAnswer}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  });

  // Memoized AnswerItem component
  const AnswerItem = React.memo(({ 
    answer, 
    question, 
    onLikeAnswer, 
    onAcceptAnswer, 
    isAuthenticated, 
    user, 
    getUserInitials, 
    formatTime 
  }) => {
    const handleLikeClick = useCallback(() => {
      onLikeAnswer(question._id, answer._id);
    }, [question._id, answer._id, onLikeAnswer]);

    const handleAcceptClick = useCallback(() => {
      onAcceptAnswer(question._id, answer._id);
    }, [question._id, answer._id, onAcceptAnswer]);

    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {getUserInitials(answer.user?.name)}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {answer.user?.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(answer.createdAt)}
            </span>
          </div>
          
          {answer.isAccepted && (
            <div className="flex items-center space-x-1 text-green-500">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Accepted</span>
            </div>
          )}
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
          {answer.content}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={handleLikeClick}
            className={`flex items-center space-x-1 text-xs ${
              answer.isLiked ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            <ThumbsUp className={`h-3 w-3 ${answer.isLiked ? 'fill-current' : ''}`} />
            <span>{answer.likes?.length || 0}</span>
          </button>

          {isAuthenticated && question.user._id === user._id && !question.isAnswered && (
            <button
              onClick={handleAcceptClick}
              className="flex items-center space-x-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
            >
              <CheckCircle className="h-3 w-3" />
              <span>Accept</span>
            </button>
          )}
        </div>
      </div>
    );
  });

  const Pagination = useMemo(() => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!pagination.hasPrev}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Previous
        </button>
        
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === page
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!pagination.hasNext}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Next
        </button>
      </div>
    );
  }, [pagination, currentPage, handlePageChange]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Questions & Answers
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ask questions and get answers from the community
            </p>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => setShowAskForm(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="font-semibold">Ask Question</span>
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              name="search"
              placeholder="Search questions..."
              defaultValue={searchTerm}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </form>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterChange(filter.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    currentFilter === filter.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filters display */}
        {(searchTerm || tagFilter) && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm">
                Search: "{searchTerm}"
              </span>
            )}
            {tagFilter && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm">
                Tag: #{tagFilter}
              </span>
            )}
            <button
              onClick={() => {
                setSearchParams({});
              }}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Clear all
            </button>
          </div>
        )}
      </motion.div>

      {/* Ask Question Form Modal */}
      <AnimatePresence>
        {showAskForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAskForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Ask a Question
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Share your question with the community
                </p>
              </div>

              <form onSubmit={handleSubmitQuestion} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="What's your question? Be specific."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Details *
                  </label>
                  <textarea
                    name="content"
                    placeholder="Provide more context about your question. What have you tried? What are you looking to achieve?"
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="react, javascript, programming"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAskForm(false)}
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <HelpCircle className="h-4 w-4" />
                    )}
                    <span>{submitting ? 'Posting...' : 'Post Question'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions List */}
      <div className="space-y-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-4"></div>
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-14"></div>
              </div>
            </div>
          ))
        ) : questions.length > 0 ? (
          <>
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
            {Pagination}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm || tagFilter ? 'No questions found' : 'No questions yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || tagFilter 
                ? 'Try adjusting your search terms' 
                : 'Be the first to ask a question and help build the community!'
              }
            </p>
            {isAuthenticated && !searchTerm && !tagFilter && (
              <button
                onClick={() => setShowAskForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Ask First Question
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;