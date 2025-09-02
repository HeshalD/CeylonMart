const express = require("express");
const router = express.Router();
const userController = require("../Controllers/UserController");

// Login route
router.post("/login", userController.loginUser);

module.exports = router;
