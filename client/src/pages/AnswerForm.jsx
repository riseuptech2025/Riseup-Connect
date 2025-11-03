import React, { useState, useCallback } from 'react';
import { Send, Loader } from 'lucide-react';

const AnswerForm = ({ questionId, onSubmit, isSubmitting }) => {
  const [content, setContent] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(questionId, content);
      setContent(''); // Clear after submit
    }
  }, [content, questionId, onSubmit]);

  const handleChange = useCallback((e) => {
    setContent(e.target.value);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Write your answer..."
        rows={3}
        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none mb-3"
        required
      />
      
      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isSubmitting ? (
          <Loader className="h-3 w-3 animate-spin" />
        ) : (
          <Send className="h-3 w-3" />
        )}
        <span>{isSubmitting ? 'Posting...' : 'Post Answer'}</span>
      </button>
    </form>
  );
};

export default AnswerForm;