const Supplier = require('../Models/Supplier');
const { sendEmail } = require('../utils/sendEmail');
const bcrypt = require('bcrypt');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register Supplier: create pending supplier and send OTP
const registerSupplier = async (req, res) => {
  try {
    const { companyName, contactName, email, phone, address, categories, password } = req.body;

    // Validate email, phone, and password strength
    const gmailRegex = /^\S+@gmail\.com$/;
    const phoneRegex = /^0\d{9}$/;
    const strongPasswordRegex = /^(?=.*[A-Z]).{8,}$/; // at least 8 chars and one uppercase

    if (!gmailRegex.test(String(email || ''))) {
      return res.status(400).json({ message: 'Email must be a gmail.com address' });
    }
    if (!phoneRegex.test(String(phone || ''))) {
      return res.status(400).json({ message: 'Phone must start with 0 and be 10 digits' });
    }

    const existing = await Supplier.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Phone number';
      return res.status(400).json({ message: `${field} already exists` });
    }

    // Optional password setup at registration time
    let passwordHash = undefined;
    if (password) {
      if (!strongPasswordRegex.test(String(password))) {
        return res.status(400).json({ message: 'Password must be at least 8 characters and include one uppercase letter' });
      }
      passwordHash = await bcrypt.hash(password, 10);
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 100 * 60 * 1000); // 10 minutes

    const supplier = await Supplier.create({
      companyName,
      contactName,
      email,
      phone,
      address,
      categories,
      status: 'pending',
      otpCode: otp,
      otpExpiresAt,
      isOtpVerified: false,
      ...(passwordHash ? { password: passwordHash } : {}),
    });

    await sendEmail({
      to: email,
      subject: 'Your Supplier Registration OTP',
      text: `Your OTP is ${otp}. It will expire in 10 minutes`,
      html: `<p>Your OTP is <b>${otp}</b>. It will expire in 10 minutes.</p>`,
    });

    return res.status(201).json({ _id: supplier._id, email: supplier.email });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp, supplierId } = req.body;
    const supplier = supplierId
      ? await Supplier.findById(supplierId)
      : await Supplier.findOne({ email });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    if (supplier.isOtpVerified) {
      return res.status(400).json({ message: 'OTP already verified' });
    }

    if (!supplier.otpCode || !supplier.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP not generated' });
    }

    if (new Date() > supplier.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (supplier.otpCode !== String(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    supplier.isOtpVerified = true;
    supplier.status = 'pending approval';
    supplier.otpCode = undefined;
    supplier.otpExpiresAt = undefined;
    await supplier.save();

    return res.status(200).json({ message: 'OTP verified', supplierId: supplier._id });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Get all Suppliers
const getSuppliers = async (_req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    return res.status(200).json(suppliers);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch suppliers' });
  }
};

// Get single Supplier by ID
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    return res.status(200).json(supplier);
  } catch (_error) {
    return res.status(400).json({ message: 'Invalid supplier id' });
  }
};

// Update Supplier by ID
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Supplier.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Supplier not found' });
    return res.status(200).json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    return res.status(400).json({ message: error.message });
  }
};

// Update Supplier Status by ID
const updateSupplierStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'pending approval', 'approved', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updated = await Supplier.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true, runValidators: true }
    );
    
    if (!updated) return res.status(404).json({ message: 'Supplier not found' });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Approve Supplier
const approveSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Supplier.findByIdAndUpdate(
      id, 
      { status: 'approved' }, 
      { new: true, runValidators: true }
    );
    
    if (!updated) return res.status(404).json({ message: 'Supplier not found' });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Reject Supplier
const rejectSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Supplier.findByIdAndUpdate(
      id, 
      { status: 'rejected' }, 
      { new: true, runValidators: true }
    );
    
    if (!updated) return res.status(404).json({ message: 'Supplier not found' });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Get current supplier profile (for authenticated supplier)
const getCurrentSupplier = async (req, res) => {
  try {
    const supplierId = req.user.supplierId; // From JWT token
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    return res.status(200).json(supplier);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Delete Supplier by ID
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Supplier.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Supplier not found' });
    return res.status(200).json({ message: 'Supplier deleted' });
  } catch (_error) {
    return res.status(400).json({ message: 'Invalid supplier id' });
  }
};

module.exports = {
  registerSupplier,
  verifyOtp,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  updateSupplierStatus,
  approveSupplier,
  rejectSupplier,
  getCurrentSupplier,
  deleteSupplier,
};


