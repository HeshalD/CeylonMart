const express = require("express");
const router = express.Router();

// Insert Model
const Category = require("../Models/CategoryModel");
// Insert Category Controller
const CategoryController = require("../Controllers/CategoryControllers");

const upload = require("../services/multerConfig"); // multer service

router.get("/", CategoryController.getAllCategories);
router.get("/all", CategoryController.getAllCategoriesIncludingInactive);
router.post("/", upload.single("categoryImage"), CategoryController.addCategory);
router.get("/:id", CategoryController.getCategoryById);
router.put("/:id", upload.single("categoryImage"), CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);

//export
module.exports = router;
