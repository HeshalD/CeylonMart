import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CartPage({ customerId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCart = () => {
    try {
      const cartData = JSON.parse(localStorage.getItem("cart")) || [];
      setItems(cartData);
    } catch (err) {
      console.error("Failed to load cart", err);
      setError("Failed to load cart.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateItemQuantity = (productId, quantity) => {
    const updatedCart = items.map((it) =>
      it._id === productId ? { ...it, qty: quantity } : it
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setItems(updatedCart);
  };

  const removeItem = (productId) => {
    const updatedCart = items.filter((it) => it._id !== productId);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setItems(updatedCart);
  };

  const clearCart = () => {
    localStorage.removeItem("cart");
    setItems([]);
  };

  const refresh = () => {
    loadCart();
  };

  const total = items.reduce(
    (sum, it) => sum + Number(it.price) * Number(it.qty || it.quantity || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Header />
      <div className="max-w-4xl p-4 mx-auto">
        <h1 className="mb-4 text-3xl font-bold text-emerald-700">Your Cart</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-600">{String(error)}</div>}

        <div className="bg-white border shadow rounded-2xl border-emerald-100">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Product</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Price</th>
                <th className="p-3">Subtotal</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id}>
                  <td className="p-3">{it.productName ?? it.name}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      min={1}
                      value={it.qty || it.quantity || 1}
                      onChange={(e) =>
                        updateItemQuantity(it._id, parseInt(e.target.value || 1))
                      }
                      className="w-20 px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="p-3">{Number(it.price).toFixed(2)}</td>
                  <td className="p-3">
                    {(Number(it.price) * Number(it.qty || it.quantity || 0)).toFixed(
                      2
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      className="px-3 py-1 text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                      onClick={() => removeItem(it._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={5}>
                    Your cart is empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 mt-4 sm:flex-row">
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              onClick={refresh}
            >
              Refresh
            </button>
            <button
              className="px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
              onClick={() => clearCart()}
            >
              Clear Cart
            </button>
            <Link
              to="/products"
              className="px-4 py-2 text-white rounded-lg shadow bg-emerald-600 hover:bg-emerald-700"
            >
              Add Items
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-emerald-700">
              Total: Rs. {Number(total).toFixed(2)}
            </div>
            <Link
              to="/checkout"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
