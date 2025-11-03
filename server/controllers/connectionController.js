const Connection = require('../models/Connection');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Send connection request
// @route   POST /api/connections/request/:userId
// @access  Private
const sendConnectionRequest = async (req, res) => {
  try {
    const toUser = await User.findById(req.params.userId);

    if (!toUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send connection request to yourself'
      });
    }

    // Check if connection already exists in any direction
    const existingConnection = await Connection.findOne({
      $or: [
        { fromUser: req.user._id, toUser: req.params.userId },
        { fromUser: req.params.userId, toUser: req.user._id }
      ]
    });

    if (existingConnection) {
      let message = 'Connection already exists';
      if (existingConnection.status === 'pending') {
        if (existingConnection.fromUser.toString() === req.user._id.toString()) {
          message = 'Connection request already sent';
        } else {
          message = 'This user has already sent you a connection request';
        }
      } else if (existingConnection.status === 'accepted') {
        message = 'You are already connected with this user';
      }

      return res.status(400).json({
        success: false,
        message
      });
    }

    // Create connection request
    const connection = await Connection.create({
      fromUser: req.user._id,
      toUser: req.params.userId
    });

    // Create notification
    await Notification.create({
      user: req.params.userId,
      fromUser: req.user._id,
      type: 'connection',
      message: `${req.user.name} sent you a connection request`
    });

    const populatedConnection = await Connection.findById(connection._id)
      .populate('fromUser', 'name avatar')
      .populate('toUser', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedConnection,
      message: 'Connection request sent successfully'
    });
  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Accept connection request
// @route   PUT /api/connections/accept/:connectionId
// @access  Private
const acceptConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId)
      .populate('fromUser', 'name avatar')
      .populate('toUser', 'name avatar');

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    if (connection.toUser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this connection'
      });
    }

    if (connection.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Connection already accepted'
      });
    }

    // Update connection status
    connection.status = 'accepted';
    await connection.save();

    // Add to connections list for both users
    await User.findByIdAndUpdate(connection.fromUser._id, {
      $addToSet: { connections: connection.toUser._id }
    });
    await User.findByIdAndUpdate(connection.toUser._id, {
      $addToSet: { connections: connection.fromUser._id }
    });

    // Create notification for the requester
    await Notification.create({
      user: connection.fromUser._id,
      fromUser: req.user._id,
      type: 'connection',
      message: `${req.user.name} accepted your connection request`
    });

    res.json({
      success: true,
      data: connection,
      message: 'Connection request accepted'
    });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user connections
// @route   GET /api/connections
// @access  Private
const getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('connections', 'name avatar position company location')
      .populate('followers', 'name avatar position company location')
      .populate('following', 'name avatar position company location');

    // Get pending connection requests
    const pendingRequests = await Connection.find({
      toUser: req.user._id,
      status: 'pending'
    }).populate('fromUser', 'name avatar position company location');

    res.json({
      success: true,
      data: {
        connections: user.connections || [],
        followers: user.followers || [],
        following: user.following || [],
        pendingRequests: pendingRequests || []
      }
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get suggested connections
// @route   GET /api/connections/suggestions
// @access  Private
const getSuggestedConnections = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // Get users who are not already connected, not the current user, and not already requested
    const existingConnections = currentUser.connections || [];
    const existingFollowing = currentUser.following || [];
    
    // Get users that current user has sent connection requests to
    const sentRequests = await Connection.find({
      fromUser: req.user._id,
      status: 'pending'
    }).select('toUser');
    
    const sentRequestIds = sentRequests.map(req => req.toUser.toString());
    
    // Get users that have sent connection requests to current user
    const receivedRequests = await Connection.find({
      toUser: req.user._id,
      status: 'pending'
    }).select('fromUser');
    
    const receivedRequestIds = receivedRequests.map(req => req.fromUser.toString());

    const excludedUsers = [
      req.user._id,
      ...existingConnections.map(conn => conn._id || conn),
      ...existingFollowing.map(follow => follow._id || follow),
      ...sentRequestIds,
      ...receivedRequestIds
    ];

    const suggestedUsers = await User.find({
      _id: { $nin: excludedUsers }
    })
    .select('name avatar position company location followers following')
    .limit(10);

    res.json({
      success: true,
      data: suggestedUsers
    });
  } catch (error) {
    console.error('Get suggested connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get pending connection requests
// @route   GET /api/connections/pending
// @access  Private
const getPendingRequests = async (req, res) => {
  try {
    const pendingRequests = await Connection.find({
      toUser: req.user._id,
      status: 'pending'
    }).populate('fromUser', 'name avatar position company location');

    res.json({
      success: true,
      data: pendingRequests
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  getConnections,
  getSuggestedConnections,
  getPendingRequests
};