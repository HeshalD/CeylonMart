const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Order = require("../Models/OrderModel");

// Helper: calculate total from items
function calculateTotalAmount(items) {
  return (items || []).reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
}

// Create Order (Customer adds items to cart)
exports.createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const payload = { ...req.body };
    payload.totalAmount = calculateTotalAmount(payload.items);
    const order = await Order.create(payload); 
    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ isDeleted: false });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid order ID" });

  try {
    const order = await Order.findOne({ _id: id, isDeleted: false });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Update an existing order item (increase/decrease quantity)
exports.updateOrderItem = async (req, res) => {
  const { orderId, productId } = req.params;
  const { quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId))
    return res.status(400).json({ message: "Invalid order ID" });

  try {
    const order = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Item not found in order" });

    item.quantity = quantity;
    order.totalAmount = calculateTotalAmount(order.items);
    await order.save();

    res.json(order);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Add new item to an existing order
exports.addItemToOrder = async (req, res) => {
  const { orderId } = req.params;
  const { productId, productName, quantity, price } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId))
    return res.status(400).json({ message: "Invalid order ID" });

  try {
    const order = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const existingItem = order.items.find(i => i.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      order.items.push({ productId, productName, quantity, price });
    }

    order.totalAmount = calculateTotalAmount(order.items);
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Remove an item from an order
exports.removeItemFromOrder = async (req, res) => {
  const { orderId, productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId))
    return res.status(400).json({ message: "Invalid order ID" });

  try {
    const order = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.items = order.items.filter(i => i.productId.toString() !== productId);
    order.totalAmount = calculateTotalAmount(order.items);
    await order.save();

    res.json({ message: "Item removed successfully", order });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Get or create active cart for a customer (status: pending)
exports.getOrCreateCart = async (req, res) => {
  const { customerId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(customerId))
    return res.status(400).json({ message: "Invalid customer ID" });

  try {
    let order = await Order.findOne({ customerId, status: "pending", isDeleted: false });
    if (!order) {
      order = await Order.create({ customerId, items: [], totalAmount: 0, status: "pending" });
    }
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Add item to customer's active cart (auto-create if missing)
exports.addItemToCartByCustomer = async (req, res) => {
  const { customerId } = req.params;
  const { productId, productName, quantity, price } = req.body;

  if (!mongoose.Types.ObjectId.isValid(customerId))
    return res.status(400).json({ message: "Invalid customer ID" });

  try {
    let order = await Order.findOne({ customerId, status: "pending", isDeleted: false });
    if (!order) {
      order = await Order.create({ customerId, items: [], totalAmount: 0, status: "pending" });
    }

    const existingItem = order.items.find(i => i.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      order.items.push({ productId, productName, quantity, price });
    }

    order.totalAmount = calculateTotalAmount(order.items);
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Mark order as delivered (simple status transition)
exports.markOrderDelivered = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid order ID" });

  try {
    const order = await Order.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { status: "delivered" } },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order marked as delivered", order });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Soft delete entire order
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid order ID" });

  try {
    const order = await Order.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, status: "cancelled" } },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully", order });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Clear all items from an order (cart)
exports.clearOrderItems = async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId))
    return res.status(400).json({ message: "Invalid order ID" });

  try {
    const order = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.items = [];
    order.totalAmount = 0;
    await order.save();

    res.json({ message: "Cart cleared", order });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};
