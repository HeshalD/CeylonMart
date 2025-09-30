const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: Number, required: true },
  licenseNumber: { type: Number, required: true, unique: true },
  vehicleType: { type: String, enum: ["car", "van", "bike", "lorry"], required: true },
  vehicleNumber: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1 }, // Vehicle capacity in kg or items
  status: { type: String, enum: ["active", "inactive", "on_leave"], default: "active" },
  availability: { type: String, enum: ["available", "unavailable", "busy"], default: "available" },
  district: { 
    type: String, 
    required: true,
    enum: ['Colombo', 'Gampaha', 'Kalutara'],
    message: 'District must be one of: Colombo, Gampaha, Kalutara'
  }, // District where driver operates (Western Province only)
  currentDelivery: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery", default: null },
  totalDeliveries: { type: Number, default: 0 },
  completedDeliveries: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  isDeleted: { type: Boolean, default: false } 
}, { timestamps: true });

module.exports = mongoose.model("Driver", DriverSchema);

