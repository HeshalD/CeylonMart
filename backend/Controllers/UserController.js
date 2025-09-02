const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs"); // we use bcryptjs since it's in your deps
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

// DELETE /api/users/:id  (protected: admin only)
exports.deleteUser = async (req, res) => {
  try {
    const del = await User.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
