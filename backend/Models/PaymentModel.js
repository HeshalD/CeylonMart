const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "debit_card", "paypal", "stripe", "cash_on_delivery"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "successful", "failed", "refunded"],
    default: "pending"
  },
  transactionId: {
    type: String,
    required: true, // Required for all payments
    unique: true,
    sparse: true
  },
  isDeleted: {
    type: Boolean,
    default: false // Soft delete for failed/expired payments
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);
