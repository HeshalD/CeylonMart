const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  preferredDeliveryTime: { type: String }, // e.g., "morning", "afternoon", "evening"
  notes: { type: String },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Index for better query performance
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ 'address.district': 1 });
CustomerSchema.index({ status: 1 });

module.exports = mongoose.model("Customer", CustomerSchema);
