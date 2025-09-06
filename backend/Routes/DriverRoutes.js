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

      
      if (isNaN(driver.phone)) throw new Error(`Driver[${i}]: phone must be numeric`);
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

module.exports = router;
