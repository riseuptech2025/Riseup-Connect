const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Answer content is required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Question content is required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  answers: [answerSchema],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  isAnswered: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better search performance
questionSchema.index({ title: 'text', content: 'text', tags: 'text' });
questionSchema.index({ user: 1, createdAt: -1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ isAnswered: 1 });

// Virtual for answer count
questionSchema.virtual('answerCount').get(function() {
  return this.answers.length;
});

// Virtual for like count
questionSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Method to check if user liked the question
questionSchema.methods.isLikedBy = function(userId) {
  return this.likes.includes(userId);
};

// Method to check if user bookmarked the question
questionSchema.methods.isBookmarkedBy = function(userId) {
  return this.bookmarks.includes(userId);
};

// Static method to get questions with filters
questionSchema.statics.getQuestions = async function(page = 1, limit = 10, filter = 'all', userId = null) {
  const skip = (page - 1) * limit;
  let query = {};
  
  switch (filter) {
    case 'unanswered':
      query.isAnswered = false;
      break;
    case 'popular':
      // Questions with most answers
      break;
    case 'recent':
    default:
      // All questions, sorted by recent
      break;
  }

  const questions = await this.find(query)
    .populate('user', 'name avatar')
    .populate('answers.user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Add computed fields for the requesting user
  if (userId) {
    questions.forEach(question => {
      question.isLiked = question.likes.includes(userId);
      question.isBookmarked = question.bookmarks.includes(userId);
    });
  }

  const total = await this.countDocuments(query);

  return {
    questions,
    pagination: {
      page,
      totalPages: Math.ceil(total / limit),
      totalQuestions: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

module.exports = mongoose.model('Question', questionSchema);