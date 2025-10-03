const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
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
      validate: {
        validator: function (value) {
          return /^\d+(\.\d{1,2})?$/.test(value.toString());
        },
        message: "Price can have at most 2 decimal places and cannot be negative",
      },
    },
    unitType: {
      type: String,
      enum: [
        "Kg",
        "g",
        "L",
        "ml",
        "pack",
        "pcs",
        "other",
        "bottle",
        "piece",
        "tin",
        "box",
        "packet",
      ],
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
      validate: {
        validator: function (value) {
          if (value < 0) return false; // No negatives
          if (this.unitType === "Kg" || this.unitType === "g") {
            return /^\d+(\.\d{1})?$/.test(value.toString());
          }
          return Number.isInteger(value);
        },
        message: function (props) {
          if (props.value < 0) return "Stock cannot be negative";
          if (this.unitType === "Kg" || this.unitType === "g") {
            return "Stock for Kg/g can have at most 1 decimal place";
          }
          return "Stock for this unit type must be a whole number";
        },
      },
    },
    minimumStockLevel: {
      type: Number,
      required: [true, "Minimum stock level is required"],
      min: [0, "Minimum stock cannot be negative"],
      validate: {
        validator: function (value) {
          if (value < 0) return false; // No negatives
          if (this.unitType === "Kg" || this.unitType === "g") {
            return /^\d+(\.\d{1})?$/.test(value.toString());
          }
          return Number.isInteger(value);
        },
        message: function (props) {
          if (props.value < 0) return "Minimum stock cannot be negative";
          if (this.unitType === "Kg" || this.unitType === "g") {
            return "Minimum stock for Kg/g can have at most 1 decimal place";
          }
          return "Minimum stock for this unit type must be a whole number";
        },
      },
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value > today;
        },
        message: "Expiry date must be a future date",
      },
    },
    productImage: {
      type: String,
      required: [true, "Product image is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProductModel", productSchema);
