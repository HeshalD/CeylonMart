const UserOTP = require('../Models/UserOTP');
const User = require('../Models/UserModel');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const { sendEmail } = require('../utils/sendEmail');

// Development email configuration fallback
const isEmailConfigured = () => {
  return process.env.EMAIL_USER && process.env.EMAIL_PASS;
};

// Generate and send OTP for user registration
exports.sendUserOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate 6-digit OTP
    const otp = otpGenerator.generate(6, { 
      upperCaseAlphabets: false, 
      lowerCaseAlphabets: false, 
      specialChars: false, 
      digits: true 
    });

    // Hash the OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // Remove any existing OTPs for this email
    await UserOTP.deleteMany({ email });

    // Create new OTP record
    const userOTP = await UserOTP.create({
      email,
      otpCode: otp,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Send OTP via email
    if (isEmailConfigured()) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0;">CeylonMart Email Verification</h2>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px;">Hello!</p>
            <p style="color: #374151; font-size: 16px;">Thank you for registering with CeylonMart. Please verify your email address using the OTP below:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Your verification code:</p>
              <h1 style="color: #059669; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0; font-family: monospace;">${otp}</h1>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0;">
              <strong>Important:</strong> This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">CeylonMart - Your trusted e-commerce platform</p>
            </div>
          </div>
        </div>
      `;

      await sendEmail({
        to: email,
        subject: 'CeylonMart - Email Verification Code',
        html: emailHtml
      });
    } else {
      // Development mode - log OTP to console
      console.log(`\n🔐 DEVELOPMENT MODE - OTP for ${email}: ${otp}\n`);
      console.log('📧 Email configuration not set up. OTP logged to console for development.');
    }

    res.status(200).json({ 
      message: 'OTP sent successfully to your email',
      email: email,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// Verify OTP for user registration
exports.verifyUserOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find the OTP record
    const userOTPRecord = await UserOTP.findOne({ 
      email, 
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!userOTPRecord) {
      return res.status(400).json({ 
        message: 'Invalid or expired OTP. Please request a new one.' 
      });
    }

    // Check attempt limit
    if (userOTPRecord.attempts >= 3) {
      return res.status(400).json({ 
        message: 'Too many failed attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    const isValidOTP = await bcrypt.compare(otp, userOTPRecord.otpHash);
    
    if (!isValidOTP) {
      // Increment attempts
      userOTPRecord.attempts += 1;
      await userOTPRecord.save();
      
      return res.status(400).json({ 
        message: 'Invalid OTP. Please try again.',
        remainingAttempts: 3 - userOTPRecord.attempts
      });
    }

    // Mark OTP as used
    userOTPRecord.isUsed = true;
    await userOTPRecord.save();

    res.status(200).json({ 
      message: 'OTP verified successfully. You can now complete your registration.',
      email: email,
      verified: true
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP. Please try again.' });
  }
};

// Resend OTP
exports.resendUserOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Remove existing OTPs for this email
    await UserOTP.deleteMany({ email });

    // Generate new OTP
    const otp = otpGenerator.generate(6, { 
      upperCaseAlphabets: false, 
      lowerCaseAlphabets: false, 
      specialChars: false, 
      digits: true 
    });

    const otpHash = await bcrypt.hash(otp, 10);

    // Create new OTP record
    await UserOTP.create({
      email,
      otpCode: otp,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Send OTP via email
    if (isEmailConfigured()) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0;">CeylonMart - New Verification Code</h2>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px;">Hello!</p>
            <p style="color: #374151; font-size: 16px;">You requested a new verification code. Here's your new OTP:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Your new verification code:</p>
              <h1 style="color: #059669; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0; font-family: monospace;">${otp}</h1>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0;">
              <strong>Important:</strong> This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">CeylonMart - Your trusted e-commerce platform</p>
            </div>
          </div>
        </div>
      `;

      await sendEmail({
        to: email,
        subject: 'CeylonMart - New Verification Code',
        html: emailHtml
      });
    } else {
      // Development mode - log OTP to console
      console.log(`\n🔐 DEVELOPMENT MODE - New OTP for ${email}: ${otp}\n`);
      console.log('📧 Email configuration not set up. OTP logged to console for development.');
    }

    res.status(200).json({ 
      message: 'New OTP sent successfully to your email',
      email: email,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP. Please try again.' });
  }
};
