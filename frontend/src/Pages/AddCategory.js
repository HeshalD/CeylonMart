import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { addCategory, getCategories } from "../api/inventoryApi";
import { emitDashboardUpdate } from "../utils/dashboardEmitter";

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [existingCategories, setExistingCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/categories/all");
        setExistingCategories(res.data?.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        try {
          const fallbackRes = await getCategories();
          setExistingCategories(fallbackRes.data?.categories || []);
        } catch (fallbackErr) {
          console.error("Fallback fetch also failed:", fallbackErr);
        }
      }
    };
    fetchCategories();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!categoryName.trim())
      newErrors.categoryName = "Category name is required";

    if (description.length > 100) {
      newErrors.description = "Description cannot exceed 100 characters";
    }

    if (!categoryImage) {
      newErrors.categoryImage = "Category image is required";
    } else {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!allowedTypes.includes(categoryImage.type)) {
        newErrors.categoryImage =
          "Only JPG, JPEG, PNG, or GIF files are allowed";
      }
      if (categoryImage.size > 5 * 1024 * 1024) {
        newErrors.categoryImage = "Image size must be less than 5MB";
      }
    }

    const isDuplicate = existingCategories.some(
      (cat) =>
        cat.isActive &&
        cat.categoryName.toLowerCase() === categoryName.trim().toLowerCase()
    );
    if (isDuplicate) newErrors.categoryName = "This category already exists";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = new FormData();
    formData.append("categoryName", categoryName);
    formData.append("description", description);
    formData.append("categoryImage", categoryImage);

    try {
      await addCategory(formData);
      alert("Category added successfully!");
      emitDashboardUpdate();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to add category!");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setCategoryImage(file);
    setErrors({ ...errors, categoryImage: "" });

    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-2xl p-8 mx-4 border-4 shadow-lg bg-emerald-50 rounded-2xl border-emerald-200">
        <h2 className="mb-2 font-sans text-3xl font-extrabold text-emerald-700">
          Add New Category
        </h2>
        <p className="mb-6 font-light text-gray-600">
          Fill in the details below to create a new category for your inventory.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-800">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setErrors({ ...errors, categoryName: "" });
              }}
              className="w-full px-4 py-2 text-gray-900 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
            {errors.categoryName && (
              <p className="mt-1 text-sm text-red-500">{errors.categoryName}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-800">
              Description <span className="text-gray-500">(Max 100 characters)</span>
            </label>
            <textarea
              placeholder="Write a short description..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: "" });
              }}
              maxLength="100"
              className="w-full px-4 py-2 text-gray-900 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              rows="3"
            />
            <p className="mt-1 text-xs text-gray-500">
              {100 - description.length} characters remaining
            </p>
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Category Image */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-800">
              Category Image <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-gray-800"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Allowed types: JPG, JPEG, PNG, GIF. Max size: 5MB.
            </p>
            {errors.categoryImage && (
              <p className="mt-1 text-sm text-red-500">
                {errors.categoryImage}
              </p>
            )}

            {/* Image Preview */}
            {previewImage && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-gray-600">Preview:</p>
                <img
                  src={previewImage}
                  alt="Preview"
                  className="object-cover w-40 h-40 border rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="px-6 py-2 text-white transition rounded-lg shadow bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Add Category
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 text-white transition bg-gray-600 border rounded-lg hover:bg-gray-700 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
