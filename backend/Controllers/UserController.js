const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/users/register  (public: customer self-register, or any role if you send it)
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "customer",
      phone,
      address,
    });

    // don’t return password
    const { password: _, ...safe } = user.toObject();
    res.status(201).json({ message: "Registered successfully", user: safe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/login (public)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken({ id: user._id, role: user.role });

    const { password: _, ...safe } = user.toObject();
    res.json({ message: "Login successful", token, user: safe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users  (protected: admin only)
exports.getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id  (protected)
exports.getUserById = async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select("-password");
    if (!u) return res.status(404).json({ message: "User not found" });
    res.json(u);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id  (protected: owner or admin)
exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };

    // prevent email duplicate issues without checks; allow changing password safely
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated", user: updated });
  } catch (err) {
    // duplicate email error handling
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id/password  (protected: owner only)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    // Verify the user is changing their own password
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "You can only change your own password" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id  (protected: owner or admin)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Verify the user is deleting their own account or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "You can only delete your own account" });
    }

    const del = await User.findByIdAndDelete(userId);
    if (!del) return res.status(404).json({ message: "User not found" });
    
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
