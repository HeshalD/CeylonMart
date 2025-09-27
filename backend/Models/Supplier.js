const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema(
  {
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@gmail\.com$/, 'Email must be a gmail.com address'],
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [/^0\d{9}$/, 'Phone must start with 0 and be 10 digits'],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    categories: {
      type: [String],
      default: [],
    },
    // Registration & Approval Status
    status: {
      type: String,
      enum: ['pending', 'pending approval', 'approved', 'rejected'],
      default: 'pending',
    },
    // Email OTP verification
    otpCode: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    // Optional auth password (not enforced in current flow)
    password: {
      type: String,
    },
    // Optional: simple products list to show in admin
    products: {
      type: [String],
      default: [],
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', SupplierSchema);


