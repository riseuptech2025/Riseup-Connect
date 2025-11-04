// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const {
  uploadProfileImage,
  uploadCoverImage,
  removeProfileImage,
  removeCoverImage
} = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.post('/profile-image', protect, upload.single('profileImage'), uploadProfileImage);
router.post('/cover-image', protect, upload.single('coverImage'), uploadCoverImage);
router.delete('/profile-image', protect, removeProfileImage);
router.delete('/cover-image', protect, removeCoverImage);

module.exports = router;