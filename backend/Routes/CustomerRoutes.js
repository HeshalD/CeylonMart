const express = require("express");
const { body, param } = require("express-validator");
const ctrl = require("../Controllers/CustomerController");

const router = express.Router();

// Create a new customer
router.post(
  "/",
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").optional().isString(),
  body("address").optional().isString(),
  ctrl.createCustomer
);

// Get customer by ID
router.get("/:id", ctrl.getCustomerById);

module.exports = router;
