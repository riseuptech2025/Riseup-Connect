const Question = require('../models/Question');
const asyncHandler = require('express-async-handler');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
const getQuestions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filter = req.query.filter || 'all';
  const userId = req.user?._id;

  const result = await Question.getQuestions(page, limit, filter, userId);

  res.json({
    success: true,
    data: result
  });
});

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
const getQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id)
    .populate('user', 'name avatar')
    .populate('answers.user', 'name avatar')
    .populate('likes', 'name')
    .populate('bookmarks', 'name');

  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }

  // Increment view count
  question.views += 1;
  await question.save();

  // Add computed fields for the requesting user
  if (req.user) {
    question._doc.isLiked = question.isLikedBy(req.user._id);
    question._doc.isBookmarked = question.isBookmarkedBy(req.user._id);
    
    // Check if user liked each answer
    question.answers.forEach(answer => {
      answer._doc.isLiked = answer.likes.includes(req.user._id);
    });
  }

  res.json({
    success: true,
    data: question
  });
});

// @desc    Create new question
// @route   POST /api/questions
// @access  Private
const createQuestion = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Title and content are required'
    });
  }

  const question = await Question.create({
    title,
    content,
    tags: tags || [],
    user: req.user._id
  });

  await question.populate('user', 'name avatar');

  res.status(201).json({
    success: true,
    data: question
  });
});

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private
const updateQuestion = asyncHandler(async (req, res) => {
  let question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }

  // Check if user owns the question
  if (question.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this question'
    });
  }

  question = await Question.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'name avatar');

  res.json({
    success: true,
    data: question
  });
});

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }

  // Check if user owns the question
  if (question.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this question'
    });
  }

  await Question.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Question deleted successfully'
  });
});

// @desc    Like/Unlike question
// @route   POST /api/questions/:id/like
// @access  Private
const likeQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }

  const hasLiked = question.likes.includes(req.user._id);

  if (hasLiked) {
    // Unlike
    question.likes.pull(req.user._id);
  } else {
    // Like
    question.likes.push(req.user._id);
  }

  await question.save();

  res.json({
    success: true,
    data: {
      likes: question.likes.length,
      isLiked: !hasLiked
    }
  });
});

// @desc    Bookmark/Unbookmark question
// @route   POST /api/questions/:id/bookmark
// @access  Private
const bookmarkQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }

  const hasBookmarked = question.bookmarks.includes(req.user._id);

  if (hasBookmarked) {
    // Remove bookmark
    question.bookmarks.pull(req.user._id);
  } else {
    // Add bookmark
    question.bookmarks.push(req.user._id);
  }

  await question.save();

  res.json({
    success: true,
    data: {
      isBookmarked: !hasBookmarked
    }
  });
});

// @desc    Add answer to question
// @route   POST /api/questions/:id/answers
// @access  Private
const addAnswer = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      message: 'Answer content is required'
    });
  }

  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }

  const answer = {
    content,
    user: req.user._id
  };

  question.answers.push(answer);
  await question.save();

  // Populate the newly added answer
  await question.populate('answers.user', 'name avatar');

  const newAnswer = question.answers[question.answers.length - 1];

  res.status(201).json({
    success: true,
    data: newAnswer
  });
});

// @desc    Like/Unlike answer
// @route   POST /api/questions/:id/answers/:answerId/like
// @access  Private
const likeAnswer = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }

  const answer = question.answers.id(req.params.answerId);

  if (!answer) {
    return res.status(404).json({
      success: false,
      message: 'Answer not found'
    });
  }

  const hasLiked = answer.likes.includes(req.user._id);

  if (hasLiked) {
    // Unlike
    answer.likes.pull(req.user._id);
  } else {
    // Like
    answer.likes.push(req.user._id);
  }

  await question.save();

  res.json({
    success: true,
    data: {
      likes: answer.likes.length,
      isLiked: !hasLiked
    }
  });
});

// @desc    Accept answer
// @route   PUT /api/questions/:id/answers/:answerId/accept
// @access  Private
const acceptAnswer = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }

  // Check if user owns the question
  if (question.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to accept answers for this question'
    });
  }

  const answer = question.answers.id(req.params.answerId);

  if (!answer) {
    return res.status(404).json({
      success: false,
      message: 'Answer not found'
    });
  }

  // Unaccept all other answers first
  question.answers.forEach(ans => {
    ans.isAccepted = false;
  });

  // Accept this answer
  answer.isAccepted = true;
  question.isAnswered = true;

  await question.save();

  res.json({
    success: true,
    data: answer
  });
});

// @desc    Search questions
// @route   GET /api/questions/search
// @access  Public
const searchQuestions = asyncHandler(async (req, res) => {
  const { q, tag, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  let query = {};

  if (q) {
    query.$text = { $search: q };
  }

  if (tag) {
    query.tags = { $in: [new RegExp(tag, 'i')] };
  }

  const questions = await Question.find(query)
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Question.countDocuments(query);

  // Add computed fields for the requesting user
  if (req.user) {
    questions.forEach(question => {
      question.isLiked = question.likes.includes(req.user._id);
      question.isBookmarked = question.bookmarks.includes(req.user._id);
    });
  }

  res.json({
    success: true,
    data: {
      questions,
      pagination: {
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalQuestions: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

module.exports = {
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
};