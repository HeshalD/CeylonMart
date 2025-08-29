const express = require("express");
const ctrl = require("../Controllers/UserController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Protect and allow only shop_owner or admin to manage users
router.post("/", protect, authorize("shop_owner", "admin"), ctrl.createUser);
router.get("/", protect, authorize("shop_owner", "admin"), ctrl.getAllUsers);
router.get("/:id", protect, authorize("shop_owner", "admin"), ctrl.getUserById);
router.put("/:id", protect, authorize("shop_owner", "admin"), ctrl.updateUser);
router.delete("/:id", protect, authorize("shop_owner", "admin"), ctrl.deleteUser);

module.exports = router;
