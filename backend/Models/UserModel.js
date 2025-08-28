const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema({

    name: {
        type: String,
        required: true

    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    //Role of the user
    role: {
        type: String,
        enum: ["shop_owner", "customer","supplier_admin","inventory_manager","delivery_admin","admin"],
        default: "customer"
    },


    phone: String,
    address: String,
    shop_name: String,
    company_name: String,
    managedItems: [String],
    deliveryAreas: [String],

},{timestamps: true});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
  
  // Compare password during login
  userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  
  module.exports = mongoose.model("User", userSchema);