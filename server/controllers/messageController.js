const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Create a new conversation
// @route   POST /api/messages/conversations
// @access  Private
const createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;

    console.log('Creating conversation between:', req.user._id, 'and', participantId);

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    if (participantId === req.user._id.toString()) {
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
        message: 'User not found'
      });
    }

    // Check if conversation already exists (simplified without unique constraint)
    const existingConversation = await Conversation.findOne({
      isGroup: false,
      participants: { 
        $all: [req.user._id, participantId],
        $size: 2
      }
    })
    .populate('participants', 'name avatar')
    .populate('lastMessage');

    if (existingConversation) {
      console.log('Conversation already exists:', existingConversation._id);
      return res.json({
        success: true,
        data: existingConversation,
        message: 'Conversation already exists'
      });
    }

    // Create new conversation
    const conversation = await Conversation.create({
      participants: [req.user._id, participantId],
      createdBy: req.user._id,
      isGroup: false
    });

    console.log('New conversation created:', conversation._id);

    // Populate the conversation with user data
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar')
      .populate('lastMessage');

    res.status(201).json({
      success: true,
      data: populatedConversation,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    
    // Handle duplicate key error (if unique constraint still exists)
    if (error.code === 11000) {
      // Try to find the existing conversation
      try {
        const existingConversation = await Conversation.findOne({
          participants: { $all: [req.user._id, req.body.participantId] }
        })
        .populate('participants', 'name avatar')
        .populate('lastMessage');

        if (existingConversation) {
          return res.json({
            success: true,
            data: existingConversation,
            message: 'Conversation already exists'
          });
        }
      } catch (findError) {
        console.error('Error finding existing conversation:', findError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get user conversations
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'name avatar isOnline lastSeen')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/conversations/:conversationId/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these messages'
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 }); // Return in chronological order

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages/conversations/:conversationId/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content: content.trim()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  createConversation
};