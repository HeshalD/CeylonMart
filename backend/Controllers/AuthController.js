const Supplier = require('../Models/Supplier');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/sendEmail');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Register Supplier
const registerSupplier = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);

  // Validate email and phone formats
  const gmailRegex = /^\S+@gmail\.com$/;
  const phoneRegex = /^0\d{9}$/;
  const strongPasswordRegex = /^(?=.*[A-Z]).{8,}$/; // at least 8 chars and one uppercase

  if (!gmailRegex.test(String(req.body.email || ''))) {
    return res.status(400).json({ message: 'Email must be a gmail.com address' });
  }
  if (req.body.phone && !phoneRegex.test(String(req.body.phone))) {
    return res.status(400).json({ message: 'Phone must start with 0 and be 10 digits' });
  }

  // Check if email or phone already exists
  const existingSupplier = await Supplier.findOne({ $or: [{ email: req.body.email }, { phone: req.body.phone }] });
  if (existingSupplier) {
    const field = existingSupplier.email === req.body.email ? 'Email' : 'Phone number';
    return res.status(409).json({ message: `${field} already exists` });
  }

    // Generate 6-digit OTP and expiry (10 minutes)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Optional password collection during auth/register
    const { password, confirmPassword } = req.body || {};
    let passwordHash;
  if (password || confirmPassword) {
      if (!password || !confirmPassword) {
        return res.status(400).json({ message: 'Both password and confirmPassword are required' });
      }
    if (!strongPasswordRegex.test(String(password))) {
      return res.status(400).json({ message: 'Password must be at least 8 characters and include one uppercase letter' });
    }
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }
      // Store bcrypt(SHA-256(password)) so that client-side hashed logins work
      const sha256Hex = crypto.createHash('sha256').update(password).digest('hex');
      passwordHash = await bcrypt.hash(sha256Hex, 10);
    }

    // Create supplier with pending status and OTP details
    const supplierData = {
      ...req.body,
      ...(passwordHash ? { password: passwordHash } : {}),
      status: 'pending',
      otpCode,
      otpExpiresAt,
      isOtpVerified: false,
    };

    const supplier = await Supplier.create(supplierData);
    console.log('Supplier created:', supplier.email);

    // Send OTP email
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify your email</h2>
        <p>Hi ${supplier.contactName || 'Supplier'},</p>
        <p>Your One-Time Password (OTP) for verifying your email is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otpCode}</p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr />
        <p>CeylonMart</p>
      </div>
    `;

    try {
      await sendEmail({
        to: supplier.email,
        subject: 'CeylonMart - Verify your email (OTP)',
        text: `Your OTP is ${otpCode}. It expires in 10 minutes.`,
        html,
      });
      return res.status(201).json({
        message: 'Registration successful. OTP sent to your email.',
        supplierId: supplier._id,
        ...(process.env.NODE_ENV !== 'production' ? { devOtp: otpCode } : {}),
      });
    } catch (emailErr) {
      console.error('Failed to send OTP email:', emailErr);
      // Do not delete the supplier; allow user to resend OTP later
      return res.status(201).json({
        message: 'Registration successful, but sending OTP failed. Use Resend OTP.',
        supplierId: supplier._id,
        warning: 'email_send_failed',
        ...(process.env.NODE_ENV !== 'production' ? { devOtp: otpCode } : {}),
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    return res.status(400).json({ message: error.message });
  }
};

// Verify OTP (Demo - in real app, verify actual OTP)
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Basic format validation
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid OTP format' });
    }

    // Find supplier by email
    const supplier = await Supplier.findOne({ email });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check OTP and expiry
    if (!supplier.otpCode || !supplier.otpExpiresAt) {
      return res.status(400).json({ message: 'No OTP found. Please register again.' });
    }

    if (new Date() > new Date(supplier.otpExpiresAt)) {
      return res.status(400).json({ message: 'OTP expired. Please register again.' });
    }

    if (supplier.otpCode !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Mark OTP as verified; keep status pending until admin approval
    supplier.isOtpVerified = true;
    supplier.status = 'pending';
    supplier.otpCode = undefined;
    supplier.otpExpiresAt = undefined;
    await supplier.save();

    return res.status(200).json({
      message: 'OTP verified successfully. Your account is pending admin approval.'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Login Supplier
const loginSupplier = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find supplier by email
    const supplier = await Supplier.findOne({ email });
    if (!supplier) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Verify password if a password hash is set for this supplier
    if (supplier.password) {
      if (!password) {
        return res.status(400).json({ message: 'Password is required' });
      }
      // Support both client-hashed (SHA-256 hex) and plaintext inputs for compatibility
      const incomingIsSha256Hex = typeof password === 'string' && /^[a-f0-9]{64}$/i.test(password);
      const normalizedSha256 = incomingIsSha256Hex
        ? password
        : crypto.createHash('sha256').update(String(password)).digest('hex');

      let ok = await bcrypt.compare(normalizedSha256, supplier.password);
      if (!ok && !incomingIsSha256Hex) {
        // Fallback for legacy accounts stored as bcrypt(plaintext)
        ok = await bcrypt.compare(String(password), supplier.password);
      }
      if (!ok) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    // Check supplier status
    if (supplier.status !== 'approved') {
      return res.status(403).json({ 
        message: 'Your account is pending admin approval.' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        supplierId: supplier._id, 
        email: supplier.email,
        role: 'supplier'
      },
      'your-secret-key', // In production, use environment variable
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      supplier: {
        _id: supplier._id,
        companyName: supplier.companyName,
        contactName: supplier.contactName,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        categories: supplier.categories,
        status: supplier.status
      },
      role: 'supplier'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Admin Login (Demo)
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Demo admin credentials
    if (email === 'ann03@gmail.com' && password === 'lamann01') {
      const token = jwt.sign(
        { 
          adminId: 'admin123',
          email: email,
          role: 'admin'
        },
        'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        message: 'Admin login successful',
        token,
        supplier: {
          _id: 'admin123',
          company: 'CeylonMart Admin',
          name: 'Admin User',
          email: email,
          status: 'approved'
        },
        role: 'admin'
      });
    }

    res.status(401).json({ message: 'Invalid admin credentials' });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get Current Supplier Profile
const getProfile = async (req, res) => {
  try {
    // For demo purposes, we'll get the supplier ID from query params
    // In a real app, you would verify the JWT token here
    const supplierId = req.query.supplierId;
    
    if (!supplierId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json(supplier);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerSupplier,
  verifyOTP,
  loginSupplier,
  loginAdmin,
  getProfile
};
