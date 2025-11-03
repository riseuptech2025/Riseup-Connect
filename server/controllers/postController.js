const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, codeSnippet, image, tags, isPublic } = req.body;

    const post = await Post.create({
      user: req.user._id,
      content,
      codeSnippet,
      image,
      tags,
      isPublic
    });

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedPost,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during post creation'
    });
  }
};

// @desc    Get all posts (For You feed)
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isPublic: true })
      .populate('user', 'name avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ isPublic: true });

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get following posts
// @route   GET /api/posts/following
// @access  Private
const getFollowingPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      $or: [
        { user: { $in: currentUser.following } },
        { user: req.user._id }
      ],
      isPublic: true
    })
      .populate('user', 'name avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({
      $or: [
        { user: { $in: currentUser.following } },
        { user: req.user._id }
      ],
      isPublic: true
    });

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get following posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Like/Unlike a post
// @route   POST /api/posts/:postId/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      await Post.findByIdAndUpdate(req.params.postId, {
        $pull: { likes: req.user._id }
      });

      res.json({
        success: true,
        message: 'Post unliked successfully',
        isLiked: false
      });
    } else {
      // Like
      await Post.findByIdAndUpdate(req.params.postId, {
        $addToSet: { likes: req.user._id }
      });

      // Create notification if not the post owner
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: post.user,
          fromUser: req.user._id,
          type: 'like',
          post: post._id
        });
      }

      res.json({
        success: true,
        message: 'Post liked successfully',
        isLiked: true
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:postId/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = {
      user: req.user._id,
      content
    };

    await Post.findByIdAndUpdate(req.params.postId, {
      $push: { comments: comment }
    });

    // Create notification if not the post owner
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: post.user,
        fromUser: req.user._id,
        type: 'comment',
        post: post._id,
        comment: content
      });
    }

    const updatedPost = await Post.findById(req.params.postId)
      .populate('user', 'name avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar');

    res.json({
      success: true,
      data: updatedPost,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:postId
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await Post.findByIdAndDelete(req.params.postId);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getFollowingPosts,
  likePost,
  addComment,
  deletePost
};