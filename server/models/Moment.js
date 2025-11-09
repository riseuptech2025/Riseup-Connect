const mongoose = require('mongoose');

const momentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: {
    type: String, // URL to image/video
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  caption: {
    type: String,
    trim: true,
    maxlength: 2200 // Instagram-style long captions
  },
  duration: {
    type: Number, // Duration in seconds for videos
    default: 0
  },
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index for auto-deletion
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create TTL index for auto-deletion after 24 hours
momentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient queries
momentSchema.index({ user: 1, createdAt: -1 });
momentSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Moment', momentSchema);