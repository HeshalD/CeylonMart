import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategoryById, updateCategory, getCategories } from "../api/inventoryApi";
import { emitDashboardUpdate } from "../utils/dashboardEmitter";

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [existingCategories, setExistingCategories] = useState([]);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const res = await getCategoryById(id);
        const cat = res.data.category || res.data;
        setCategoryName(cat.categoryName);
        setDescription(cat.description);
        setCurrentImage(cat.categoryImage);
      } catch (err) {
        console.error("Error loading category:", err);
      }
    };

    const loadCategories = async () => {
      try {
        const res = await getCategories();
        setExistingCategories(res.data?.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    loadCategory();
    loadCategories();
  }, [id]);

  const validate = () => {
    const newErrors = {};
    if (!categoryName.trim()) newErrors.categoryName = "Category name is required";

    if (description.length > 100) {
      newErrors.description = "Description cannot exceed 100 characters";
    }

    if (categoryImage) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!allowedTypes.includes(categoryImage.type)) {
        newErrors.categoryImage = "Only JPG, JPEG, PNG, or GIF files are allowed";
      }
      if (categoryImage.size > 5 * 1024 * 1024) {
        newErrors.categoryImage = "Image size must be less than 5MB";
      }
    }

    const isDuplicate = existingCategories.some(
      (cat) =>
        cat._id !== id &&
        cat.categoryName.trim().toLowerCase() === categoryName.trim().toLowerCase()
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
    if (categoryImage) formData.append("categoryImage", categoryImage);

    try {
      await updateCategory(id, formData);
      alert("Category updated successfully!");
      emitDashboardUpdate();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to update category!");
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
        <h2 className="mb-2 font-sans text-3xl font-extrabold text-center text-emerald-700">
          Edit Category
        </h2>
        <p className="mb-6 font-light text-center text-gray-600">
          Update the details of your category below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-800">
              Category Name *
            </label>
            <input
              type="text"
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
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: "" });
              }}
              maxLength="100"
              className="w-full px-4 py-2 text-gray-900 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              rows="4"
            />
            <p className="mt-1 text-xs text-gray-500">
              {100 - description.length} characters remaining
            </p>
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Current Image */}
          {currentImage && !previewImage && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-800">
                Current Image
              </label>
              <img
                src={`http://localhost:5000/uploads/${currentImage}`}
                alt={categoryName}
                className="object-cover w-40 h-40 border rounded-lg shadow-sm"
              />
            </div>
          )}

          {/* New Image */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-800">
              Upload New Image
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleImageChange}
              className="w-full text-gray-800"
            />
            <p className="mt-1 text-xs text-gray-500">
              Allowed types: JPG, JPEG, PNG, GIF. Max size: 5MB.
            </p>
            {errors.categoryImage && (
              <p className="mt-1 text-sm text-red-500">{errors.categoryImage}</p>
            )}
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
              Update Category
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 text-white transition bg-red-600 border rounded-lg hover:bg-red-700 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
