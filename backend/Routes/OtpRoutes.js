const express = require('express');
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const Otp = require('../Models/Otp');
const Supplier = require('../Models/Supplier');
const EmailService = require('../services/EmailService');

const router = express.Router();

// POST /api/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Generate 6-digit numeric OTP
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false, digits: true });
    const otpHash = await bcrypt.hash(otp, 10);

    // Remove existing OTPs for this email
    await Otp.deleteMany({ email });

    // Save new OTP (TTL 5 minutes via schema)
    await Otp.create({ email, otpHash });

    // Send via email through service
    await EmailService.sendOtpEmail({ to: email, otp });

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('send-otp error:', err);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// POST /api/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid OTP format' });
    }

    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    const isMatch = await bcrypt.compare(otp, otpDoc.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    // Cleanup OTP after successful verification
    await Otp.deleteMany({ email });

    return res.status(200).json({ message: 'OTP verified' });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

module.exports = router;


