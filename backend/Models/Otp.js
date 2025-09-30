const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 }, // 5 minutes TTL
  },
  { timestamps: false }
);

module.exports = mongoose.model('Otp', OtpSchema);


