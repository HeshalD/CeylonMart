const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  categoryName: {
  type: String,
  required: [true, "Category name is required"],
  trim: true,
  isActive: true,
  maxlength: [50, "Category name must not exceed 50 characters"],
   match: [/^[A-Za-z\s]+$/, "Category name can only contain letters and spaces"],
},

  categoryImage: {
    type: String, // filename of uploaded image
    required: [true, "Category image is required"],
  },
  description: {
  type: String,
  trim: true,
  maxlength: [200, "Description must not exceed 200 characters"],
  default: "",
},
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model(
  "CategoryModel", // collection name
  categorySchema // schema
);
