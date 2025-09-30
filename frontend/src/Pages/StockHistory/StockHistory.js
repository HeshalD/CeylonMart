import React, { useState, useEffect, useCallback } from 'react';
import { getStockHistory, getProducts } from '../../api/inventoryApi';
import { subscribeToHistory, getStoredStockHistory } from '../../utils/historyEmitter';

const StockHistory = () => {
  const [stockHistory, setStockHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const productsResponse = await getProducts();
      setProducts(productsResponse.data || []);

      const storedHistory = getStoredStockHistory();
      setStockHistory(storedHistory);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    subscribeToHistory((entry) => {
      setStockHistory((prev) => [entry, ...prev]);
    });
  }, [fetchData]);

  const getActionColor = (type) => {
    switch (type) {
      case 'sale':
        return 'bg-yellow-100 text-yellow-800';
      case 'restock':
        return 'bg-green-100 text-green-800';
      case 'expiry':
        return 'bg-red-100 text-red-800';
      case 'lowstock-remove':
        return 'bg-orange-100 text-orange-800';
      case 'outofstock-remove':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredHistory = stockHistory.filter((entry) => {
    const matchCategory = selectedCategory ? entry.category === selectedCategory : true;
    const matchAction = selectedAction ? entry.type === selectedAction : true;
    return matchCategory && matchAction;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4 animate-pulse">
          <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between p-4 mb-6 border rounded-lg bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800">Stock History</h2>
        <div className="flex gap-4">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 font-medium text-gray-800 transition-all duration-200 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400"
          >
            <option value="" className="font-medium text-gray-700 bg-white">All Categories</option>
            {[...new Set(products.map((p) => p.category))].map((cat) => (
              <option key={cat} value={cat} className="py-2 font-medium text-gray-800 bg-white">
                {cat}
              </option>
            ))}
          </select>

          {/* Action filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-4 py-2 font-medium text-gray-800 transition-all duration-200 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400"
          >
            <option value="" className="font-medium text-gray-700 bg-white">All Actions</option>
            <option value="sale" className="py-2 font-medium text-gray-800 bg-white">Sales</option>
            <option value="expiry" className="py-2 font-medium text-gray-800 bg-white">Expiry Removals</option>
            <option value="lowstock-remove" className="py-2 font-medium text-gray-800 bg-white">Low Stock Removals</option>
            <option value="outofstock-remove" className="py-2 font-medium text-gray-800 bg-white">Out of Stock Removals</option>
            <option value="restock" className="py-2 font-medium text-gray-800 bg-white">Restock Added</option>
          </select>

          {/* Date filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 font-medium text-gray-800 transition-all duration-200 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400"
          >
            <option value="7" className="py-2 font-medium text-gray-800 bg-white">Last 7 days</option>
            <option value="30" className="py-2 font-medium text-gray-800 bg-white">Last 30 days</option>
            <option value="90" className="py-2 font-medium text-gray-800 bg-white">Last 90 days</option>
            <option value="365" className="py-2 font-medium text-gray-800 bg-white">Last year</option>
          </select>
        </div>
      </div>

      <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase">Image</th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase">Product</th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase">Category</th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase">Code</th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase">Action</th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase">Old Stock</th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase">Stock Action</th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((entry) => (
                  <tr key={entry._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 border">
                      <img src={`http://localhost:5000/uploads/${entry.productImage}`} alt={entry.productName} className="object-cover w-12 h-12 rounded" />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border">{entry.productName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 border">{entry.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 border">{entry.productCode}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 border">{formatDate(entry.date)}</td>
                    <td className="px-6 py-4 border">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(entry.type)}`}>{entry.type.toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border">{entry.previousQuantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 border">{entry.type === 'sale' || entry.type.includes('remove') || entry.type === 'expiry' ? `- ${entry.quantity}` : `+ ${entry.quantity}`}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 border">{entry.newQuantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 border">{entry.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {filteredHistory.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-lg text-gray-500">No stock history found</div>
          <div className="mt-2 text-sm text-gray-400">
            {selectedCategory ? 'No history for this category' : 'No stock movements recorded'}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockHistory;
