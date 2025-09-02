const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true, minlength: 8 },

    role: {
      type: String,
      enum: [
        "shop_owner",
        "customer",
        "supplier_admin",
        "inventory_manager",
        "delivery_admin",
        "admin",
      ],
      default: "customer",
    },

    phone: String,
    address: String,

    // Optional, used depending on role
    shop_name: String,       // shop_owner
    company_name: String,    // supplier_admin
    managedItems: [String],  // inventory_manager
    deliveryAreas: [String], // delivery_admin
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
