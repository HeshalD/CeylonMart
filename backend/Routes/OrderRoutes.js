const express = require("express");
const { body, param } = require("express-validator");
const ctrl = require("../Controllers/OrderController");

const router = express.Router();

// Create order
router.post(
  "/",
  body("customerId").isMongoId(),
  body("items").isArray({ min: 1 }),
  body("items.*.productId").isMongoId(),
  body("items.*.productName").notEmpty(),
  body("items.*.quantity").isInt({ min: 1 }),
  body("items.*.price").isFloat({ min: 0 }),
  ctrl.createOrder
);

// Get all orders
router.get("/", ctrl.getOrders);

// Get order by ID
router.get("/:id", param("id").isMongoId(), ctrl.getOrderById);

// Add new item to order
router.post(
  "/:orderId/items",
  param("orderId").isMongoId(),
  body("productId").isMongoId(),
  body("productName").notEmpty(),
  body("quantity").isInt({ min: 1 }),
  body("price").isFloat({ min: 0 }),
  ctrl.addItemToOrder
);

// Update quantity of an existing item
router.put(
  "/:orderId/items/:productId",
  param("orderId").isMongoId(),
  param("productId").isMongoId(),
  body("quantity").isInt({ min: 1 }),
  ctrl.updateOrderItem
);

// Remove item from order
router.delete(
  "/:orderId/items/:productId",
  param("orderId").isMongoId(),
  param("productId").isMongoId(),
  ctrl.removeItemFromOrder
);

// Clear all items from an order
router.delete(
  "/:orderId/items",
  param("orderId").isMongoId(),
  ctrl.clearOrderItems
);

// Soft delete entire order
router.delete("/:id", param("id").isMongoId(), ctrl.deleteOrder);

// Cart endpoints
router.get("/cart/:customerId", param("customerId").isMongoId(), ctrl.getOrCreateCart);
router.post(
  "/cart/:customerId/items",
  param("customerId").isMongoId(),
  body("productId").isMongoId(),
  body("productName").notEmpty(),
  body("quantity").isInt({ min: 1 }),
  body("price").isFloat({ min: 0 }),
  ctrl.addItemToCartByCustomer
);

// Mark order delivered
router.put("/:id/delivered", param("id").isMongoId(), ctrl.markOrderDelivered);

module.exports = router;
