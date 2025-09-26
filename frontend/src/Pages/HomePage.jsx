import React, { useState } from 'react'
import useCart from "../hooks/useCart";

function HomePage({ customerId }) {
  const { addItem } = useCart(customerId);
  const [qtyById, setQtyById] = useState({});

  const products = [
    { id: "000000000000000000000001", name: "Ceylon Tea", price: 1200 },
    { id: "000000000000000000000002", name: "Coconut Oil", price: 900 },
    { id: "000000000000000000000003", name: "Spices Pack", price: 1500 }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className='text-4xl font-bold text-emerald-700 mb-2'>Welcome to CeylonMart</h1>
        <p className="text-gray-700">Authentic products at the best prices. Add items to your cart and checkout securely.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-2xl shadow-lg p-5 flex flex-col border border-emerald-100 hover:shadow-xl transition-shadow">
            <div className="text-lg font-semibold text-gray-900">{p.name}</div>
            <div className="text-emerald-700 mb-3 font-semibold">Rs. {p.price.toFixed(2)}</div>
            <div className="mt-auto flex items-center gap-2">
              <input type="number" min={1} value={qtyById[p.id] || 1} onChange={e=>setQtyById(prev => ({ ...prev, [p.id]: parseInt(e.target.value || 1) }))}
                     className="w-20 border rounded px-3 py-2" />
              <button className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow"
                      onClick={() => addItem({ productId: p.id, productName: p.name, quantity: qtyById[p.id] || 1, price: p.price })}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomePage
