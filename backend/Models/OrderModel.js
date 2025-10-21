const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  productName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 0.1 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  }
});

const OrderSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Customer", 
    required: true 
  },
  items: [ItemSchema], //An array of products in the order/cart
  totalAmount: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ["pending", "assigned", "picked", "in_transit", "delivered", "cancelled"], 
    default: "pending" 
  },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "debit_card", "paypal", "stripe", "cash_on_delivery"],
    required: true
  },
  district: {
    type: String,
    required: false,
    enum: ["Colombo", "Gampaha", "Kaluthara"]
  },
  email: {
    type: String,
    required: false
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    default: null
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  } //Soft delete
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
