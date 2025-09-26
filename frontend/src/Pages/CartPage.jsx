import React from "react";
import { Link } from "react-router-dom";
import useCart from "../hooks/useCart";

export default function CartPage({ customerId }) {
  const { items, total, loading, error, refresh, updateItemQuantity, removeItem, clearCart } = useCart(customerId);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-emerald-700 mb-4">Your Cart</h1>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-600">{String(error)}</div>}
      <div className="bg-white shadow rounded-2xl border border-emerald-100">
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
              <tr key={it.productId} className="border-b">
                <td className="p-3">{it.productName}</td>
                <td className="p-3">
                  <input type="number" min={1} value={it.quantity}
                         onChange={e => updateItemQuantity(it.productId, parseInt(e.target.value || 1))}
                         className="w-20 border rounded px-2 py-1" />
                </td>
                <td className="p-3">{Number(it.price).toFixed(2)}</td>
                <td className="p-3">{(Number(it.price) * Number(it.quantity)).toFixed(2)}</td>
                <td className="p-3 text-right">
                  <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                          onClick={() => removeItem(it.productId)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={5}>Your cart is empty.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center mt-4">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200" onClick={refresh}>Refresh</button>
          <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" onClick={() => clearCart()}>Clear Cart</button>
          <Link to="/" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow">Add Items</Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-emerald-700">Total: Rs. {Number(total).toFixed(2)}</div>
          <Link to="/checkout" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow">Checkout</Link>
        </div>
      </div>
    </div>
  );
}


