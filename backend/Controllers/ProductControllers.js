const Product = require("../Models/ProductModel");

// Helper: format Mongoose validation errors
const formatValidationErrors = (err) => {
  const errors = {};
  if (err.errors) {
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  }
  return errors;
};

//data display part
const getAllProducts = async (req, res, next) => {
    let products;
    try {
        products = await Product.find(); 
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }

    if (!products) {
        return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ products });
};

//data insert part
const addProducts = async (req, res, next) => {
    const {
        productName,
        category,
        brandName,
        price,
        unitType,
        productCode,
        currentStock,
        minimumStockLevel,
        expiryDate
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    let products;

    try {
        products = new Product({
            productName,
            category,
            brandName,
            price,
            unitType,
            productCode,
            currentStock,
            minimumStockLevel,
            expiryDate,
            productImage: req.file.filename,
        });
        
        await products.save();
    } catch (err) {
        console.log(err);
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: "Validation error", errors: formatValidationErrors(err) });
        }
        return res.status(500).json({ message: "Unable to add products", error: err.message });
    }

    if (!products) {
        return res.status(404).send({ message: "Unable to add products" });
    }
    return res.status(200).json({ products });
};

//Get by Id
const getById = async (req, res, next) => {
    const id = req.params.id;
    let product;

    try {
        product = await Product.findById(id);
    } catch (err) {
        console.log(err);
    }

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ product });
}

//Update product details
const updateProduct = async (req, res, next) => {
    const id = req.params.id;
    const {
        productName,
        category,
        brandName,
        price,
        unitType,
        productCode,
        currentStock,
        minimumStockLevel,
        expiryDate
    } = req.body;

    let products;

    try {
        products = await Product.findByIdAndUpdate(
            id,
            {
                productName,
                category,
                brandName,
                price,
                unitType,
                productCode,
                currentStock,
                minimumStockLevel,
                expiryDate
            },
            { new: true, runValidators: true }
        );

        if (req.file) {
            products.productImage = req.file.filename; // update image if uploaded
        }
        products = await products.save();
    } catch (err) {
        console.log(err);
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: "Validation error", errors: formatValidationErrors(err) });
        }
    }

    if (!products) {
        return res.status(404).json({ message: "Unable to update product details" });
    }
    return res.status(200).json({ products });
};

//Delete product details
const deleteProduct = async (req, res, next) => {
    const id = req.params.id;
    let product;
    try {
        product = await Product.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }

    if (!product) {
        return res.status(404).json({ message: "Unable to delete product details" });
    }
    return res.status(200).json({ product });
};

// Get products with low stock
const getLowStockProducts = async (req, res, next) => {
    try {
        const products = await Product.find({
            $expr: { $lte: ["$currentStock", "$minimumStockLevel"] }
        });

        if (!products || products.length === 0) {
            return res.status(200).json({ products: [] });
        }

        res.status(200).json({ products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch low stock products" });
    }
};

exports.getLowStockProducts = getLowStockProducts;
exports.getAllProducts = getAllProducts;
exports.addProducts = addProducts;
exports.getById = getById;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
