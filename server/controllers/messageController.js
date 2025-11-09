const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'name email profileImage position company')
    .populate({
      path: 'lastMessage',
      select: 'content sender createdAt',
      populate: {
        path: 'sender',
        select: 'name profileImage'
      }
    })
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    const messages = await Message.find({
      conversationId,
      isDeleted: false
    })
    .populate('sender', 'name profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    // Reverse to get chronological order
    const sortedMessages = messages.reverse();

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        }
      }
    );

    res.status(200).json({
      success: true,
      data: sortedMessages,
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// Create or get existing conversation
exports.createConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    if (userId.toString() === participantId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] }
    })
    .populate('participants', 'name email profileImage position company')
    .populate('lastMessage');

    if (conversation) {
      return res.status(200).json({
        success: true,
        data: conversation,
        message: 'Conversation already exists'
      });
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [userId, participantId]
    });

    await conversation.save();

    // Populate the conversation data
    await conversation.populate('participants', 'name email profileImage position company');

    res.status(201).json({
      success: true,
      data: conversation,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    
    if (error.code === 11000) {
      // Duplicate conversation - try to find existing one
      try {
        const userId = req.user._id;
        const { participantId } = req.body;
        
        const existingConversation = await Conversation.findOne({
          participants: { $all: [userId, participantId] }
        })
        .populate('participants', 'name email profileImage position company')
        .populate('lastMessage');

        if (existingConversation) {
          return res.status(200).json({
            success: true,
            data: existingConversation
          });
        }
      } catch (findError) {
        console.error('Error finding existing conversation:', findError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: error.message
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    // Create message
    const message = new Message({
      conversationId,
      sender: userId,
      content: content.trim(),
      messageType,
      readBy: [{
        user: userId,
        readAt: new Date()
      }]
    });

    await message.save();

    // Update conversation's last message and timestamp
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate message data for response
    await message.populate('sender', 'name profileImage');

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message
    });
  }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Soft delete all messages in the conversation
    await Message.updateMany(
      { conversationId },
      { isDeleted: true }
    );

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation',
      error: error.message
    });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        sender: userId
      },
      {
        isDeleted: true,
        content: 'This message was deleted',
        attachments: []
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};