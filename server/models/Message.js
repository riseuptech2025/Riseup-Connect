const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [5000, 'Message content cannot be more than 5000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'code'],
    default: 'text'
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Update lastMessage in conversation when a new message is created
messageSchema.post('save', async function() {
  await mongoose.model('Conversation').findByIdAndUpdate(
    this.conversation,
    { lastMessage: this._id }
  );
});

module.exports = mongoose.model('Message', messageSchema);