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

      // Validate phone number (must be numeric and exactly 10 digits)
      if (!/^\d{10}$/.test(driver.phone.toString())) throw new Error(`Driver[${i}]: phone must be exactly 10 digits`);
      
      // Validate license number (must be numeric and exactly 5 digits)
      if (!/^\d{5}$/.test(driver.licenseNumber.toString())) throw new Error(`Driver[${i}]: licenseNumber must be exactly 5 digits`);
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

// Get available drivers
router.get("/available", ctrl.getAvailableDrivers);

// Download drivers PDF
router.get("/pdf", ctrl.downloadDriversPDF);

// Get driver by ID
router.get("/:id", param("id").isMongoId(), ctrl.getDriverById);

// Get driver history (assigned orders)
router.get("/:id/history", param("id").isMongoId(), ctrl.getDriverHistory);

// Update driver
router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("phone").optional().matches(/^\d{10}$/).withMessage("Phone must be exactly 10 digits"),
    body("licenseNumber")
      .optional()
      .matches(/^\d{5}$/)
      .withMessage("License number must be exactly 5 digits"),
    body("vehicleType")
      .optional()
      .isIn(["car", "van", "bike", "lorry"])
      .withMessage("Vehicle type must be car, van, bike or lorry"),
    body("availability")
      .optional()
      .isIn(["available", "busy", "unavailable"])
      .withMessage("Availability must be available, busy, or unavailable"),
    body("district")
      .optional()
      .isString()
      .withMessage("District must be a string"),
  ],
  ctrl.updateDriver
);

// Update driver availability specifically
router.patch(
  "/:id/availability",
  [
    param("id").isMongoId(),
    body("availability")
      .isIn(["available", "busy", "unavailable"])
      .withMessage("Availability must be available, busy, or unavailable"),
  ],
  ctrl.updateDriverAvailability
);

// Update driver district specifically
router.patch(
  "/:id/district",
  [
    param("id").isMongoId(),
    body("district")
      .isString()
      .withMessage("District must be a string"),
  ],
  ctrl.updateDriverDistrict
);

// Delete driver
router.delete("/:id", param("id").isMongoId(), ctrl.deleteDriver);

module.exports = router;
