import React, { useState, useEffect } from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import MainHeader from "../Components/MainHeader";
import { emitDashboardUpdate } from "../utils/dashboardEmitter";

const ProductTable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const categoryName = location.state?.categoryName || "Products";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewProductId, setViewProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/products");
        setProducts(res.data.products || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Do you really want to delete this product?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`http://localhost:5000/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      emitDashboardUpdate();
      alert("Product deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to delete product!");
    }
  };

  const handleEdit = (product) => {
    navigate("/update-product", { state: { product } });
  };

  const handleView = (productId) => {
    if (viewProductId === productId) {
      setViewProductId(null);
    } else {
      setViewProductId(productId);
    }
  };

  const filteredProducts = products
    .filter((p) => p.category === categoryName)
    .filter((p) =>
      p.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">{categoryName} Products</h1>
            <p className="text-gray-600">Manage products in the {categoryName} category</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-5 py-2 text-white transition-all duration-300 bg-gray-500 rounded-lg hover:bg-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Categories
          </button>
        </div>

        <div className="w-full max-w-screen-xl mx-auto">
          <div className="p-4 overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{categoryName}</h2>
              <button
                onClick={() => navigate("/add-product", { state: { categoryName: categoryName } })}
                className="px-4 py-2 text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Add New Product
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search product by name..."
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="w-full overflow-hidden bg-white rounded-lg shadow-md">
                <thead>
                  <tr className="text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
                    <th className="px-4 py-3 font-medium text-left">No.</th>
                    <th className="px-4 py-3 font-medium text-left">Image</th>
                    <th className="px-4 py-3 font-medium text-left">Name</th>
                    <th className="px-4 py-3 font-medium text-left">Brand</th>
                    <th className="px-4 py-3 font-medium text-left">Price</th>
                    <th className="px-4 py-3 font-medium text-left">Unit Type</th>
                    <th className="px-4 py-3 font-medium text-left">Product Code</th>
                    <th className="px-4 py-3 font-medium text-left">Current Stock</th>
                    <th className="px-4 py-3 font-medium text-left">Minimum Stock</th>
                    <th className="px-4 py-3 font-medium text-left">Expiry Date</th>
                    <th className="px-4 py-3 font-medium text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <React.Fragment key={product._id}>
                      <tr className="transition-all duration-300 border-b hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 even:bg-gray-100">
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-2 py-1 text-sm font-semibold text-black bg-gray-300 rounded-full">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {product.productImage && (
                            <div className="w-20 h-20 mx-auto overflow-hidden border rounded-lg shadow-sm">
                              <img
                                src={`http://localhost:5000/uploads/${product.productImage}`}
                                alt={product.productName}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{product.productName}</td>
                        <td className="px-4 py-3 text-gray-600">{product.brandName}</td>
                        <td className="px-4 py-3 font-semibold text-green-600">Rs. {product.price}</td>
                        <td className="px-4 py-3 text-gray-700">{product.unitType}</td>
                        <td className="px-4 py-3 font-mono text-black">{product.productCode}</td>
                        <td className="px-4 py-3 font-semibold text-purple-600">
                          <span className="inline-block px-2 py-1 bg-purple-100 rounded-full">{product.currentStock}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-orange-600">
                          <span className="inline-block px-2 py-1 bg-orange-100 rounded-full">{product.minimumStockLevel}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-red-600">{new Date(product.expiryDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleView(product._id)}
                              className="px-4 py-2 text-sm text-white transition-all duration-200 rounded-md bg-sky-500 hover:bg-sky-600"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="px-4 py-2 text-sm text-white transition-all duration-200 bg-teal-500 rounded-md hover:bg-teal-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="px-4 py-2 text-sm text-white transition-all duration-200 rounded-md bg-rose-500 hover:bg-rose-600"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>

                      {viewProductId === product._id && (
                        <tr>
                          <td colSpan="11" className="bg-blue-50">
                            <div className="relative p-4 bg-blue-100 border border-blue-200 rounded-lg shadow-sm">
                              <button
                                onClick={() => setViewProductId(null)}
                                className="absolute px-2 py-1 text-xs text-white transition-all duration-200 rounded bg-gradient-to-r from-red-500 to-red-600 top-2 right-2 hover:from-red-600 hover:to-red-700"
                              >
                                Close
                              </button>
                              <p className="text-gray-800"><strong className="text-black">Name:</strong> {product.productName}</p>
                              <p className="text-gray-800"><strong className="text-black">Brand:</strong> {product.brandName}</p>
                              <p className="text-green-700"><strong className="text-black">Price:</strong> Rs. {product.price}</p>
                              <p className="text-gray-700"><strong className="text-black">Unit Type:</strong> {product.unitType}</p>
                              <p className="text-indigo-700"><strong className="text-black">Product Code:</strong> {product.productCode}</p>
                              <p className="text-purple-700"><strong className="text-black">Current Stock:</strong> {product.currentStock}</p>
                              <p className="text-orange-700"><strong className="text-black">Minimum Stock Level:</strong> {product.minimumStockLevel}</p>
                              <p className="font-semibold text-red-700"><strong className="text-black">Expiry Date:</strong> {new Date(product.expiryDate).toLocaleDateString()}</p>
                              <p className="text-gray-800"><strong className="text-black">Category:</strong> {product.category}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
