const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Payment = require("../Models/PaymentModel");
// Ensure referenced models are registered before populate calls
require("../Models/OrderModel");
require("../Models/CustomerModel");
const Order = require("../Models/OrderModel");
const Customer = require("../Models/CustomerModel");
const Product = require("../Models/ProductModel"); // Added Product model
const StockHistory = require("../Models/StockHistoryModel"); // Added StockHistory model
const { sendPaymentReceipt } = require("../services/emailService");

// Create a new payment
exports.createPayment = async (req, res) => {
  const errors = validationResult(req);
  console.log('[createPayment] Validation errors:', errors.array());
  if (!errors.isEmpty()) {
    console.log('[createPayment] Returning validation errors');
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const payment = await Payment.create(req.body);
    console.log('[createPayment] Payment created:', JSON.stringify(payment, null, 2));

    // If payment created, send receipt for successful and pending(COD)
    if (payment.status === "successful" || payment.paymentMethod === "cash_on_delivery") {
      // Populate the order with item details including product references
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: payment.orderId, isDeleted: false },
        { $set: { status: payment.paymentMethod === "cash_on_delivery" ? "pending" : "confirmed" } },
        { new: true } // Return updated document
      ).populate({
        path: 'items.productId',
        model: 'ProductModel'
      });
      
      console.log('[createPayment] Order updated:', JSON.stringify(updatedOrder, null, 2));
      
      // If payment is successful, decrease product quantities and ensure the customer's next cart is a fresh empty pending order
      if (payment.status === "successful" && updatedOrder) {
        console.log('[createPayment] Payment successful, decreasing product quantities for items:', JSON.stringify(updatedOrder.items, null, 2));
        // Decrease product quantities for all payment methods when payment is successful
        await decreaseProductQuantities(updatedOrder.items);
        
        const cleared = await Order.findOneAndUpdate(
          { customerId: payment.customerId, status: "pending", isDeleted: false },
          { $set: { items: [], totalAmount: 0 } },
          { new: true }
        );
        console.log('[createPayment] Customer cart cleared:', JSON.stringify(cleared, null, 2));
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
    
    // Handle specific MongoDB errors
    if (e.name === 'ValidationError') {
      const errors = Object.values(e.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors 
      });
    }
    
    if (e.code === 11000) {
      // Duplicate key error (unique constraint violation)
      const field = Object.keys(e.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists`, 
        error: e.message 
      });
    }
    
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Helper function to decrease product quantities
async function decreaseProductQuantities(items) {
  try {
    console.log('[decreaseProductQuantities] Processing items:', JSON.stringify(items, null, 2));
    
    // Process each item in the order
    for (const [index, item] of items.entries()) {
      console.log(`[decreaseProductQuantities] Processing item ${index}:`, JSON.stringify(item, null, 2));
      
      // Extract product ID and quantity (handle different possible property names)
      let productId = null;
      let purchasedQuantity = 0;
      
      // Handle different possible structures for productId
      if (item.productId && item.productId._id) {
        // If productId is populated with full product object
        productId = item.productId._id;
      } else if (item.productId) {
        // If productId is just the ID string
        productId = item.productId;
      } else if (item.product && item.product._id) {
        // If there's a separate product object
        productId = item.product._id;
      }
      
      // Handle different possible structures for quantity
      if (item.quantity !== undefined) {
        purchasedQuantity = parseFloat(item.quantity);
      } else if (item.qty !== undefined) {
        purchasedQuantity = parseFloat(item.qty);
      }
      
      console.log(`[decreaseProductQuantities] Extracted data - productId: ${productId}, purchasedQuantity: ${purchasedQuantity}`);
      
      // Validate data before processing
      if (!productId) {
        console.log(`[decreaseProductQuantities] Skipping item ${index} - No valid productId found`);
        continue;
      }
      
      if (isNaN(purchasedQuantity) || purchasedQuantity <= 0) {
        console.log(`[decreaseProductQuantities] Skipping item ${index} - Invalid quantity: ${purchasedQuantity}`);
        continue;
      }
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.log(`[decreaseProductQuantities] Skipping item ${index} - Invalid ObjectId format: ${productId}`);
        continue;
      }
      
      console.log(`[decreaseProductQuantities] Valid data found, updating product stock...`);
      
      // Get the current product before updating
      const currentProduct = await Product.findById(productId);
      if (!currentProduct) {
        console.log(`[decreaseProductQuantities] Product not found with ID: ${productId}`);
        continue;
      }
      
      const previousQuantity = currentProduct.currentStock;
      const newQuantity = previousQuantity - purchasedQuantity;
      
      // Decrease the product's current stock by the purchased quantity
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $inc: { currentStock: -Math.abs(purchasedQuantity) } }, // Ensure positive quantity
        { new: true }
      );
      
      if (updatedProduct) {
        console.log(`[decreaseProductQuantities] Product stock updated successfully:`);
        console.log(`  - Product Name: ${updatedProduct.productName}`);
        console.log(`  - Product ID: ${updatedProduct._id}`);
        console.log(`  - Old Stock: ${previousQuantity}`);
        console.log(`  - New Stock: ${updatedProduct.currentStock}`);
        console.log(`  - Quantity Decreased: ${Math.abs(purchasedQuantity)}`);
        
        // Add entry to stock history
        try {
          const historyEntry = new StockHistory({
            productName: updatedProduct.productName,
            productCode: updatedProduct.productCode,
            productImage: updatedProduct.productImage,
            category: updatedProduct.category,
            type: "sale",
            previousQuantity: previousQuantity,
            quantity: Math.abs(purchasedQuantity),
            newQuantity: updatedProduct.currentStock,
            reason: `Product sold - Order quantity: ${Math.abs(purchasedQuantity)}`
          });
          
          await historyEntry.save();
          console.log(`[decreaseProductQuantities] Stock history entry created for ${updatedProduct.productName}`);
        } catch (historyError) {
          console.error(`[decreaseProductQuantities] Failed to create stock history entry:`, historyError);
        }
      } else {
        console.log(`[decreaseProductQuantities] Product not found with ID: ${productId}`);
      }
    }
    
    console.log('[decreaseProductQuantities] Finished processing all items');
  } catch (error) {
    console.error("[decreaseProductQuantities] Error:", error);
    // Not throwing error to prevent payment failure due to stock update issues
  }
}

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
    console.log('[updatePaymentStatus] Payment status updated:', JSON.stringify(payment, null, 2));
    
    // If payment status is updated to successful, decrease product quantities
    if (status === "successful") {
      // Populate the order with item details including product references
      const order = await Order.findOne({ _id: payment.orderId, isDeleted: false }).populate({
        path: 'items.productId',
        model: 'ProductModel'
      });
      console.log('[updatePaymentStatus] Order found for stock update:', JSON.stringify(order, null, 2));
      if (order) {
        await decreaseProductQuantities(order.items);
      }
    }
    
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
