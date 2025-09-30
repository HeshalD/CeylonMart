const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
   productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    brandName: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    unitType: {
      type: String,
      enum: ["Kg", "g", "L", "ml", "pack", "pcs", "other"],
      required: [true, "Unit type is required"],
    },
    productCode: {
      type: String,
      required: [true, "Product code is required"],
      unique: true,
      trim: true,
    },
    currentStock: {
      type: Number,
      required: [true, "Current stock is required"],
      min: [0, "Stock cannot be negative"],
    },
    minimumStockLevel: {
      type: Number,
      required: [true, "Minimum stock level is required"],
      min: [0, "Minimum stock cannot be negative"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // remove time part
          return value > today;
        },
        message: "Expiry date must be a future date",
      },
    },
    productImage: {
      type: String, // filename of uploaded image
      required: [true, "Product image is required"],
    },
  },
  
  {
    timestamps: true,
  });

module.exports = mongoose.model(
    "ProductModel", //file name
     productSchema //function name
)