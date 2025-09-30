import React, { useState, useEffect } from 'react';
import { getCategories, deleteCategory } from '../../api/inventoryApi';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { emitDashboardUpdate } from '../../utils/dashboardEmitter';

const ProductInventory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // ✅ Fetch only active categories
        const catRes = await getCategories();
        const allCats = catRes.data?.categories || [];
        const activeCats = allCats.filter(cat => cat.isActive !== false);
        setCategories(activeCats);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (id, categoryName) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      // ✅ Step 1: Fetch all products for this category
      const res = await axios.get("http://localhost:5000/products");
      const products = res.data.products || [];
      const hasProducts = products.some(p => p.category === categoryName);

      if (hasProducts) {
        alert("❌ Cannot delete this category because it still has products. Please delete products first.");
        return;
      }

      // ✅ Step 2: Proceed with category deletion
      await deleteCategory(id);
      setCategories(categories.filter((cat) => cat._id !== id));

      // Emit dashboard update
      emitDashboardUpdate();

      alert(`Category "${categoryName}" deleted successfully!`);
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category!');
    }
  };

  const handleEdit = (category) => {
    navigate(`/edit-category/${category._id}`, { state: category });
  };

  const handleView = (category) => {
    navigate('/products', { state: { categoryName: category.categoryName } });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4 animate-pulse">
          <div className="w-1/4 h-8 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-28 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-emerald-700">
          Product Inventory
        </h2>
        <button
          onClick={() => navigate('/add-category')}
          className="px-6 py-3 text-base font-semibold text-white transition-all rounded-lg shadow bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-600"
        >
          + Add New Category
        </button>
      </div>

      {/* Categories Section */}
      <div className="mb-8">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">
          Categories
        </h3>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          {categories
            .slice()
            .sort((a, b) =>
              a.categoryName.toLowerCase().localeCompare(b.categoryName.toLowerCase())
            )
            .map((cat) => (
              <div
                key={cat._id}
                className="p-4 transition transform bg-white border shadow-sm rounded-2xl hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex flex-col items-center gap-3">
                  {/* Category Image / Icon */}
                  <div className="flex items-center justify-center w-24 h-24 overflow-hidden border rounded-full bg-emerald-50 border-emerald-100">
                    {cat.categoryImage ? (
                      <img
                        src={`http://localhost:5000/uploads/${cat.categoryImage}`}
                        alt={cat.categoryName}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-emerald-700">
                        {(cat.categoryName || 'C').charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {cat.categoryName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {cat.description || '—'}
                    </div>
                  </div>

                  {/* --- Action Buttons --- */}
                  <div className="flex flex-wrap justify-center gap-3 mt-3">
                    <button
                      onClick={() => handleView(cat)}
                      className="px-4 py-2 text-sm font-medium text-white transition rounded-md shadow bg-sky-500 hover:bg-sky-600"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleEdit(cat)}
                      className="px-4 py-2 text-sm font-medium text-white transition bg-teal-500 rounded-md shadow hover:bg-teal-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(cat._id, cat.categoryName)}
                      className="px-4 py-2 text-sm font-medium text-white transition rounded-md shadow bg-rose-500 hover:bg-rose-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {categories.length === 0 && (
          <div className="mt-8 text-lg text-center text-gray-500">
            No categories found
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInventory;
