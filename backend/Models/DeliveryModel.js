const mongoose = require("mongoose");

const DeliverySchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  status: { 
    type: String, 
    enum: ["pending", "picked", "in_transit", "delivered", "failed"], 
    default: "pending" 
  },
  pickupAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    weight: { type: Number }, // in kg
    price: { type: Number, required: true }
  }],
  totalWeight: { type: Number, required: true },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  deliveryConfirmation: {
    signature: { type: String }, // Base64 encoded signature image
    fingerprint: { type: String }, // Base64 encoded fingerprint data
    photo: { type: String }, // Base64 encoded delivery photo
    customerName: { type: String },
    deliveryNotes: { type: String },
    confirmedAt: { type: Date }
  },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
    notes: { type: String }
  }],
  customerRating: { type: Number, min: 1, max: 5 },
  customerFeedback: { type: String },
  deliveryFee: { type: Number, required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Index for better query performance
DeliverySchema.index({ driverId: 1, status: 1 });
DeliverySchema.index({ customerId: 1, status: 1 });
DeliverySchema.index({ orderId: 1 });

module.exports = mongoose.model("Delivery", DeliverySchema);
