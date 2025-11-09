const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['general', 'bug', 'suggestion'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: function() {
      return this.type === 'general';
    }
  },
  mood: {
    type: String,
    enum: ['love', 'like', 'neutral', 'dislike', 'hate', '']
  },
  category: {
    type: String,
    enum: ['suggestion', 'ui-ux', 'performance', 'content', 'other'],
    default: 'suggestion'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  allowContact: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['new', 'in_review', 'planned', 'in_progress', 'completed', 'rejected'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ status: 1, priority: -1 });
feedbackSchema.index({ createdAt: -1 });

// Virtual for formatted response time
feedbackSchema.virtual('responseTime').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

module.exports = mongoose.model('Feedback', feedbackSchema);