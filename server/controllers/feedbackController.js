const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      rating,
      mood,
      category,
      email,
      allowContact,
      isAnonymous = false
    } = req.body;

    // Validate required fields
    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and type are required fields'
      });
    }

    // Validate rating for general feedback
    if (type === 'general' && (!rating || rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating between 1-5 is required for general feedback'
      });
    }

    // Create feedback
    const feedback = new Feedback({
      user: isAnonymous ? null : req.user._id,
      type,
      title: title.trim(),
      description: description.trim(),
      rating: type === 'general' ? rating : undefined,
      mood: mood || '',
      category: category || 'suggestion',
      email: email ? email.trim().toLowerCase() : undefined,
      allowContact: !!allowContact,
      isAnonymous
    });

    await feedback.save();

    // Populate user info for response (if not anonymous)
    if (!isAnonymous) {
      await feedback.populate('user', 'name email profileImage');
    }

    // Send confirmation email if email provided
    if (email && allowContact) {
      try {
        await sendFeedbackConfirmation(email, feedback);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Notify admin about new feedback (in real app, you might want this)
    await notifyAdminAboutNewFeedback(feedback);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully!',
      data: feedback
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

// @desc    Get user's feedback history
// @route   GET /api/feedback/history
// @access  Private
exports.getFeedbackHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-adminNotes'); // Exclude admin notes from user view

    const total = await Feedback.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: feedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get feedback history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback history',
      error: error.message
    });
  }
};

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats
// @access  Private (Admin only in real app, but simplified for demo)
exports.getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          byType: [
            { $group: { _id: '$type', count: { $count: {} } } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $count: {} } } }
          ],
          byCategory: [
            { $group: { _id: '$category', count: { $count: {} } } }
          ],
          averageRating: [
            { $match: { rating: { $exists: true } } },
            { $group: { _id: null, average: { $avg: '$rating' } } }
          ],
          recentSubmissions: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                title: 1,
                type: 1,
                status: 1,
                createdAt: 1,
                rating: 1
              }
            }
          ]
        }
      }
    ]);

    // Format the response
    const formattedStats = {
      total: stats[0].totalCount[0]?.count || 0,
      byType: stats[0].byType.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byStatus: stats[0].byStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byCategory: stats[0].byCategory.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      averageRating: stats[0].averageRating[0]?.average || 0,
      recentSubmissions: stats[0].recentSubmissions
    };

    res.status(200).json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics',
      error: error.message
    });
  }
};

// @desc    Get single feedback item
// @route   GET /api/feedback/:id
// @access  Private
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'name email profileImage');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

// @desc    Update feedback (user can only update their own)
// @route   PUT /api/feedback/:id
// @access  Private
exports.updateFeedback = async (req, res) => {
  try {
    const { title, description, category, allowContact } = req.body;

    const feedback = await Feedback.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Only allow updating certain fields
    if (title) feedback.title = title.trim();
    if (description) feedback.description = description.trim();
    if (category) feedback.category = category;
    if (typeof allowContact !== 'undefined') feedback.allowContact = allowContact;

    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback',
      error: error.message
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message
    });
  }
};

// Helper function to send confirmation email
const sendFeedbackConfirmation = async (email, feedback) => {
  const subject = 'Thank You for Your Feedback!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Thank You for Your Feedback!</h2>
      <p>We've received your ${feedback.type} feedback and appreciate you taking the time to help us improve.</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Feedback Details:</h3>
        <p><strong>Type:</strong> ${feedback.type}</p>
        <p><strong>Title:</strong> ${feedback.title}</p>
        ${feedback.rating ? `<p><strong>Rating:</strong> ${feedback.rating}/5</p>` : ''}
        <p><strong>Submitted:</strong> ${new Date(feedback.createdAt).toLocaleDateString()}</p>
      </div>

      <p><strong>What happens next?</strong></p>
      <ul>
        <li>We'll review your feedback carefully</li>
        <li>You may hear from our team if we need more information</li>
        <li>We'll use your input to make improvements</li>
      </ul>

      <p>Best regards,<br>The RiseUp Connect Team</p>
    </div>
  `;

  await sendEmail(email, subject, html);
};

// Helper function to notify admin (simplified)
const notifyAdminAboutNewFeedback = async (feedback) => {
  // In a real application, you might:
  // 1. Send an email to admin
  // 2. Create a notification in admin panel
  // 3. Send to Slack/Discord webhook
  // 4. etc.
  
  console.log(`New feedback submitted: ${feedback.type} - ${feedback.title}`);
  
  // Example: You could integrate with a notification service here
  // await NotificationService.notifyAdmin('new_feedback', feedback);
};