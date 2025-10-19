const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: Number, required: true },
  licenseNumber: { type: Number, required: true, unique: true },
  vehicleType: { type: String, enum: ["car", "van", "bike", "lorry"], required: true },
  vehicleNumber: { type: String, required: true },
  capacity: { type: Number, required: true },
  district: { type: String, required: false, trim: true },
  availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
  completedDeliveries: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  status: { type: String, enum: ["active", "inactive", "on_leave"], default: "active" }
}, { timestamps: true });

module.exports = mongoose.model("Driver", DriverSchema);

