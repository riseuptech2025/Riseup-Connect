const Moment = require('../models/Moment');
const User = require('../models/User');

// @desc    Create a new moment
// @route   POST /api/moments
// @access  Private
exports.createMoment = async (req, res) => {
  try {
    const { media, mediaType, caption, duration = 0 } = req.body;

    if (!media || !mediaType) {
      return res.status(400).json({
        success: false,
        message: 'Media and mediaType are required'
      });
    }

    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const moment = new Moment({
      user: req.user._id,
      media,
      mediaType,
      caption: caption?.trim(),
      duration,
      expiresAt
    });

    await moment.save();

    // Populate user data
    await moment.populate('user', 'name profileImage username');

    res.status(201).json({
      success: true,
      message: 'Moment created successfully!',
      data: moment
    });

  } catch (error) {
    console.error('Create moment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating moment',
      error: error.message
    });
  }
};

// @desc    Get moments for feed (from followed users + current user)
// @route   GET /api/moments/feed
// @access  Private
exports.getMomentsFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's following list (you'll need to implement this based on your User model)
    const currentUser = await User.findById(userId).select('following');
    const followingIds = [...(currentUser.following || []), userId];

    const moments = await Moment.find({
      user: { $in: followingIds },
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    .populate('user', 'name profileImage username')
    .populate('views.user', 'name profileImage')
    .populate('likes.user', 'name profileImage')
    .populate('comments.user', 'name profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Mark as viewed for current user
    const momentIds = moments.map(moment => moment._id);
    await Moment.updateMany(
      {
        _id: { $in: momentIds },
        'views.user': { $ne: userId }
      },
      {
        $push: {
          views: {
            user: userId,
            viewedAt: new Date()
          }
        }
      }
    );

    res.status(200).json({
      success: true,
      data: moments,
      pagination: {
        page,
        limit,
        hasMore: moments.length === limit
      }
    });

  } catch (error) {
    console.error('Get moments feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching moments',
      error: error.message
    });
  }
};

// @desc    Get user's own moments
// @route   GET /api/moments/my
// @access  Private
exports.getMyMoments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const moments = await Moment.find({
      user: req.user._id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    .populate('views.user', 'name profileImage')
    .populate('likes.user', 'name profileImage')
    .populate('comments.user', 'name profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Moment.countDocuments({
      user: req.user._id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    res.status(200).json({
      success: true,
      data: moments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get my moments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your moments',
      error: error.message
    });
  }
};

// @desc    Like/unlike a moment
// @route   POST /api/moments/:momentId/like
// @access  Private
exports.likeMoment = async (req, res) => {
  try {
    const { momentId } = req.params;
    const userId = req.user._id;

    const moment = await Moment.findById(momentId);

    if (!moment) {
      return res.status(404).json({
        success: false,
        message: 'Moment not found'
      });
    }

    const alreadyLiked = moment.likes.some(like => 
      like.user.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // Unlike
      moment.likes = moment.likes.filter(like => 
        like.user.toString() !== userId.toString()
      );
    } else {
      // Like
      moment.likes.push({
        user: userId,
        likedAt: new Date()
      });
    }

    await moment.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Moment unliked' : 'Moment liked',
      data: {
        likes: moment.likes,
        isLiked: !alreadyLiked
      }
    });

  } catch (error) {
    console.error('Like moment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking moment',
      error: error.message
    });
  }
};

// @desc    Add comment to moment
// @route   POST /api/moments/:momentId/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { momentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const moment = await Moment.findById(momentId);

    if (!moment) {
      return res.status(404).json({
        success: false,
        message: 'Moment not found'
      });
    }

    moment.comments.push({
      user: req.user._id,
      text: text.trim()
    });

    await moment.save();

    // Populate the new comment
    await moment.populate('comments.user', 'name profileImage username');

    const newComment = moment.comments[moment.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// @desc    Delete a moment
// @route   DELETE /api/moments/:momentId
// @access  Private
exports.deleteMoment = async (req, res) => {
  try {
    const { momentId } = req.params;

    const moment = await Moment.findOneAndDelete({
      _id: momentId,
      user: req.user._id
    });

    if (!moment) {
      return res.status(404).json({
        success: false,
        message: 'Moment not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Moment deleted successfully'
    });

  } catch (error) {
    console.error('Delete moment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting moment',
      error: error.message
    });
  }
};

// @desc    Get moment statistics
// @route   GET /api/moments/stats
// @access  Private
exports.getMomentStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Moment.aggregate([
      {
        $match: {
          user: userId,
          isActive: true,
          expiresAt: { $gt: new Date() }
        }
      },
      {
        $facet: {
          totalMoments: [{ $count: 'count' }],
          totalViews: [
            { $unwind: '$views' },
            { $count: 'count' }
          ],
          totalLikes: [
            { $unwind: '$likes' },
            { $count: 'count' }
          ],
          mediaTypeCount: [
            { $group: { _id: '$mediaType', count: { $count: {} } } }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalMoments: stats[0].totalMoments[0]?.count || 0,
        totalViews: stats[0].totalViews[0]?.count || 0,
        totalLikes: stats[0].totalLikes[0]?.count || 0,
        mediaTypes: stats[0].mediaTypeCount.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get moment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching moment statistics',
      error: error.message
    });
  }
};