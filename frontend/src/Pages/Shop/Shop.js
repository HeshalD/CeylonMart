import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getCategories } from "../../api/inventoryApi";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name A → Z" },
  { value: "name-desc", label: "Name Z → A" },
  { value: "price-asc", label: "Price (Low → High)" },
  { value: "price-desc", label: "Price (High → Low)" },
];

const Stars = ({ rating = 4 }) => (
  <div className="flex gap-0.5 mt-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const Shop = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [activeCategoryChip, setActiveCategoryChip] = useState("");

  const [, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [showQtyModal, setShowQtyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingCategories(true);
      try {
        const res = await getCategories();
        const cats = res.data?.categories ?? res.data ?? [];
        if (mounted) setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        if (mounted) setCategories([]);
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingProducts(true);
      try {
        const res = await axios.get("http://localhost:5000/products");
        const prods = res.data?.products ?? res.data ?? [];
        if (mounted) setProducts(prods);
      } catch (err) {
        console.error("Failed to fetch products", err);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const displayedProducts = useMemo(() => {
    let list = products.slice();
    const effectiveCategory = activeCategoryChip || categoryFilter;
    if (effectiveCategory) {
      list = list.filter(
        (p) => (p.category ?? "").toLowerCase() === effectiveCategory.toLowerCase()
      );
    }
    if (searchText && searchText.trim() !== "") {
      const q = searchText.trim().toLowerCase();
      list = list.filter((p) => {
        const name = (p.productName ?? p.name ?? "").toString().toLowerCase();
        return name.includes(q);
      });
    }
    switch (sortBy) {
      case "name-asc":
        list.sort((a, b) =>
          (a.productName ?? a.name ?? "").localeCompare(
            b.productName ?? b.name ?? "",
            undefined,
            { sensitivity: "base" }
          )
        );
        break;
      case "name-desc":
        list.sort((a, b) =>
          (b.productName ?? b.name ?? "").localeCompare(
            a.productName ?? a.name ?? "",
            undefined,
            { sensitivity: "base" }
          )
        );
        break;
      case "price-asc":
        list.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
        break;
      case "price-desc":
        list.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
        break;
      default:
        break;
    }
    return list;
  }, [products, categoryFilter, activeCategoryChip, searchText, sortBy]);

  const addToCart = (product) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setSelectedProduct(product);
    if (["kg", "g"].includes(product.unitType?.toLowerCase())) {
      setQuantity(0.0);
    } else {
      setQuantity(0);
    }
    setShowQtyModal(true);
  };

  const confirmAddToCart = () => {
    if (!selectedProduct) return;

   // Get existing cart from localStorage
const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

// Add/update item in cart
const updatedCart = (() => {
  const found = existingCart.find((p) => p._id === selectedProduct._id);
  if (found) {
    return existingCart.map((p) =>
      p._id === selectedProduct._id
        ? { ...p, qty: (p.qty || 0) + quantity }
        : p
    );
  }
  return [...existingCart, { ...selectedProduct, qty: quantity }];
})();

// Save updated cart back to localStorage
localStorage.setItem("cart", JSON.stringify(updatedCart));
setCart(updatedCart);



    setToast({ message: `${selectedProduct.productName ?? selectedProduct.name} added to cart`, type: "success" });
    setTimeout(() => setToast(null), 2200);

    setShowQtyModal(false);
    navigate("/cart");
  };

 const handleIncrease = () => {
    if (!selectedProduct) return;
    if (["kg", "g"].includes(selectedProduct.unitType?.toLowerCase())) {
      setQuantity((q) => +(q + 0.1).toFixed(1));
    } else {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrease = () => {
    if (!selectedProduct) return;
    if (["kg", "g"].includes(selectedProduct.unitType?.toLowerCase())) {
      setQuantity((q) => Math.max(0, +(q - 0.1).toFixed(1)));
    } else {
      setQuantity((q) => Math.max(0, q - 1));
    }
  };

  const getStatusLabel = (p) => {
    const current = Number(p.currentStock ?? 0);
    const min = Number(p.minimumStockLevel ?? p.minStock ?? 0);
    if (current <= 0)
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (current <= min)
      return {
        label: (
          <span className="flex flex-col leading-tight">
            <span>Low Stock</span>
            <span className="text-xs">Only {current} left</span>
          </span>
        ),
        color: "bg-yellow-100 text-yellow-800",
      };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const formatPrice = (v) => {
    if (v == null || v === "") return "-";
    return `Rs. ${Number(v).toLocaleString()}`;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CeylonMart Shop</h1>
              <p className="text-gray-600">Fresh products at your fingertips</p>
            </div>
          </div>
        </div>
      </div>

       {/* BODY */}
      <div className="flex gap-6 px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="w-64 p-6 border-2 border-gray-200 shadow-lg bg-gradient-to-br from-white to-gray-50 rounded-xl h-fit backdrop-blur-sm">
          <h3 className="mb-4 text-xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
            Shop by category
          </h3>
          {loadingCategories ? (
            <div className="text-sm text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-gray-500">No categories found</div>
          ) : (
            <div className="flex flex-col gap-4">
              <button
                className={`px-4 py-3 rounded-xl text-left border-2 transition-all duration-300 transform hover:scale-105 ${
                  activeCategoryChip === ""
                    ? "bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-500 shadow-md"
                    : "bg-white hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-300 border-gray-200 hover:shadow-md"
                } `}
                onClick={() => {
                  setActiveCategoryChip("");
                  setCategoryFilter("");
                }}
              >
               <span className="text-lg font-semibold text-emerald-800">
                  All Categories
                  </span>
              </button>
              {categories.map((c) => {
                const label = c.categoryName ?? c.name ?? "Unnamed";
                return (
                  <button
                    key={c._id ?? c.id ?? label}
                    onClick={() => {
                      setActiveCategoryChip(label);
                      setCategoryFilter("");
                    }}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      activeCategoryChip === label
                        ? "bg-gradient-to-r from-teal-100 to-cyan-100 border-teal-500 shadow-md"
                        : "bg-white hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:border-teal-300 border-gray-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-center w-16 h-16 overflow-hidden border-2 border-white rounded-full shadow-sm bg-gradient-to-br from-gray-100 to-gray-200">
                      {c.categoryImage ? (
                        <img
                          src={`http://localhost:5000/uploads/${c.categoryImage}`}
                          alt={label}
                          className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                        />
                      ) : (
                        <span className="text-xl font-bold text-gray-600">
                          {label.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-base font-semibold text-gray-800 transition-colors group-hover:text-emerald-700">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Search + Sort */}
          <div className="p-6 border-2 border-gray-200 shadow-lg bg-gradient-to-r from-white to-gray-50 rounded-xl backdrop-blur-sm">
            <div className="grid items-end grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block mb-2 text-sm font-semibold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setActiveCategoryChip("");
                  }}
                  className="w-full px-4 py-3 text-gray-800 transition-all duration-300 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option
                      key={c._id ?? c.id ?? c.categoryName}
                      value={c.categoryName ?? c.name ?? c._id ?? c.id}
                    >
                      {c.categoryName ?? c.name ?? "Unnamed"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
                  Search product
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Type product name..."
                    className="w-full px-4 py-3 pl-12 text-gray-800 transition-all duration-300 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
                  Sort
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 text-gray-800 transition-all duration-300 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loadingProducts ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 p-4 bg-white border rounded-lg animate-pulse"
                />
              ))
            ) : displayedProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-white border rounded col-span-full">
                No products found.
              </div>
            ) : (
              displayedProducts.map((p) => {
                const { label, color } = getStatusLabel(p);
                return (
                  <div
                    key={p._id}
                    className="flex flex-col overflow-hidden transition bg-white border rounded-lg shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-center overflow-hidden h-44 bg-gray-50">
                      {p.productImage ? (
                        <img
                          src={`http://localhost:5000/uploads/${p.productImage}`}
                          alt={p.productName ?? p.name}
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        <div className="text-gray-400">No image</div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-base font-semibold text-gray-800">
                          {p.productName ?? p.name}
                        </h4>
                        <div className="text-xs text-gray-500">{p.category}</div>
                      </div>
                      <div className="flex-1 mt-2 text-sm text-gray-600">
                        {p.brandName && (
                          <span className="text-xs text-gray-500">
                            by {p.brandName}
                          </span>
                        )}
                      </div>
                      <Stars rating={4} />
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            {formatPrice(p.price)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Unit: {p.unitType || "-"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium ${color}`}
                          >
                            {label}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          disabled={Number(p.currentStock ?? 0) <= 0}
                          onClick={() => addToCart(p)}
                          className={`flex-1 px-3 py-2 text-sm rounded border-2 font-semibold transition ${
                            Number(p.currentStock ?? 0) <= 0
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-400"
                              : "bg-teal-600 text-white hover:bg-teal-700 border-teal-700"
                          }`}
                        >
                          Add to cart
                        </button>
                        <button
                          onClick={() =>
                            alert(
                              `${p.productName ?? p.name}\n\nPrice: ${formatPrice(
                                p.price
                              )}\nCategory: ${p.category}\nStock: ${p.currentStock}`
                            )
                          }
                          className="px-3 py-2 text-sm text-gray-700 transition border-2 border-gray-300 rounded hover:bg-gray-100"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
      
      <Footer />
      {toast && (
        <div className="fixed p-3 bg-white border rounded-md shadow bottom-6 right-6">
          <div className="text-sm">{toast.message}</div>
        </div>
      )}


       {/* 🔹 Quantity Selection Modal */}
      {showQtyModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-xl">
            <div className="text-center">
              {selectedProduct.productImage && (
                <img
                  src={`http://localhost:5000/uploads/${selectedProduct.productImage}`}
                  alt={selectedProduct.productName}
                  className="object-contain w-32 h-32 mx-auto mb-4"
                />
              )}
              <h3 className="text-lg font-bold text-gray-800">{selectedProduct.productName}</h3>
              <p className="font-semibold text-green-600">{formatPrice(selectedProduct.price)} / {selectedProduct.unitType}</p>

              <div className="flex items-center justify-center gap-4 mt-6">
                <button
          onClick={handleDecrease}
                  className="px-4 py-2 text-xl bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  -
                </button>
                <div className="px-6 py-2 text-lg font-semibold border rounded-lg">
                  {["kg", "g"].includes(selectedProduct.unitType?.toLowerCase())
                    ? quantity.toFixed(1)
                    : quantity}
                </div>
                <button
                  onClick={handleIncrease}
                  className="px-4 py-2 text-xl bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={confirmAddToCart}
                  className="flex-1 px-4 py-2 text-white rounded-lg bg-emerald-600 hover:bg-emerald-700"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => setShowQtyModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 mx-4 transition-all transform bg-white rounded-lg shadow-xl">
            <div className="text-center">
              <div className="mb-6">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Thank you for choosing to shop at CeylonMart Online...!
                </h3>
                <p className="text-sm text-gray-600">
                  Please Login or Signup to proceed
                </p>
              </div>
              
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/login');
                  }}
                  className="flex-1 px-6 py-3 font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/register');
                  }}
                  className="flex-1 px-6 py-3 font-medium transition-colors bg-white border-2 rounded-lg text-emerald-600 border-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Signup
                </button>
              </div>
              
              <button
                onClick={() => setShowLoginModal(false)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
