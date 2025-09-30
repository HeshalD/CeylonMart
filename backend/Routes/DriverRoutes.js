const express = require("express");
const { body, param } = require("express-validator");
const ctrl = require("../Controllers/DriverController");

const router = express.Router();

//  Custom validation for both single and multiple drivers
const driverValidation = [
  body().custom((value) => {
    //single or multiple drivers
    if (!value || (typeof value !== "object" && !Array.isArray(value))) {
      throw new Error("Request body must be an object or array of objects");
    }

    // Convert single object to array
    const drivers = Array.isArray(value) ? value : [value];

    drivers.forEach((driver, i) => {
      if (!driver.firstName) throw new Error(`Driver[${i}]: firstName is required`);
      if (!driver.lastName) throw new Error(`Driver[${i}]: lastName is required`);
      if (!driver.email) throw new Error(`Driver[${i}]: email is required`);
      if (!driver.phone) throw new Error(`Driver[${i}]: phone is required`);
      if (!driver.licenseNumber) throw new Error(`Driver[${i}]: licenseNumber is required`);
      if (!driver.vehicleType) throw new Error(`Driver[${i}]: vehicleType is required`);
      if (!driver.vehicleNumber) throw new Error(`Driver[${i}]: vehicleNumber is required`);
      if (!driver.capacity) throw new Error(`Driver[${i}]: capacity is required`);
      if (!driver.district) throw new Error(`Driver[${i}]: district is required`);
      if (!['Colombo', 'Gampaha', 'Kalutara'].includes(driver.district)) {
        throw new Error(`Driver[${i}]: district must be one of: Colombo, Gampaha, Kalutara`);
      }

      
      if (isNaN(driver.phone)) throw new Error(`Driver[${i}]: phone must be numeric`);
      if (isNaN(driver.capacity)) throw new Error(`Driver[${i}]: capacity must be numeric`);
      if (!["car", "van", "bike", "lorry"].includes(driver.vehicleType)) {
        throw new Error(`Driver[${i}]: vehicleType must be car, van, bike or lorry`);
      }
    });

    return true;
  }),
];

// Create driver(s)
router.post("/", driverValidation, ctrl.createDriver);

// Get all drivers
router.get("/", ctrl.getDrivers);

// Get driver by ID
router.get("/:id", param("id").isMongoId(), ctrl.getDriverById);

// Update driver
router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("phone").optional().isNumeric().withMessage("Phone must be numeric"),
    body("licenseNumber")
      .optional()
      .notEmpty()
      .withMessage("License number cannot be empty"),
    body("vehicleType")
      .optional()
      .isIn(["car", "van", "bike", "lorry"])
      .withMessage("Vehicle type must be car, van, bike or lorry"),
  ],
  ctrl.updateDriver
);

// Delete driver
router.delete("/:id", param("id").isMongoId(), ctrl.deleteDriver);

// Search and filter drivers
router.get("/search/filter", ctrl.searchDrivers);

// Get available drivers for assignment
router.get("/available/list", ctrl.getAvailableDrivers);

// Toggle driver availability
router.patch("/:id/availability", [
  param("id").isMongoId(),
  body("availability").isIn(["available", "unavailable", "busy"]).withMessage("Invalid availability status")
], ctrl.toggleAvailability);

// Get driver delivery history
router.get("/:id/history", [
  param("id").isMongoId()
], ctrl.getDriverHistory);

// Get driver statistics
router.get("/:id/stats", [
  param("id").isMongoId()
], ctrl.getDriverStats);

// Update delivery status
router.patch("/delivery/:deliveryId/status", [
  param("deliveryId").isMongoId(),
  body("status").isIn(["pending", "picked", "in_transit", "delivered", "failed"]).withMessage("Invalid delivery status")
], ctrl.updateDeliveryStatus);

// Digital delivery confirmation
router.post("/delivery/:deliveryId/confirm", [
  param("deliveryId").isMongoId(),
  body("customerName").notEmpty().withMessage("Customer name is required")
], ctrl.confirmDelivery);

// Update drivers without district (migration endpoint)
router.post("/migrate/districts", ctrl.updateDriversWithoutDistrict);

// Create sample drivers for testing
router.post("/sample/create", ctrl.createSampleDrivers);

// Create sample deliveries for testing
router.post("/sample/deliveries", ctrl.createSampleDeliveries);

// Debug endpoint to check driver data
router.get("/debug", ctrl.debugDrivers);

module.exports = router;
