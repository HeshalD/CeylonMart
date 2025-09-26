import React, { useEffect, useState } from "react";
import { OrdersAPI } from "../api/client";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await OrdersAPI.getOrders();
        setOrders(data);
      } catch (e) { setError(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
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
  );
}


