const express = require('express');
const router = express.Router();
const userOTPController = require('../Controllers/UserOTPController');

// POST /api/user-otp/send - Send OTP for user registration
router.post('/send', userOTPController.sendUserOTP);

// POST /api/user-otp/verify - Verify OTP for user registration
router.post('/verify', userOTPController.verifyUserOTP);

// POST /api/user-otp/resend - Resend OTP for user registration
router.post('/resend', userOTPController.resendUserOTP);

module.exports = router;