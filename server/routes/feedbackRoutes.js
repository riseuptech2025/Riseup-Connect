const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  submitFeedback,
  getFeedbackHistory,
  getFeedbackStats,
  getFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controllers/feedbackController');

// All routes are protected
router.use(protect);

// Feedback routes
router.post('/', submitFeedback);
router.get('/history', getFeedbackHistory);
router.get('/stats', getFeedbackStats);
router.get('/:id', getFeedback);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

module.exports = router;