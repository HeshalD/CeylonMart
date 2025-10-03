import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getLowStockProducts } from "../../api/inventoryApi";
import { emitHistory } from "../../utils/historyEmitter";
import {
  emitDashboardUpdate,
  subscribeToDashboardUpdates,
  unsubscribeFromDashboardUpdates,
} from "../../utils/dashboardEmitter";

const LowStock = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restockInput, setRestockInput] = useState({});

  const fetchLowStockProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getLowStockProducts();
      setLowStockProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLowStockProducts();
    const handleUpdate = () => {
      fetchLowStockProducts();
    };

    subscribeToDashboardUpdates(handleUpdate);
    return () => unsubscribeFromDashboardUpdates(handleUpdate);
  }, [fetchLowStockProducts]);

  // ✅ Restock handler
  const handleAddStock = async (productId) => {
    const quantityToAdd = parseInt(restockInput[productId], 10);

    if (!quantityToAdd || quantityToAdd <= 0) {
      alert("Please enter a valid positive integer");
      return;
    }

    try {
      const product = lowStockProducts.find((p) => p._id === productId);
      const newStock = product.currentStock + quantityToAdd;

      await axios.put(`http://localhost:5000/products/${productId}`, {
        ...product,
        currentStock: newStock,
      });

      const historyEntry = {
        productName: product.productName,
        productCode: product.productCode || "",
        category: product.category,
        productImage: product.productImage || "",
        type: "restock",
        quantity: quantityToAdd,
        previousQuantity: product.currentStock,
        newQuantity: newStock,
        reason: "Stock Added via Low Stock Management",
      };

      // ✅ Emit in frontend (this will save to DB and notify subscribers)
      await emitHistory(historyEntry);

      alert(`Successfully added ${quantityToAdd} units to ${product.productName}`);

      if (newStock > product.minimumStockLevel) {
        setLowStockProducts(lowStockProducts.filter((p) => p._id !== productId));
      } else {
        setLowStockProducts(
          lowStockProducts.map((p) =>
            p._id === productId ? { ...p, currentStock: newStock } : p
          )
        );
      }

      setRestockInput({ ...restockInput, [productId]: undefined });

      emitDashboardUpdate();
    } catch (error) {
      console.error("Error adding stock:", error);
      alert("Failed to add stock");
    }
  };

  // ✅ Remove product handler
  const handleRemoveProduct = async (productId) => {
    const product = lowStockProducts.find((p) => p._id === productId);

    const confirmDelete = window.confirm(
      product.currentStock === 0
        ? `Are you sure you want to permanently remove OUT OF STOCK product "${product.productName}"?`
        : `Are you sure you want to permanently remove LOW STOCK product "${product.productName}"?`
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/products/${productId}`);

      setLowStockProducts(lowStockProducts.filter((p) => p._id !== productId));

      const historyEntry = {
        productName: product.productName,
        productCode: product.productCode,
        productImage: product.productImage,
        category: product.category,
        previousQuantity: product.currentStock,
        quantity: product.currentStock,
        newQuantity: 0,
        type: product.currentStock === 0 ? "outofstock-remove" : "lowstock-remove",
        reason:
          product.currentStock === 0
            ? "Removed product that was Out of Stock"
            : "Removed product while still Low Stock",
      };

      // ✅ Save in DB and emit in frontend
      await emitHistory(historyEntry);

      alert("Product removed successfully.");
      emitDashboardUpdate();
    } catch (error) {
      console.error("Error removing product:", error);
      alert("Failed to remove product. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4 animate-pulse">
          <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
          <div className="w-1/4 h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-black">
        Low Stock Alerts
        <span className="inline-block px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-full">
          {lowStockProducts.length}
        </span>
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
              <th className="px-4 py-3 font-medium text-left">Image</th>
              <th className="px-4 py-3 font-medium text-left">Product Name</th>
              <th className="px-4 py-3 font-medium text-left">Category</th>
              <th className="px-4 py-3 font-medium text-left">Current Stock</th>
              <th className="px-4 py-3 font-medium text-left">Minimum Stock</th>
              <th className="px-4 py-3 font-medium text-left min-w-[140px]">Status</th>
              <th className="px-4 py-3 font-medium text-left min-w-[220px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((p) => (
                <tr
                  key={p._id}
                  className="transition-all duration-300 border-b hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 even:bg-gray-100"
                >
                  <td className="p-2 border">
                    <img
                      src={`http://localhost:5000/uploads/${p.productImage}`}
                      alt={p.productName}
                      className="w-16 h-16 mx-auto rounded"
                    />
                  </td>
                  <td className="p-2 font-medium text-gray-900 border">{p.productName}</td>
                  <td className="p-2 text-gray-700 border">{p.category}</td>
                  <td className="p-2 text-center border">
                    {p.currentStock === 0 ? (
                      <span className="inline-block px-2 py-1 text-sm font-bold text-red-700 bg-red-100 rounded-full">
                        {p.currentStock}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-sm font-semibold text-black bg-gray-100 rounded-full">
                        {p.currentStock}
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-center border">
                    <span className="inline-block px-2 py-1 text-sm font-semibold text-black bg-gray-100 rounded-full">
                      {p.minimumStockLevel}
                    </span>
                  </td>
                  <td className="p-2 border min-w-[140px] text-center">
                    {p.currentStock === 0 ? (
                      <span className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                        Low Stock
                      </span>
                    )}
                  </td>
                  <td className="p-2 border min-w-[220px]">
                    {restockInput[p._id] !== undefined ? (
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={restockInput[p._id]}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) {
                              setRestockInput({ ...restockInput, [p._id]: val });
                            }
                          }}
                          className="w-20 p-1 text-sm text-black border rounded"
                          placeholder="Qty"
                        />
                        <button
                          onClick={() => handleAddStock(p._id)}
                          className="px-2 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                        >
                          Add Stock
                        </button>
                        <button
                          onClick={() => setRestockInput({ ...restockInput, [p._id]: undefined })}
                          className="px-2 py-1 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setRestockInput({ ...restockInput, [p._id]: "" })}
                          className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => handleRemoveProduct(p._id)}
                          className="px-3 py-1 text-sm font-medium text-white bg-orange-500 rounded hover:bg-yellow-700"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-4 font-medium text-center text-gray-500">
                  ✅ All products are well stocked!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStock;
