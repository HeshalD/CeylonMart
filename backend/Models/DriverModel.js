const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: Number, required: true },
  licenseNumber: { type: Number, required: true, unique: true },
  vehicleType: { type: String, enum: ["car", "van"], required: true },
  vehicleNumber: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive", "on_leave"], default: "active" },
  isDeleted: { type: Boolean, default: false } 
}, { timestamps: true });

module.exports = mongoose.model("Driver", DriverSchema);

