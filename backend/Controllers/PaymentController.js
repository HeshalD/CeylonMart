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
  console.log('[createPayment] Request body:', JSON.stringify(req.body, null, 2));
  if (!errors.isEmpty()) {
    console.log('[createPayment] Returning validation errors');
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('[createPayment] Creating payment with data:', JSON.stringify(req.body, null, 2));
    const payment = await Payment.create(req.body);
    console.log('[createPayment] Payment created:', JSON.stringify(payment, null, 2));

    // For all payment methods, update the order status to pending
    // Use runValidators: false to avoid triggering validation that requires email, district, and paymentMethod
    console.log('[createPayment] Updating order with ID:', payment.orderId);
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: payment.orderId, isDeleted: false },
      { $set: { status: "pending" } }, // All payments should start with pending status
      { new: true, runValidators: false } // Disable validation to prevent errors
    ).populate({
      path: 'items.productId',
      model: 'ProductModel'
    });
    
    console.log('[createPayment] Order updated:', JSON.stringify(updatedOrder, null, 2));
    console.log('[createPayment] Order items:', JSON.stringify(updatedOrder?.items, null, 2));
    if (!updatedOrder) {
      console.log('[createPayment] Failed to find order with ID:', payment.orderId);
      throw new Error('Order not found');
    }
    
    // For successful payments, decrease product quantities immediately
    if (payment.status === "successful") {
      console.log('[createPayment] Payment successful, decreasing product quantities');
      console.log('[createPayment] Updated order:', JSON.stringify(updatedOrder, null, 2));
      if (updatedOrder && updatedOrder.items) {
        console.log('[createPayment] Decreasing product quantities for items:', JSON.stringify(updatedOrder.items, null, 2));
        // Decrease product quantities for successful payments
        console.log('[createPayment] Calling decreaseProductQuantities function');
        await decreaseProductQuantities(updatedOrder.items);
        console.log('[createPayment] Finished calling decreaseProductQuantities function');
      } else {
        console.log('[createPayment] No items found in updated order');
      }
      
      const cleared = await Order.findOneAndUpdate(
        { customerId: payment.customerId, status: "pending", isDeleted: false },
        { $set: { items: [], totalAmount: 0 } },
        { new: true }
      );
      console.log('[createPayment] Customer cart cleared:', JSON.stringify(cleared, null, 2));
      if (!cleared) {
        await Order.create({ customerId: payment.customerId, items: [], totalAmount: 0, status: "pending" });
      }
    } else {
      console.log('[createPayment] Payment not successful, skipping quantity decrease. Status:', payment.status);
    }
    
    // Send email receipt for successful payments or COD
    if (payment.status === "successful" || payment.paymentMethod === "cash_on_delivery") {
      console.log('[createPayment] Sending email receipt for payment:', payment._id);
      // fetch customer for email
      const customer = await Customer.findById(payment.customerId);
      console.log('[createPayment] Customer found:', customer?._id);
      const toEmail = req.body.email || customer?.email;
      console.log('[createPayment] Email address:', toEmail);
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
          console.log('[createPayment] Email receipt sent successfully');
        } catch (mailErr) {
          console.error("[createPayment] Receipt email failed:", mailErr);
        }
      }
    }
    
    console.log('[createPayment] Sending response with payment:', payment._id);
    res.status(201).json(payment);
    console.log('[createPayment] Response sent successfully');
  } catch (e) {
    console.error("[createPayment] Error:", e);
    console.error("[createPayment] Error stack:", e.stack);
    console.error("[createPayment] Error name:", e.name);
    console.error("[createPayment] Error message:", e.message);
    console.error("[createPayment] Error code:", e.code);
    
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
  console.log('[decreaseProductQuantities] Function called');
  try {
    console.log('[decreaseProductQuantities] Processing items:', JSON.stringify(items, null, 2));
    if (!items || !Array.isArray(items)) {
      console.log('[decreaseProductQuantities] No valid items array provided');
      return;
    }
    
    console.log('[decreaseProductQuantities] Items array length:', items.length);
    
    // Keep track of processed items to prevent double processing
    const processedItems = new Set();
    
    // Process each item in the order
    for (const [index, item] of items.entries()) {
      console.log(`[decreaseProductQuantities] Processing item ${index}:`, JSON.stringify(item, null, 2));
      console.log(`[decreaseProductQuantities] Item keys:`, Object.keys(item));
      
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
      
      // Create a unique identifier for this item
      const itemKey = `${productId}-${purchasedQuantity}`;
      if (processedItems.has(itemKey)) {
        console.log(`[decreaseProductQuantities] Skipping item ${index} - Already processed: ${itemKey}`);
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
      
      // Mark this item as processed
      processedItems.add(itemKey);
      
      // Get the current product before updating
      console.log(`[decreaseProductQuantities] Looking up product with ID: ${productId}`);
      const currentProduct = await Product.findById(productId);
      console.log(`[decreaseProductQuantities] Product lookup result:`, currentProduct ? 'Found' : 'Not found');
      if (!currentProduct) {
        console.log(`[decreaseProductQuantities] Product not found with ID: ${productId}`);
        continue;
      }
      
      const previousQuantity = currentProduct.currentStock;
      const newQuantity = previousQuantity - purchasedQuantity;
      
      // Decrease the product's current stock by the purchased quantity
      console.log(`[decreaseProductQuantities] Updating product ${productId} stock by ${-Math.abs(purchasedQuantity)}`);
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $inc: { currentStock: -Math.abs(purchasedQuantity) } }, // Ensure positive quantity
        { new: true }
      );
      console.log(`[decreaseProductQuantities] Product update result:`, updatedProduct ? 'Success' : 'Failed');
      
      if (updatedProduct) {
        console.log(`[decreaseProductQuantities] Product stock updated successfully:`);
        console.log(`  - Product Name: ${updatedProduct.productName}`);
        console.log(`  - Product ID: ${updatedProduct._id}`);
        console.log(`  - Old Stock: ${previousQuantity}`);
        console.log(`  - New Stock: ${updatedProduct.currentStock}`);
        console.log(`  - Quantity Decreased: ${Math.abs(purchasedQuantity)}`);
        
        // Add entry to stock history
        try {
          console.log(`[decreaseProductQuantities] Creating stock history entry for ${updatedProduct.productName}`);
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
    console.error("[decreaseProductQuantities] Error stack:", error.stack);
    // Not throwing error to prevent payment failure due to stock update issues
  }
  console.log('[decreaseProductQuantities] Function completed');
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
    // Get the current payment status before updating
    const currentPayment = await Payment.findOne({ _id: id, isDeleted: false });
    if (!currentPayment) return res.status(404).json({ message: "Payment not found" });
    
    console.log('[updatePaymentStatus] Current payment status:', currentPayment.status, 'New status:', status);
    
    // If the status is already the same, no need to update
    if (currentPayment.status === status) {
      console.log('[updatePaymentStatus] Status unchanged, returning current payment');
      return res.json({ message: "Payment status unchanged", payment: currentPayment });
    }
    
    const payment = await Payment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { status } },
      { new: true }
    );

    if (!payment) return res.status(404).json({ message: "Payment not found" });
    console.log('[updatePaymentStatus] Payment status updated:', JSON.stringify(payment, null, 2));
    
    // If payment status is updated to successful from a non-successful status, decrease product quantities
    if (status === "successful" && currentPayment.status !== "successful") {
      console.log('[updatePaymentStatus] Decreasing product quantities for successful payment');
      // Populate the order with item details including product references
      const order = await Order.findOne({ _id: payment.orderId, isDeleted: false }).populate({
        path: 'items.productId',
        model: 'ProductModel'
      });
      console.log('[updatePaymentStatus] Order found for stock update:', JSON.stringify(order, null, 2));
      if (order) {
        await decreaseProductQuantities(order.items);
      }
    } else if (status === "successful" && currentPayment.status === "successful") {
      console.log('[updatePaymentStatus] Payment was already successful, skipping quantity decrease');
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










