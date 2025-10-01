const Category = require("../Models/CategoryModel");

// Get all categories (including inactive ones) for validation purposes
const getAllCategoriesIncludingInactive = async (req, res, next) => {
  let categories;

  try {
    categories = await Category.find({}).sort({ categoryName: 1 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }

  if (!categories) {
    return res.status(404).json({ message: "Categories not found" });
  }

  return res.status(200).json({ categories });
};

// Get all categories
const getAllCategories = async (req, res, next) => {
  let categories;

  try {
    categories = await Category.find({ isActive: true }).sort({ categoryName: 1 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }

  if (!categories) {
    return res.status(404).json({ message: "Categories not found" });
  }

  return res.status(200).json({ categories });
};

// Get category by ID
const getCategoryById = async (req, res, next) => {
  const id = req.params.id;
  let category;

  try {
    category = await Category.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  return res.status(200).json({ category });
};

// Add new category
const addCategory = async (req, res, next) => {
  const { categoryName, description } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Category image is required" });
  }

  try {
    // 🔎 Check if an active category already exists
    const existingActive = await Category.findOne({
      categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
      isActive: true,
    });

    if (existingActive) {
      return res.status(400).json({ message: "This category already exists" });
    }

    // ✅ Check if an inactive (deleted) category exists to reactivate
    const existingInactive = await Category.findOne({
      categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
      isActive: false,
    });

    if (existingInactive) {
      // Reactivate the deleted category with new data
      existingInactive.description = description || "";
      existingInactive.categoryImage = req.file.filename;
      existingInactive.isActive = true;
      
      await existingInactive.save();
      return res.status(201).json({ category: existingInactive });
    }

    // ✅ Create new category if none exists
    const category = new Category({
      categoryName,
      description: description || "",
      categoryImage: req.file.filename,
      isActive: true,
    });

    await category.save();

    return res.status(201).json({ category });
  } catch (err) {
    console.log("Error in addCategory:", err);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Category with this name already exists in the database",
        error: "Duplicate key error" 
      });
    }
    
    return res.status(500).json({ message: "Unable to add category", error: err.message });
  }
};

// Update category
const updateCategory = async (req, res, next) => {
  const id = req.params.id;
  const { categoryName, description } = req.body;

  let updateData = {
    categoryName,
    description: description || "",
  };

  // Add image to update data if file is uploaded
  if (req.file) {
    updateData.categoryImage = req.file.filename;
  }

  let category;

  try {
    category = await Category.findByIdAndUpdate(id, updateData, { new: true });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Category name already exists" });
    }
    return res.status(500).json({ message: "Unable to update category", error: err.message });
  }

  if (!category) {
    return res.status(404).json({ message: "Unable to update category" });
  }

  return res.status(200).json({ category });
};

// Delete category (soft delete)
const deleteCategory = async (req, res, next) => {
  const id = req.params.id;

  let category;

  try {
    category = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to delete category", error: err.message });
  }

  if (!category) {
    return res.status(404).json({ message: "Unable to delete category" });
  }

  return res.status(200).json({ message: "Category deleted successfully", category });
};

exports.getAllCategories = getAllCategories;
exports.getAllCategoriesIncludingInactive = getAllCategoriesIncludingInactive;
exports.getCategoryById = getCategoryById;
exports.addCategory = addCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
