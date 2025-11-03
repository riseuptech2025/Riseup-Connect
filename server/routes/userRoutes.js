const express = require('express');
const { getUserProfile, updateProfile, followUser, getUserPosts } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:userId', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.post('/:userId/follow', protect, followUser);
router.get('/:userId/posts', protect, getUserPosts);

module.exports = router;