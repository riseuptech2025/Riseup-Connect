const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    maxlength: [5000, 'Post content cannot be more than 5000 characters']
  },
  codeSnippet: {
    language: String,
    code: String
  },
  image: {
    type: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  shareCount: {
    type: Number,
    default: 0
  },
  isShared: {
    type: Boolean,
    default: false
  },
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update posts count when a post is created
postSchema.post('save', async function() {
  await mongoose.model('User').findByIdAndUpdate(
    this.user,
    { $inc: { postsCount: 1 } }
  );
});

// Update posts count when a post is deleted
postSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await mongoose.model('User').findByIdAndUpdate(
      doc.user,
      { $inc: { postsCount: -1 } }
    );
  }
});

module.exports = mongoose.model('Post', postSchema);