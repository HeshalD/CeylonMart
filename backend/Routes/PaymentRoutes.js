const express = require("express");
const { body, param } = require("express-validator");
const ctrl = require("../Controllers/PaymentController");

const router = express.Router();

// Create a new payment
router.post(
  "/",
  body("orderId").isMongoId(),
  body("customerId").isMongoId(),
  body("amount").isFloat({ min: 0 }),
  body("paymentMethod").isIn(["credit_card", "debit_card", "paypal", "stripe", "cash_on_delivery"]),
  body("email").optional().isEmail(),
  ctrl.createPayment
);

// Get all payments
router.get("/", ctrl.getPayments);

// Get payment by ID
router.get("/:id", param("id").isMongoId(), ctrl.getPaymentById);

// Update payment status
router.put(
  "/:id/status",
  param("id").isMongoId(),
  body("status").isIn(["pending", "successful", "failed", "refunded"]),
  ctrl.updatePaymentStatus
);

// Soft delete a payment
router.delete("/:id", param("id").isMongoId(), ctrl.deletePayment);

module.exports = router;
