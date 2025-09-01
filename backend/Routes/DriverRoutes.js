const express = require("express");
const { body, param } = require("express-validator");
const ctrl = require("../Controllers/DriverController");

const router = express.Router();

// Create driver
router.post(
  "/",
  body("firstName").notEmpty(),
  body("lastName").notEmpty(),
  body("email").isEmail(),
  body("phone").isNumeric(),
  body("licenseNumber").isNumeric(),
  body("vehicleType").isIn(["car", "van"]),
  body("vehicleNumber").notEmpty(),
  ctrl.createDriver
);

// Get all drivers
router.get("/", ctrl.getDrivers);

// Get driver by ID
router.get("/:id", param("id").isMongoId(), ctrl.getDriverById);

// Update driver
router.put(
  "/:id",
  param("id").isMongoId(),
  body("phone").optional().isNumeric(),
  body("licenseNumber").optional().isNumeric(),
  body("vehicleType").optional().isIn(["car", "van"]),
  ctrl.updateDriver
);

// Soft delete driver
router.delete("/:id", param("id").isMongoId(), ctrl.deleteDriver);

module.exports = router;


