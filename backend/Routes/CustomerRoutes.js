const express = require("express");
const { body, param } = require("express-validator");
const ctrl = require("../Controllers/CustomerController");

const router = express.Router();

// Custom validation for customer
const customerValidation = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("address.street").notEmpty().withMessage("Street address is required"),
  body("address.city").notEmpty().withMessage("City is required"),
  body("address.district").notEmpty().withMessage("District is required"),
  body("address.postalCode").notEmpty().withMessage("Postal code is required"),
  body("status").optional().isIn(["active", "inactive", "suspended"]).withMessage("Invalid status")
];

// Create customer
router.post("/", customerValidation, ctrl.createCustomer);

// Get all customers
router.get("/", ctrl.getCustomers);

// Get customer by ID
router.get("/:id", param("id").isMongoId(), ctrl.getCustomerById);

// Update customer
router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("status").optional().isIn(["active", "inactive", "suspended"]).withMessage("Invalid status")
  ],
  ctrl.updateCustomer
);

// Delete customer
router.delete("/:id", param("id").isMongoId(), ctrl.deleteCustomer);

// Search and filter customers
router.get("/search/filter", ctrl.searchCustomers);

// Get customers by district
router.get("/district/:district", ctrl.getCustomersByDistrict);

// Get customer statistics
router.get("/stats/overview", ctrl.getCustomerStats);

module.exports = router;
