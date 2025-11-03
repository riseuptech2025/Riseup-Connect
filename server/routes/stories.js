// routes/stories.js
const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const User = require('../models/User'); // Add this import
const { protect } = require('../middleware/authMiddleware'); // Make sure this matches your export

// @route   GET /api/stories
// @desc    Get all stories (with pagination and filtering)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const category = req.query.category;
    const tag = req.query.tag;
    const search = req.query.search;

    let query = { isPublished: true };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    // Search in title and content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const stories = await Story.find(query)
      .populate('author', 'name avatar bio')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Story.countDocuments(query);

    res.json({
      success: true,
      data: stories,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/stories/following
// @desc    Get stories from followed users
// @access  Private
router.get('/following', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const stories = await Story.find({
      author: { $in: user.following },
      isPublished: true
    })
      .populate('author', 'name avatar bio')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Story.countDocuments({
      author: { $in: user.following },
      isPublished: true
    });

    res.json({
      success: true,
      data: stories,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching following stories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/stories/user/:userId
// @desc    Get stories by specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const stories = await Story.find({
      author: req.params.userId,
      isPublished: true
    })
      .populate('author', 'name avatar bio')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Story.countDocuments({
      author: req.params.userId,
      isPublished: true
    });

    res.json({
      success: true,
      data: stories,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/stories/:id
// @desc    Get single story
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate('comments.user', 'name avatar')
      .populate('likes', 'name avatar');

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/stories
// @desc    Create a new story
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, tags, category, featuredImage } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const story = new Story({
      title,
      content,
      tags: tags || [],
      category: category || 'other',
      featuredImage,
      author: req.user.id
    });

    await story.save();
    await story.populate('author', 'name avatar bio');

    res.status(201).json({
      success: true,
      data: story,
      message: 'Story created successfully'
    });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/stories/:id
// @desc    Update a story
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, tags, category, featuredImage } = req.body;

    let story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if user owns the story
    if (story.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this story'
      });
    }

    story = await Story.findByIdAndUpdate(
      req.params.id,
      {
        title: title || story.title,
        content: content || story.content,
        tags: tags || story.tags,
        category: category || story.category,
        featuredImage: featuredImage !== undefined ? featuredImage : story.featuredImage
      },
      { new: true, runValidators: true }
    ).populate('author', 'name avatar bio')
     .populate('comments.user', 'name avatar');

    res.json({
      success: true,
      data: story,
      message: 'Story updated successfully'
    });
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/stories/:id
// @desc    Delete a story
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if user owns the story
    if (story.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this story'
      });
    }

    await Story.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/stories/:id/like
// @desc    Like/unlike a story
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    const isLiked = story.likes.includes(req.user.id);

    if (isLiked) {
      // Unlike
      story.likes = story.likes.filter(
        like => like.toString() !== req.user.id
      );
    } else {
      // Like
      story.likes.push(req.user.id);
    }

    await story.save();

    res.json({
      success: true,
      data: {
        likes: story.likes,
        likeCount: story.likes.length
      },
      isLiked: !isLiked,
      message: isLiked ? 'Story unliked' : 'Story liked'
    });
  } catch (error) {
    console.error('Error liking story:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/stories/:id/comments
// @desc    Add comment to story
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    const comment = {
      user: req.user.id,
      content
    };

    story.comments.push(comment);
    await story.save();

    // Populate the new comment
    await story.populate('comments.user', 'name avatar');

    const newComment = story.comments[story.comments.length - 1];

    res.status(201).json({
      success: true,
      data: newComment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/stories/:id/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    const comment = story.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user owns the comment or is the story author
    if (comment.user.toString() !== req.user.id && story.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    comment.remove();
    await story.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/stories/categories/all
// @desc    Get all categories
// @access  Public
router.get('/categories/all', async (req, res) => {
  try {
    const categories = [
      { value: 'coding', label: 'Coding', count: await Story.countDocuments({ category: 'coding', isPublished: true }) },
      { value: 'career', label: 'Career', count: await Story.countDocuments({ category: 'career', isPublished: true }) },
      { value: 'learning', label: 'Learning', count: await Story.countDocuments({ category: 'learning', isPublished: true }) },
      { value: 'project', label: 'Project', count: await Story.countDocuments({ category: 'project', isPublished: true }) },
      { value: 'experience', label: 'Experience', count: await Story.countDocuments({ category: 'experience', isPublished: true }) },
      { value: 'tips', label: 'Tips & Tricks', count: await Story.countDocuments({ category: 'tips', isPublished: true }) },
      { value: 'other', label: 'Other', count: await Story.countDocuments({ category: 'other', isPublished: true }) }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;