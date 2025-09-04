const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true, minlength: 8 },

    role: {
      type: String,
      enum: [
        "shop_owner",
        "customer",
        "supplier_admin",
        "inventory_manager",
        "delivery_admin",
        "admin",
      ],
      default: "customer",
    },

    phone: String,
    address: String,

    // Optional fields based on roles
    shop_name: String,       // shop_owner
    company_name: String,    // supplier_admin
    managedItems: [String],  // inventory_manager
    deliveryAreas: [String], // delivery_admin

    // New features
    isVerified: {
      type: Boolean,
      default: true, // Set to false if you want email/OTP verification in future
    },

    resetToken: String,         // For password reset (stores unique token)
    resetTokenExpire: Date,     // Expiry time for reset token
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
