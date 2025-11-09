const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  markAsRead,
  deleteConversation,
  deleteMessage
} = require('../controllers/messageController');

// All routes are protected
router.use(protect);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.delete('/conversations/:conversationId', deleteConversation);

// Message routes
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.put('/conversations/:conversationId/read', markAsRead);
router.delete('/messages/:messageId', deleteMessage);

module.exports = router;