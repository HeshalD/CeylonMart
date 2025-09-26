const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Payment = require("../Models/PaymentModel");
// Ensure referenced models are registered before populate calls
require("../Models/OrderModel");
require("../Models/CustomerModel");
const Order = require("../Models/OrderModel");
const Customer = require("../Models/CustomerModel");
const { sendPaymentReceipt } = require("../services/emailService");

// Create a new payment
exports.createPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const payment = await Payment.create(req.body);

    // If payment created, send receipt for successful and pending(COD)
    if (payment.status === "successful" || payment.paymentMethod === "cash_on_delivery") {
      await Order.findOneAndUpdate(
        { _id: payment.orderId, isDeleted: false },
        { $set: { status: payment.paymentMethod === "cash_on_delivery" ? "pending" : "confirmed" } }
      );
      // If payment is successful, ensure the customer's next cart is a fresh empty pending order
      if (payment.status === "successful") {
        const cleared = await Order.findOneAndUpdate(
          { customerId: payment.customerId, status: "pending", isDeleted: false },
          { $set: { items: [], totalAmount: 0 } },
          { new: true }
        );
        if (!cleared) {
          await Order.create({ customerId: payment.customerId, items: [], totalAmount: 0, status: "pending" });
        }
      }
      // fetch customer for email
      const customer = await Customer.findById(payment.customerId);
      const toEmail = req.body.email || customer?.email;
      if (toEmail) {
        try {
          await sendPaymentReceipt({
            toEmail,
            customerName: customer?.name,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId,
            orderId: payment.orderId
          });
        } catch (mailErr) {
          console.error("[createPayment] Receipt email failed:", mailErr);
        }
      }
    }
    res.status(201).json(payment);
  } catch (e) {
    console.error("[createPayment] Error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Get all payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ isDeleted: false })
      .populate("orderId")
      .populate("customerId");
    res.json(payments);
  } catch (e) {
    console.error("[getPayments] Error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid payment ID" });

  try {
    const payment = await Payment.findOne({ _id: id, isDeleted: false })
      .populate("orderId")
      .populate("customerId");

    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (e) {
    console.error("[getPaymentById] Error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Update payment status (e.g., from pending → successful/failed/refunded)
exports.updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid payment ID" });

  try {
    const payment = await Payment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { status } },
      { new: true }
    );

    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment status updated", payment });
  } catch (e) {
    console.error("[updatePaymentStatus] Error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Soft delete a payment
exports.deletePayment = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid payment ID" });

  try {
    const payment = await Payment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment deleted successfully", payment });
  } catch (e) {
    console.error("[deletePayment] Error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};
