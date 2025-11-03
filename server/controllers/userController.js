const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get user profile
// @route   GET /api/users/:userId
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar')
      .populate('connections', 'name avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile is private and user is not following
    if (user.isPrivate && 
        !user.followers.includes(req.user._id) && 
        !user.connections.includes(req.user._id) &&
        user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// @desc    Follow/Unfollow user
// @route   POST /api/users/:userId/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: userToFollow._id }
      });
      await User.findByIdAndUpdate(userToFollow._id, {
        $pull: { followers: req.user._id }
      });

      res.json({
        success: true,
        message: 'User unfollowed successfully',
        isFollowing: false
      });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { following: userToFollow._id }
      });
      await User.findByIdAndUpdate(userToFollow._id, {
        $addToSet: { followers: req.user._id }
      });

      res.json({
        success: true,
        message: 'User followed successfully',
        isFollowing: true
      });
    }
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user posts
// @route   GET /api/users/:userId/posts
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'name avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  followUser,
  getUserPosts
};