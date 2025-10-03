import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import enGB from "date-fns/locale/en-GB";
import { emitDashboardUpdate } from "../utils/dashboardEmitter";

registerLocale("en-GB", enGB);

const UpdateProductForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  const [productName, setProductName] = useState(product?.productName || "");
  const [brandName, setBrandName] = useState(product?.brandName || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [unitType, setUnitType] = useState(product?.unitType || "");
  const [productCode] = useState(product?.productCode || "");
  const [currentStock, setCurrentStock] = useState(product?.currentStock || "");
  const [minimumStockLevel, setMinimumStockLevel] = useState(product?.minimumStockLevel || "");
  const [expiryDate, setExpiryDate] = useState(product?.expiryDate ? new Date(product.expiryDate) : null);
  const [productImage, setProductImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/products");
        setAllProducts(res.data.products || []);
      } catch (err) {
        console.error("Failed to fetch products for duplicate check", err);
      }
    };
    fetchProducts();
  }, []);

  const validateFields = () => {
    const newErrors = {};

    if (!productName.trim()) newErrors.productName = "Product name is required.";
    if (!brandName.trim()) newErrors.brandName = "Brand name is required.";

    const priceNum = parseFloat(price.toString().replace(/[^0-9.]/g, ""));
    if (!price) newErrors.price = "Price is required.";
    else if (isNaN(priceNum) || priceNum <= 0) newErrors.price = "Price must be greater than zero.";
    else if (!/^\d+(\.\d{1,2})?$/.test(priceNum.toString())) newErrors.price = "Price can have up to 2 decimal places.";
    else if (priceNum > 1000000) newErrors.price = "Price cannot exceed ₹1,000,000.";
    else if (priceNum < 0) newErrors.price = "Price cannot be negative.";

    if (!unitType) newErrors.unitType = "Unit type is required.";

    if (!productCode.trim()) newErrors.productCode = "Product code is required.";
    else if (!/^[A-Za-z0-9-_]+$/.test(productCode)) newErrors.productCode = "Only letters, numbers, hyphens, and underscores are allowed.";
    else if (allProducts.some(p => p.productCode.toLowerCase() === productCode.toLowerCase() && p._id !== product._id))
      newErrors.productCode = "This product code is already in use.";

    const currentStockNum = parseFloat(currentStock);
    const minStockNum = parseFloat(minimumStockLevel);

    if (currentStock === "" || isNaN(currentStockNum) || currentStockNum < 0) {
      newErrors.currentStock = "Current stock cannot be negative.";
    } else {
      if (unitType === "Kg" || unitType === "g") {
        if (!/^\d+(\.\d{1})?$/.test(currentStock.toString())) {
          newErrors.currentStock = "For Kg/g, stock can have at most 1 decimal place.";
        }
      } else {
        if (!/^\d+$/.test(currentStock.toString())) {
          newErrors.currentStock = "Stock must be a whole number for this unit type.";
        }
      }
    }

    if (minimumStockLevel === "" || isNaN(minStockNum) || minStockNum < 0) {
      newErrors.minimumStockLevel = "Minimum stock cannot be negative.";
    } else {
      if (unitType === "Kg" || unitType === "g") {
        if (!/^\d+(\.\d{1})?$/.test(minimumStockLevel.toString())) {
          newErrors.minimumStockLevel = "For Kg/g, minimum stock can have at most 1 decimal place.";
        }
      } else {
        if (!/^\d+$/.test(minimumStockLevel.toString())) {
          newErrors.minimumStockLevel = "Minimum stock must be a whole number for this unit type.";
        }
      }
    }

    if (!expiryDate) newErrors.expiryDate = "Expiry date is required.";
    else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const minDate = new Date();
      minDate.setDate(today.getDate() + 3);
      if (expiryDate <= minDate) newErrors.expiryDate = "Expiry date must be at least 3 days from today.";
    }

    if (productImage) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!allowedTypes.includes(productImage.type)) newErrors.productImage = "Only JPG, JPEG, PNG, GIF files are allowed.";
      if (productImage.size > 5 * 1024 * 1024) newErrors.productImage = "Image size must be less than 5MB.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("brandName", brandName);
    formData.append("price", price.replace(/[^0-9.]/g, ""));
    formData.append("unitType", unitType);
    formData.append("currentStock", currentStock);
    formData.append("minimumStockLevel", minimumStockLevel);
    formData.append("expiryDate", expiryDate.toISOString());
    if (productImage) formData.append("productImage", productImage);

    try {
      await axios.put(`http://localhost:5000/products/${product._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Product updated successfully!");
      emitDashboardUpdate();
      navigate(-1);
    } catch (error) {
      console.error(error);
      alert("Failed to update product!");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProductImage(file);
    setErrors({ ...errors, productImage: "" });
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-2xl p-8 mx-4 border-4 shadow-lg bg-emerald-50 rounded-2xl border-emerald-200">
        <h2 className="mb-2 text-3xl font-extrabold text-emerald-700">Update Product</h2>
        <p className="mb-6 text-gray-600">Update the product details below.</p>

        <form onSubmit={handleUpdateProduct} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block font-semibold text-gray-900">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <p className="text-xs text-gray-500">Provide the name of the product.</p>
            {errors.productName && <p className="mt-1 text-sm text-red-500">{errors.productName}</p>}
          </div>

          {/* Brand Name */}
          <div>
            <label className="block font-semibold text-gray-900">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter brand name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <p className="text-xs text-gray-500">Brand or manufacturer name.</p>
            {errors.brandName && <p className="mt-1 text-sm text-red-500">{errors.brandName}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block font-semibold text-gray-900">
              Price (Rs.) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Rs. 100.00"
              value={price}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) setPrice(value);
              }}
              className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <p className="text-xs text-gray-500">Enter price in Rs. (Up to 2 decimal places allowed)</p>
            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
          </div>

          {/* Unit Type */}
          <div>
            <label className="block font-semibold text-gray-900">
              Unit Type <span className="text-red-500">*</span>
            </label>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Select unit type</option>
              <option value="Kg">Kg</option>
              <option value="g">g</option>
              <option value="L">L</option>
              <option value="ml">ml</option>
              <option value="pack">pack</option>
              <option value="box">box</option>
              <option value="bottle">bottle</option>
              <option value="piece">piece</option>
              <option value="tin">tin</option>
              <option value="packet">packet</option>
              <option value="pcs">pcs</option>
              <option value="other">other</option>
            </select>
            {errors.unitType && <p className="mt-1 text-sm text-red-500">{errors.unitType}</p>}
          </div>

          {/* Product Code */}
          <div>
            <label className="block font-semibold text-gray-900">
              Product Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={productCode}
              readOnly
              className="w-full px-4 py-2 text-gray-900 bg-gray-100 border rounded-lg"
            />
          </div>

          {/* Current Stock */}
          <div>
            <label className="block font-semibold text-gray-900">
              Current Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="Enter current stock"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <p className="text-xs text-gray-500">Non-negative integer values for most units. Kg/g allow 1 decimal place.</p>
            {errors.currentStock && <p className="mt-1 text-sm text-red-500">{errors.currentStock}</p>}
          </div>

          {/* Minimum Stock Level */}
          <div>
            <label className="block font-semibold text-gray-900">
              Minimum Stock Level <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="Enter minimum stock level"
              value={minimumStockLevel}
              onChange={(e) => setMinimumStockLevel(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <p className="text-xs text-gray-500">Non-negative integer values for most units. Kg/g allow 1 decimal place.</p>
            {errors.minimumStockLevel && <p className="mt-1 text-sm text-red-500">{errors.minimumStockLevel}</p>}
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block font-semibold text-gray-900">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={expiryDate}
              onChange={(date) => setExpiryDate(date)}
              dateFormat="dd-MM-yyyy"
              minDate={new Date(new Date().setDate(new Date().getDate() + 3))}
              placeholderText="Select expiry date"
              className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              locale="en-GB"
            />
            <p className="text-xs text-gray-500">Must be at least 3 days from today.</p>
            {errors.expiryDate && <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>}
          </div>

          {/* Product Image */}
          <div>
            <label className="block font-semibold text-gray-900">Product Image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-gray-800"
              onChange={handleImageChange}
            />
            <p className="text-xs text-gray-500">Allowed types: JPG, JPEG, PNG, GIF. Max size: 5MB.</p>
            {errors.productImage && <p className="mt-1 text-sm text-red-500">{errors.productImage}</p>}
            {previewImage ? (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Preview:</p>
                <img src={previewImage} alt="Preview" className="w-40 h-40 border rounded-lg" />
              </div>
            ) : product.productImage ? (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Current Image:</p>
                <img src={`http://localhost:5000/uploads/${product.productImage}`} alt="Current" className="w-40 h-40 border rounded-lg" />
              </div>
            ) : null}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button type="submit" className="px-6 py-2 text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400">
              Update Product
            </button>
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProductForm;
