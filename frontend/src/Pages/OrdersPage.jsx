import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrdersAPI } from "../api/client";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await OrdersAPI.getOrders();
        // Display all orders, not just confirmed ones
        setOrders(data);
      } catch (e) { setError(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => navigate('/payment-success')}
            className="flex items-center px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
        <h1 className="text-3xl font-bold text-emerald-700 mb-4">Your Orders</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-600">{String(error)}</div>}
        <div className="grid gap-4">
          {orders.map(o => (
            <div key={o._id} className="bg-white p-5 shadow rounded-2xl border border-emerald-100">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">Order #{o._id}</div>
                  <div className="text-sm text-gray-600">Status: <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{o.status}</span></div>
                  <div className="text-sm text-gray-600">Payment Method: <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{o.paymentMethod}</span></div>
                  <div className="text-sm text-gray-600">District: <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">{o.district}</span></div>
                </div>
                <div className="text-right font-bold text-emerald-700">Rs. {Number(o.totalAmount).toFixed(2)}</div>
              </div>
              <div className="mt-3 text-sm text-gray-700">
                {o.items?.map(it => (
                  <div key={it.productId} className="flex justify-between">
                    <span>{it.productName} x {it.quantity}</span>
                    <span>Rs. {(Number(it.price) * Number(it.quantity)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {orders.length === 0 && !loading && (
            <div className="text-gray-500">No orders found.</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}