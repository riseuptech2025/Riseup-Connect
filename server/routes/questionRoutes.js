const express = require('express');
const {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  likeQuestion,
  bookmarkQuestion,
  addAnswer,
  likeAnswer,
  acceptAnswer,
  searchQuestions
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getQuestions);
router.get('/search', searchQuestions);
router.get('/:id', getQuestion);

// Protected routes
router.post('/', protect, createQuestion);
router.put('/:id', protect, updateQuestion);
router.delete('/:id', protect, deleteQuestion);
router.post('/:id/like', protect, likeQuestion);
router.post('/:id/bookmark', protect, bookmarkQuestion);
router.post('/:id/answers', protect, addAnswer);
router.post('/:id/answers/:answerId/like', protect, likeAnswer);
router.put('/:id/answers/:answerId/accept', protect, acceptAnswer);

module.exports = router;