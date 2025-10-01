import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getCategories } from "../../api/inventoryApi";
import { useNavigate } from "react-router-dom";
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

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Sample categories with available images
  const sampleCategories = [
    { _id: '1', categoryName: 'Fruits', categoryImage: 'fruits.jpg' },
    { _id: '2', categoryName: 'Vegetables', categoryImage: 'vegetable.jpg' },
    { _id: '3', categoryName: 'Dairy', categoryImage: 'dairy.jpg' },
    { _id: '4', categoryName: 'Beverages', categoryImage: 'beverage.jpg' },
    { _id: '5', categoryName: 'Grains', categoryImage: 'rice.jpg' }
  ];

  // Sample products with available images
  const sampleProducts = [
    { _id: '1', productName: 'Fresh Apples', price: 250, category: 'Fruits', productImage: 'apple1.png', currentStock: 50, brandName: 'Fresh Farm' },
    { _id: '2', productName: 'Green Apples', price: 280, category: 'Fruits', productImage: 'apple-green.jpg', currentStock: 30, brandName: 'Organic' },
    { _id: '3', productName: 'Fresh Bananas', price: 120, category: 'Fruits', productImage: 'batana.jpg', currentStock: 100, brandName: 'Local Farm' },
    { _id: '4', productName: 'Fresh Carrots', price: 180, category: 'Vegetables', productImage: 'carrot.jpg', currentStock: 75, brandName: 'Farm Fresh' },
    { _id: '5', productName: 'Red Tomatoes', price: 200, category: 'Vegetables', productImage: 'tomatoes2.jpg', currentStock: 60, brandName: 'Garden Fresh' },
    { _id: '6', productName: 'Fresh Milk', price: 150, category: 'Dairy', productImage: 'freshmilk.jpg', currentStock: 40, brandName: 'Kotmale' },
    { _id: '7', productName: 'Coca Cola', price: 80, category: 'Beverages', productImage: 'cocacola.jpg', currentStock: 200, brandName: 'Coca Cola' },
    { _id: '8', productName: 'Sprite', price: 80, category: 'Beverages', productImage: 'sprite.jpg', currentStock: 150, brandName: 'Sprite' },
    { _id: '9', productName: 'Fresh Rice', price: 120, category: 'Grains', productImage: 'rice.jpg', currentStock: 80, brandName: 'Premium' },
    { _id: '10', productName: 'Fresh Potatoes', price: 160, category: 'Vegetables', productImage: 'potatoes.jpg', currentStock: 90, brandName: 'Farm Fresh' },
    { _id: '11', productName: 'Fresh Mango', price: 300, category: 'Fruits', productImage: 'mango.jpg', currentStock: 25, brandName: 'Tropical' },
    { _id: '12', productName: 'Fresh Orange', price: 220, category: 'Fruits', productImage: 'orange.jpg', currentStock: 45, brandName: 'Citrus Farm' }
  ];

  // Function to get image URL with fallback
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    
    // Try backend first
    const backendUrl = `http://localhost:5000/uploads/${imageName}`;
    
    // Fallback to local images
    const localUrl = `/images/${imageName}`;
    
    return { backendUrl, localUrl };
  };

  // Placeholder images for products
  const getPlaceholderImage = (category) => {
    const placeholders = {
      'Fruits': '🍎',
      'Vegetables': '🥕', 
      'Dairy': '🥛',
      'Beverages': '🥤',
      'Grains': '🌾',
      'default': '🛒'
    };
    return placeholders[category] || placeholders.default;
  };

  // Placeholder images for categories
  const getCategoryPlaceholder = (categoryName) => {
    const categoryPlaceholders = {
      'Fruits': '🍎',
      'Vegetables': '🥕', 
      'Dairy': '🥛',
      'Beverages': '🥤',
      'Grains': '🌾',
      'default': '📦'
    };
    return categoryPlaceholders[categoryName] || categoryPlaceholders.default;
  };

  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [activeCategoryChip, setActiveCategoryChip] = useState("");

  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingCategories(true);
      try {
        const res = await getCategories();
        const cats = res.data?.categories ?? res.data ?? [];
        if (mounted) setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch categories, using sample data", err);
        if (mounted) setCategories(sampleCategories);
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
        console.error("Failed to fetch products, using sample data", err);
        if (mounted) setProducts(sampleProducts);
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
    setCart((prev) => {
      const found = prev.find((p) => p._id === product._id);
      if (found) {
        return prev.map((p) =>
          p._id === product._id ? { ...p, qty: (p.qty || 1) + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setToast({ message: `${product.productName ?? product.name} added to cart`, type: "success" });
    setTimeout(() => setToast(null), 2200);
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
        <aside className="w-64 p-4 bg-white border-2 rounded-lg shadow-lg h-fit">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            Shop by category
          </h3>
          {loadingCategories ? (
            <div className="text-sm text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-gray-500">No categories found</div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                className={`px-3 py-2 rounded-lg text-left border-2 ${
                  activeCategoryChip === ""
                    ? "bg-emerald-100 border-emerald-500"
                    : "hover:bg-emerald-50 hover:border-emerald-400"
                } transition`}
                onClick={() => {
                  setActiveCategoryChip("");
                  setCategoryFilter("");
                }}
              >
               <span className="text-base font-medium text-teal-800">
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
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg border-2 transition ${
                      activeCategoryChip === label
                        ? "bg-teal-100 border-teal-500"
                        : "hover:bg-teal-50 hover:border-teal-400"
                    }`}
                  >
                    <div className="flex items-center justify-center overflow-hidden bg-gray-100 rounded-full w-14 h-14">
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-emerald-100 to-teal-200">
                        <span className="text-2xl">
                          {getCategoryPlaceholder(label)}
                        </span>
                      </div>
                    </div>
                    <span className="text-base font-medium text-gray-800">
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
          <div className="p-4 bg-white border-2 rounded-lg shadow-lg">
            <div className="grid items-end grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="block mb-1 text-xs text-gray-800">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setActiveCategoryChip("");
                  }}
                  className="w-full px-3 py-2 text-gray-800 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200"
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
                <label className="block mb-1 text-xs text-gray-800">
                  Search product
                </label>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Type product name..."
                  className="w-full px-3 py-2 text-gray-800 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs text-gray-800">
                  Sort
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 text-gray-800 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200"
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
                          src={getImageUrl(p.productImage).backendUrl}
                          alt={p.productName ?? p.name}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Try fallback image
                            const fallbackUrl = getImageUrl(p.productImage).localUrl;
                            if (e.target.src !== fallbackUrl) {
                              e.target.src = fallbackUrl;
                            } else {
                              // If both fail, show placeholder
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200" style={{ display: p.productImage ? 'none' : 'flex' }}>
                        <div className="text-center">
                          <div className="text-6xl mb-2">
                            {getPlaceholderImage(p.category)}
                          </div>
                          <p className="text-sm font-medium text-gray-600">{p.category}</p>
                        </div>
                      </div>
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
    </div>
  );
};

export default Shop;
