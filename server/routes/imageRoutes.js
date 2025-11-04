// routes/imageRoutes.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// @desc    Get image by path
// @route   GET /api/images/:type/:filename
// @access  Public
router.get('/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    const validTypes = ['profiles', 'covers', 'posts'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type'
      });
    }

    const imagePath = path.join(__dirname, '..', 'uploads', type, filename);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    const contentType = contentTypes[ext] || 'image/jpeg';
    
    // Set headers and send file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Image serve error:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving image'
    });
  }
});

module.exports = router;