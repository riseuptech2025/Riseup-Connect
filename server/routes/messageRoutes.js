const express = require('express');
const { 
  getConversations, 
  getMessages, 
  sendMessage, 
  createConversation 
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/conversations/:conversationId/messages', protect, getMessages);
router.post('/conversations/:conversationId/messages', protect, sendMessage);
router.post('/conversations', protect, createConversation);

module.exports = router;