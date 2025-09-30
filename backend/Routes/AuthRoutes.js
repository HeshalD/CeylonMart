const express = require('express');
const {
  registerSupplier,
  verifyOTP,
  loginSupplier,
  loginAdmin,
  getProfile
} = require('../Controllers/AuthController');

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerSupplier);

// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOTP);

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email } = req.body;
  
  // Check if it's admin login
  if (email === 'ann03@gmail.com') {
    return loginAdmin(req, res);
  }
  
  // Otherwise, it's supplier login
  return loginSupplier(req, res);
});

// GET /api/auth/profile (expects supplierId via query in this demo)
router.get('/profile', getProfile);

// POST /api/auth/resend-otp (optional utility)
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const supplier = await require('../Models/Supplier').findOne({ email });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    supplier.otpCode = otpCode;
    supplier.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await supplier.save();

    const { sendEmail } = require('../utils/sendEmail');
    await sendEmail({
      to: supplier.email,
      subject: 'CeylonMart - Resend OTP',
      text: `Your OTP is ${otpCode}. It expires in 10 minutes.`,
      html: `<p>Your OTP is <b>${otpCode}</b>. It expires in 10 minutes.</p>`,
    });

    return res.status(200).json({ message: 'OTP resent successfully' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({ message: 'Failed to resend OTP' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find supplier by email
    const supplier = await require('../Models/Supplier').findOne({ email });
    if (!supplier) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }
    
    // Generate reset token (OTP for simplicity)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Save reset token to supplier
    supplier.otpCode = resetToken;
    supplier.otpExpiresAt = resetTokenExpiry;
    await supplier.save();
    
    // Send reset email
    const { sendEmail } = require('../utils/sendEmail');
    await sendEmail({
      to: supplier.email,
      subject: 'CeylonMart - Password Reset',
      text: `Your password reset code is ${resetToken}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Password Reset</h2>
          <p>Hi ${supplier.contactName || 'Supplier'},</p>
          <p>Your password reset code is:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${resetToken}</p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <hr />
          <p>CeylonMart</p>
        </div>
      `,
    });
    
    return res.status(200).json({ message: 'Password reset code sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Failed to process password reset request' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    // Validate inputs
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }
    
    // Find supplier by email
    const supplier = await require('../Models/Supplier').findOne({ email });
    if (!supplier) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    // Check OTP and expiry
    if (!supplier.otpCode || !supplier.otpExpiresAt) {
      return res.status(400).json({ message: 'No reset code found. Please request a new one.' });
    }
    
    if (new Date() > new Date(supplier.otpExpiresAt)) {
      return res.status(400).json({ message: 'Reset code expired. Please request a new one.' });
    }
    
    if (supplier.otpCode !== otp) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }
    
    // Hash the new password
    const crypto = require('crypto');
    const bcrypt = require('bcrypt');
    const sha256Hex = crypto.createHash('sha256').update(newPassword).digest('hex');
    const passwordHash = await bcrypt.hash(sha256Hex, 10);
    
    // Update supplier password and clear OTP
    supplier.password = passwordHash;
    supplier.otpCode = undefined;
    supplier.otpExpiresAt = undefined;
    await supplier.save();
    
    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
});

module.exports = router;