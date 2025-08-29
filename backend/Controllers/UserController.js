const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../Models/UserModel");
const generateToken = require("../utils/generateToken");

// Setup transporter (Mailtrap or your SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ======= Registration (create OTP & send email) =======
exports.registerWithOTP = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "name, email, password required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    // create a user doc but not saved, store OTP in the doc fields
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // create a temporary user doc to save OTP and expiry (hashed password will save on verify)
    const newUser = new User({
      name,
      email,
      password, // will be hashed later when saving; but keep temporary
      role: role || "customer",
      isVerified: false,
      otp,
      otpExpires,
    });

    // Save temp user with OTP and unhashed password? Better: hash password now to avoid storing plain pw.
    newUser.password = await bcrypt.hash(password, 10);
    await newUser.save();

    // send otp mail
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Your OTP for Ceylon Mart",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    return res.status(200).json({ message: "OTP sent to email. Verify within 5 minutes." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// ======= Verify OTP =======
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "email and otp required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });
    if (!user.otp || !user.otpExpires) return res.status(400).json({ message: "OTP not set, re-register" });

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < new Date()) return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Optionally generate token immediately
    const token = generateToken({ id: user._id, role: user.role });

    return res.status(200).json({
      message: "Verification successful",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "OTP verification failed", error: err.message });
  }
};

// ======= Login (JWT) =======
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) return res.status(403).json({ message: "Please verify your account first" });

    const token = generateToken({ id: user._id, role: user.role });

    return res.json({
      message: "Login successful",
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// Logout - client should delete token; endpoint for symmetry
exports.logout = async (_req, res) => res.json({ message: "Logged out (delete token on client)" });

// ======= Profile - self view/update =======
exports.getMyProfile = async (req, res) => {
  try {
    const user = req.user; // from protect middleware
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get profile", error: err.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const updates = req.body;
    // If password updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select("-password");
    return res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    return res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// ======= Admin / shop_owner CRUD =======
// create user (admin adds user)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "name,email,password required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ ...req.body, password: hashed, isVerified: true });

    return res.status(201).json({ message: "User created", user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: "Create failed", error: err.message });
  }
};

exports.getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select("-password");
    if (!u) return res.status(404).json({ message: "User not found" });
    return res.json(u);
  } catch (err) {
    return res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);

    const u = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select("-password");
    if (!u) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "User updated", user: u });
  } catch (err) {
    return res.status(500).json({ message: "Update failed", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Delete failed", error: err.message });
  }
};
