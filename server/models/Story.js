// models/Story.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['coding', 'career', 'learning', 'project', 'experience', 'tips', 'other'],
    default: 'other'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  isPublished: {
    type: Boolean,
    default: true
  },
  readTime: {
    type: Number, // in minutes
    default: 1
  },
  featuredImage: {
    type: String, // URL to image
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ category: 1, createdAt: -1 });
storySchema.index({ tags: 1 });
storySchema.index({ likes: -1 });

// Virtual for like count
storySchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
storySchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Calculate read time before saving
storySchema.pre('save', function(next) {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  this.readTime = Math.ceil(wordCount / wordsPerMinute);
  next();
});

module.exports = mongoose.model('Story', storySchema);