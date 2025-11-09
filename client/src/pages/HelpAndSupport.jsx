import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Clock,
  Users,
  Shield,
  Bug,
  Lightbulb,
  BookOpen
} from 'lucide-react';

const HelpAndSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [openFaqs, setOpenFaqs] = useState({});

  // FAQ data
  const faqCategories = {
    'getting-started': {
      title: 'Getting Started',
      icon: <BookOpen className="h-5 w-5" />,
      questions: [
        {
          question: 'How do I create my first post?',
          answer: 'To create your first post, click on the "What\'s on your mind?" box at the top of your feed. You can choose between text posts or code snippets. For code posts, select the programming language and paste your code in the provided area.'
        },
        {
          question: 'How do I update my profile?',
          answer: 'Go to your profile page by clicking on your profile picture in the top right corner. Click the "Edit Profile" button to update your name, bio, profile picture, and other personal information.'
        },
        {
          question: 'Can I connect with other developers?',
          answer: 'Yes! You can follow other developers by visiting their profiles and clicking the "Follow" button. You\'ll see their posts in your feed and can interact with their content.'
        }
      ]
    },
    'posts': {
      title: 'Posts & Content',
      icon: <FileText className="h-5 w-5" />,
      questions: [
        {
          question: 'How do I format code in my posts?',
          answer: 'When creating a code post, select the appropriate programming language from the dropdown menu. The code will be automatically formatted with syntax highlighting for better readability.'
        },
        {
          question: 'Can I edit or delete my posts?',
          answer: 'Yes, you can edit or delete your posts by clicking the three-dot menu on the top right of your post. Please note that once deleted, posts cannot be recovered.'
        },
        {
          question: 'Is there a limit to post length?',
          answer: 'Text posts have a limit of 10,000 characters. Code snippets should be under 5,000 characters for optimal display.'
        }
      ]
    },
    'account': {
      title: 'Account & Security',
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          question: 'How do I reset my password?',
          answer: 'Go to the login page and click "Forgot Password". Enter your email address and we\'ll send you a link to reset your password.'
        },
        {
          question: 'Can I make my profile private?',
          answer: 'Currently, all profiles are public to foster community engagement. However, you can control what information you share in your profile settings.'
        },
        {
          question: 'How do I delete my account?',
          answer: 'To delete your account, go to Settings > Account > Delete Account. Please note this action is permanent and cannot be undone.'
        }
      ]
    },
    'technical': {
      title: 'Technical Issues',
      icon: <Bug className="h-5 w-5" />,
      questions: [
        {
          question: 'The app is loading slowly. What can I do?',
          answer: 'Try refreshing the page or clearing your browser cache. If the issue persists, check your internet connection or try accessing from a different browser.'
        },
        {
          question: 'My code snippets aren\'t displaying correctly',
          answer: 'Make sure you\'ve selected the correct programming language. If the issue continues, try reformatting your code or breaking it into smaller sections.'
        },
        {
          question: 'I\'m experiencing unexpected errors',
          answer: 'Try logging out and back in, or clear your browser cache. If errors continue, contact our support team with details about the issue.'
        }
      ]
    }
  };

  // Popular articles
  const popularArticles = [
    {
      title: 'Creating Your First Code Post',
      description: 'Learn how to share code snippets with proper formatting',
      category: 'posts',
      reads: '1.2k'
    },
    {
      title: 'Profile Customization Guide',
      description: 'Make your profile stand out with these tips',
      category: 'getting-started',
      reads: '890'
    },
    {
      title: 'Troubleshooting Common Issues',
      description: 'Solutions for frequent technical problems',
      category: 'technical',
      reads: '2.1k'
    },
    {
      title: 'Community Guidelines',
      description: 'Understand our platform rules and best practices',
      category: 'account',
      reads: '3.4k'
    }
  ];

  // Contact methods
  const contactMethods = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: 'Available 24/7',
      action: 'Start Chat',
      color: 'bg-green-500'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Support',
      description: 'Send us a detailed message',
      availability: 'Response within 24 hours',
      action: 'Send Email',
      color: 'bg-blue-500'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone Support',
      description: 'Talk directly with our team',
      availability: 'Mon-Fri, 9AM-6PM EST',
      action: 'Call Now',
      color: 'bg-purple-500'
    }
  ];

  const toggleFaq = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenFaqs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredFaqs = Object.entries(faqCategories).filter(([key, category]) => 
    category.questions.some(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Help & Support
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions, browse documentation, or get in touch with our support team.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-blue-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {contactMethods.map((method, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className={`${method.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
                {method.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {method.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {method.description}
              </p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Clock className="h-4 w-4 mr-1" />
                {method.availability}
              </div>
              <button className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors">
                {method.action}
              </button>
            </div>
          ))}
        </motion.div>

        {/* Popular Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Popular Help Articles
            </h2>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center">
              View All Articles
              <ExternalLink className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularArticles.map((article, index) => (
              <div
                key={index}
                className="bg-blue-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {article.description}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="capitalize">{article.category}</span>
                  <span>{article.reads} reads</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(faqCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === key
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category.icon}
                <span className="ml-2">{category.title}</span>
              </button>
            ))}
          </div>

          {/* FAQ Questions */}
          <div className="space-y-4">
            {faqCategories[activeCategory].questions.map((faq, index) => {
              const faqKey = `${activeCategory}-${index}`;
              const isOpen = openFaqs[faqKey];

              return (
                <div
                  key={index}
                  className="bg-blue-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(activeCategory, index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white"
        >
          <div className="max-w-4xl mx-auto text-center">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
              Our dedicated support team is here to help you with any questions or issues you might have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-100 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Contact Support Team
              </button>
              <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-100/10 transition-colors">
                Schedule a Call
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="text-center">
            <Lightbulb className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pro Tips</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use code formatting for better readability and engagement
            </p>
          </div>
          <div className="text-center">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Safe Community</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Report any inappropriate content to keep our community safe
            </p>
          </div>
          <div className="text-center">
            <Bug className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Report Bugs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Found a bug? Let us know so we can fix it quickly
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpAndSupport;