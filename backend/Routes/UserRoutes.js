const express = require("express");
const router = express.Router();

const userController = require("../Controllers/UserController");
const { verifyToken, isAdmin, isSelfOrAdmin } = require("../Middleware/authMiddleware");

// Public
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Protected
router.get("/", verifyToken, isAdmin, userController.getAllUsers);
router.get("/:id", verifyToken, userController.getUserById);
router.put("/:id", verifyToken, isSelfOrAdmin, userController.updateUser);
router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);

module.exports = router;
