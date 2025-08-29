const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },

    role: {
      type: String,
      enum: ["shop_owner", "customer", "supplier_admin", "inventory_manager", "delivery_admin", "admin"],
      default: "customer",
    },

    phone: String,
    address: String,
    shop_name: String,
    company_name: String,
    managedItems: { type: [String], default: [] },
    deliveryAreas: { type: [String], default: [] },

    // OTP + verification
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpires: Date
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
