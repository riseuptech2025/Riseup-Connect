const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-delete OTP after expiration
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent multiple active OTPs for same email
otpSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { isUsed: false } });

module.exports = mongoose.model('OTP', otpSchema);