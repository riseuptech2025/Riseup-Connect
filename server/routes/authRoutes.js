const express = require('express');
const { 
  sendOtp, 
  verifyOtpAndRegister, 
  resendOtp, 
  loginUser, 
  getMe 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtpAndRegister);
router.post('/resend-otp', resendOtp);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;