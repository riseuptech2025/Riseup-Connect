// controllers/uploadController.js
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Upload profile image
// @route   POST /api/upload/profile-image
// @access  Private
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const user = await User.findById(req.user._id);
    
    // Delete old profile image if exists
    if (user.avatar && user.avatar !== '') {
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'profiles', path.basename(user.avatar));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new image path
    user.avatar = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      data: {
        avatar: user.avatar
      },
      message: 'Profile image updated successfully'
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload'
    });
  }
};

// @desc    Upload cover image
// @route   POST /api/upload/cover-image
// @access  Private
const uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const user = await User.findById(req.user._id);
    
    // Delete old cover image if exists
    if (user.coverImage && user.coverImage !== '') {
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'covers', path.basename(user.coverImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new cover image path
    user.coverImage = `/uploads/covers/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      data: {
        coverImage: user.coverImage
      },
      message: 'Cover image updated successfully'
    });
  } catch (error) {
    console.error('Upload cover image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload'
    });
  }
};

// @desc    Remove profile image
// @route   DELETE /api/upload/profile-image
// @access  Private
const removeProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.avatar && user.avatar !== '') {
      // Delete the image file
      const imagePath = path.join(__dirname, '..', 'uploads', 'profiles', path.basename(user.avatar));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      // Remove image reference from user
      user.avatar = '';
      await user.save();
    }

    res.json({
      success: true,
      message: 'Profile image removed successfully'
    });
  } catch (error) {
    console.error('Remove profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image removal'
    });
  }
};

// @desc    Remove cover image
// @route   DELETE /api/upload/cover-image
// @access  Private
const removeCoverImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.coverImage && user.coverImage !== '') {
      // Delete the image file
      const imagePath = path.join(__dirname, '..', 'uploads', 'covers', path.basename(user.coverImage));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      // Remove image reference from user
      user.coverImage = '';
      await user.save();
    }

    res.json({
      success: true,
      message: 'Cover image removed successfully'
    });
  } catch (error) {
    console.error('Remove cover image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image removal'
    });
  }
};

module.exports = {
  uploadProfileImage,
  uploadCoverImage,
  removeProfileImage,
  removeCoverImage
};