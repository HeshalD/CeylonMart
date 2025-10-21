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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentDescriptionIndex, setCurrentDescriptionIndex] = useState(0);

  // Beautiful descriptions about CeylonMart products
  const descriptions = [
    "Discover the finest Sri Lankan products, handpicked for quality and authenticity",
    "From traditional spices to modern essentials, we bring Ceylon's best to your doorstep",
    "Experience the taste of Lanka with our premium selection of local delicacies",
    "Fresh, organic, and sustainably sourced products from Sri Lanka's finest producers",
    "Connecting you with the rich heritage and flavors of Ceylon through every product",
    "Quality you can trust, delivered with care from our family to yours"
  ];

  // Rotate descriptions every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDescriptionIndex(prevIndex => 
        prevIndex === descriptions.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [descriptions.length]);

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

  // Add the same expiration calculation function from Expiry.js
  const calculateDaysLeft = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diff = Math.floor((exp - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Function to check if a product is expired
  const isProductExpired = (product) => {
    const daysLeft = calculateDaysLeft(product.expiryDate);
    return daysLeft < 0 || daysLeft === 0;
  };

  const addToCart = (product) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Check if product is expired
    if (isProductExpired(product)) {
      setToast({ message: "Cannot add expired product to cart", type: "error" });
      setTimeout(() => setToast(null), 3000);
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
    setTimeout(() => setToast(null), 3000);

    setShowQtyModal(false);
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
    
    // Don't show expired label, but still check for out of stock
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
  
  // Chatbot state
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  // Chatbot questions and answers
  const chatbotQA = [
    {
      id: 1,
      question: "How can I track my order?",
      answer: "You can track your order by logging into your CeylonMart account and visiting the 'My Orders' section. You'll also receive email updates on your order status."
    },
    {
      id: 2,
      question: "What are your delivery charges?",
      answer: "We offer free delivery on orders over Rs. 5000. For orders below Rs. 5000, a delivery charge of Rs. 300 applies. Delivery is currently available in Colombo, Gampaha, and Kalutara districts."
    },
    {
      id: 3,
      question: "How long does delivery take?",
      answer: "Standard delivery takes 1-3 business days for Colombo, 2-4 business days for Gampaha, and 3-5 business days for Kalutara. Express delivery options are available at checkout."
    },
    {
      id: 4,
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for unused, unopened products in their original packaging. Perishable items cannot be returned. Contact our customer service to initiate a return."
    },
    {
      id: 5,
      question: "How can I contact customer support?",
      answer: "You can reach our customer support team by calling 011-2345678, emailing support@ceylonmart.lk, or using the live chat feature on our website during business hours (9 AM - 9 PM)."
    },
    {
      id: 6,
      question: "Do you offer international shipping?",
      answer: "Currently, we only deliver within Sri Lanka. We're working on expanding our services to international customers in the near future. Stay tuned for updates!"
    },
    {
      id: 7,
      question: "How do I know if a product is in stock?",
      answer: "Product availability is displayed on each product page. 'In Stock' means the item is available for immediate purchase. 'Low Stock' indicates limited quantities, and 'Out of Stock' means the item is unavailable."
    },
    {
      id: 8,
      question: "Can I modify or cancel my order?",
      answer: "You can modify or cancel your order within 1 hour of placing it. After that, please contact customer support. If your order has already been processed for shipping, modifications may not be possible."
    },
    {
      id: 9,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards (Visa, Mastercard), PayPal, and cash on delivery. All transactions are secured with SSL encryption for your safety."
    },
    {
      id: 10,
      question: "How do I create an account?",
      answer: "Click on the 'Login' button at the top right corner of any page, then select 'Create Account'. Fill in your details and verify your email address. You can also create an account during checkout."
    }
  ];

  // Initialize chatbot with greeting
  useEffect(() => {
    if (showChatbot && chatMessages.length === 0) {
      const greetingMessage = {
        sender: "bot",
        text: `Hello! 👋 Welcome to CeylonMart's Customer Support. How can I help you today?`,
        timestamp: new Date()
      };
      setChatMessages([greetingMessage]);
    }
  }, [showChatbot, chatMessages.length]);

  // Handle question selection
  const handleQuestionSelect = (qa) => {
    // Add user question
    const userMessage = {
      sender: "user",
      text: qa.question,
      timestamp: new Date()
    };
    
    // Add bot answer
    const botMessage = {
      sender: "bot",
      text: qa.answer,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage, botMessage]);
  };

  // Reset chat
  const resetChat = () => {
    setChatMessages([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Chatbot Button */}
      <button
        onClick={() => setShowChatbot(true)}
        className="fixed z-40 p-4 text-white transition-all transform rounded-full shadow-lg bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 hover:scale-110"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chatbot Modal */}
      {showChatbot && (
        <div className="fixed z-50 flex flex-col w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-xl bottom-24 right-6">
          {/* Chatbot Header */}
          <div className="flex items-center justify-between p-4 text-white rounded-t-lg bg-emerald-600">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="font-semibold">CeylonMart Support</h3>
            </div>
            <button 
              onClick={() => setShowChatbot(false)}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Chat Messages - Now scrollable */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ maxHeight: '300px' }}>
            {chatMessages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-3 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg max-w-xs ${
                    message.sender === 'user' 
                      ? 'bg-emerald-500 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
                <div className={`text-xs mt-1 text-gray-500 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Question Selection - Scrollable */}
          <div className="p-4 border-t border-gray-200 bg-gray-50" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <p className="mb-2 text-sm text-gray-600">Select a question:</p>
            <div className="space-y-2">
              {chatbotQA.map((qa) => (
                <button
                  key={qa.id}
                  onClick={() => handleQuestionSelect(qa)}
                  className="w-full p-2 text-sm text-left transition-colors bg-white border border-gray-200 rounded hover:bg-emerald-50 hover:border-emerald-300"
                >
                  {qa.question}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chatbot Footer */}
          <div className="p-3 bg-gray-100 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-between">
              <button
                onClick={resetChat}
                className="text-sm text-emerald-600 hover:text-emerald-800"
              >
                Reset Chat
              </button>
              <button
                onClick={() => setShowChatbot(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rotating Product Descriptions */}
      <div 
        className="py-8 mt-4 bg-center bg-no-repeat bg-cover shadow-lg"
        style={{ 
          backgroundImage: "url('/banner.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center min-h-[120px] flex items-center justify-center">
            <p className="text-3xl font-bold leading-tight text-white md:text-4xl">
              {descriptions[currentDescriptionIndex]}
            </p>
          </div>
          {/* Dots indicator */}
          <div className="flex justify-center mt-6 space-x-3">
            {descriptions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentDescriptionIndex(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 transform hover:scale-125 ${
                  index === currentDescriptionIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
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
                const productExpired = isProductExpired(p);
                return (
                  <div
                    key={p._id}
                    className={`flex flex-col overflow-hidden transition bg-white border rounded-lg shadow-sm hover:shadow-md ${productExpired ? 'opacity-70' : ''}`}
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
                          disabled={Number(p.currentStock ?? 0) <= 0 || productExpired}
                          onClick={() => addToCart(p)}
                          className={`flex-1 px-3 py-2 text-sm rounded border-2 font-semibold transition ${
                            Number(p.currentStock ?? 0) <= 0 || productExpired
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-400"
                              : "bg-teal-600 text-white hover:bg-teal-700 border-teal-700"
                          }`}
                        >
                          {productExpired 
                            ? "Add to cart" 
                            : Number(p.currentStock ?? 0) <= 0 
                              ? "Out of Stock" 
                              : "Add to cart"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setShowDetailsModal(true);
                          }}
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
        <div className={`fixed z-50 p-4 text-white transition-all duration-300 ease-in-out transform border rounded-lg shadow-lg bottom-6 right-6 animate-pulse ${
          toast.type === 'error' 
            ? 'bg-red-500 border-red-600' 
            : 'bg-emerald-500 border-emerald-600'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'error' ? (
              <svg className="w-5 h-5 text-red-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <div className="text-sm font-medium">{toast.message}</div>
          </div>
        </div>
      )}

      {/* 🔹 Product Details Modal */}
      {showDetailsModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white shadow-2xl rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Product Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 transition-colors hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-center justify-center h-64 p-4 rounded-lg bg-gray-50">
                {selectedProduct.productImage ? (
                  <img
                    src={`http://localhost:5000/uploads/${selectedProduct.productImage}`}
                    alt={selectedProduct.productName ?? selectedProduct.name}
                    className="object-contain max-h-56"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No image available</p>
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  {selectedProduct.productName ?? selectedProduct.name}
                </h2>
                
                <div className="mb-4">
                  <Stars rating={4} />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Category:</span>
                    <span className="text-gray-800">{selectedProduct.category || "Not specified"}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Brand:</span>
                    <span className="text-gray-800">{selectedProduct.brandName || "Not specified"}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Unit Type:</span>
                    <span className="text-gray-800">{selectedProduct.unitType || "Not specified"}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Price:</span>
                    <span className="text-xl font-bold text-green-600">{formatPrice(selectedProduct.price)}</span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="font-medium text-gray-600">Stock Status:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusLabel(selectedProduct).color}`}>
                      {getStatusLabel(selectedProduct).label}
                    </span>
                  </div>
                  
                  {/* Show available quantity only for low stock products */}
                  {(() => {
                    const current = Number(selectedProduct.currentStock ?? 0);
                    const min = Number(selectedProduct.minimumStockLevel ?? selectedProduct.minStock ?? 0);
                    const isLowStock = current > 0 && current <= min;
                    
                    return isLowStock ? (
                      <div className="flex justify-between p-3 py-2 border border-yellow-200 rounded-lg bg-yellow-50">
                        <span className="font-medium text-yellow-800">Available Quantity:</span>
                        <span className="font-semibold text-yellow-800">{selectedProduct.currentStock || 0} units remaining</span>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mt-6 sm:flex-row">
              <button
                disabled={Number(selectedProduct.currentStock ?? 0) <= 0 || isProductExpired(selectedProduct)}
                onClick={() => {
                  setShowDetailsModal(false);
                  addToCart(selectedProduct);
                }}
                className={`flex-1 px-4 py-3 text-base font-semibold rounded-lg transition ${
                  Number(selectedProduct.currentStock ?? 0) <= 0 || isProductExpired(selectedProduct)
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg"
                }`}
              >
                {isProductExpired(selectedProduct) 
                  ? "Cannot Add to Cart" 
                  : Number(selectedProduct.currentStock ?? 0) <= 0 
                    ? "Out of Stock" 
                    : "Add to Cart"}
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-3 text-base font-semibold text-gray-700 transition bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
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
