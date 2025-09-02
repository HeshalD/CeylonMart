const express = require("express");
const router = express.Router();

//Insert Model
const Product = require("../Models/ProductModel");
//Insert Product Controller
const ProductController = require("../Controllers/ProductControllers");

const upload = require("../services/multerConfig"); // multer service

router.get("/",ProductController.getAllProducts);
router.post("/", upload.single("productImage"), ProductController.addProducts);
router.get("/:id",ProductController.getById);
router.put("/:id", upload.single("productImage"), ProductController.updateProduct);
router.delete("/:id",ProductController.deleteProduct);


//export
module.exports = router;