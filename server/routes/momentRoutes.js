const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createMoment,
  getMomentsFeed,
  getMyMoments,
  likeMoment,
  addComment,
  deleteMoment,
  getMomentStats
} = require('../controllers/momentController');

// All routes are protected
router.use(protect);

router.post('/', createMoment);
router.get('/feed', getMomentsFeed);
router.get('/my', getMyMoments);
router.get('/stats', getMomentStats);
router.post('/:momentId/like', likeMoment);
router.post('/:momentId/comments', addComment);
router.delete('/:momentId', deleteMoment);

module.exports = router;