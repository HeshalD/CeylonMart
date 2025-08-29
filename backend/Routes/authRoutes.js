const express = require("express");
const ctrl = require("../Controllers/UserController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Registration with OTP
router.post("/register", ctrl.registerWithOTP);
router.post("/verify-otp", ctrl.verifyOTP);

// Auth
router.post("/login", ctrl.login);
router.post("/logout", protect, ctrl.logout);

// Profile (self)
router.get("/me", protect, ctrl.getMyProfile);
router.put("/me", protect, ctrl.updateMyProfile);

module.exports = router;
