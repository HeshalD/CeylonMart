const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  phone: { 
    type: String, 
    trim: true 
  },
  address: { 
    type: String, 
    trim: true 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  } // soft delete option
}, { timestamps: true });

module.exports = mongoose.model("Customer", CustomerSchema);
