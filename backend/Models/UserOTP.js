const mongoose = require('mongoose');

const userOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  otpCode: {
    type: String,
    required: true
  },
  otpHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    index: { expireAfterSeconds: 0 } // Auto-delete expired documents
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3 // Maximum 3 attempts
  }
}, {
  timestamps: true
});

// Index for efficient queries
userOTPSchema.index({ email: 1, expiresAt: 1 });
userOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('UserOTP', userOTPSchema);