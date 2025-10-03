const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const driverSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ["car", "van", "bike", "lorry"]
  },
  vehicleNumber: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true
  },
  district: {
    type: String,
    required: false,
    trim: true
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  completedDeliveries: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Driver", driverSchema);

