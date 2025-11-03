const express = require('express');
const { createPost, getPosts, getFollowingPosts, likePost, addComment, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.get('/following', protect, getFollowingPosts);
router.post('/:postId/like', protect, likePost);
router.post('/:postId/comment', protect, addComment);
router.delete('/:postId', protect, deletePost);

module.exports = router;