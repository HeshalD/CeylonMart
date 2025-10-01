import React, { useState, useEffect } from 'react';
import { getReorderSuggestions, getProducts } from '../../api/inventoryApi';

const Reorder = () => {
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsResponse = await getProducts();
      setProducts(productsResponse.data || []);
      
      // Fetch reorder suggestions
      const suggestionsResponse = await getReorderSuggestions();
      setReorderSuggestions(suggestionsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Mock data for demo
      setProducts([
        { _id: '1', name: 'Fresh Milk', category: 'Dairy', quantity: 8, minQuantity: 20, price: 120 },
        { _id: '2', name: 'Bread Loaf', category: 'Bakery', quantity: 5, minQuantity: 15, price: 80 },
        { _id: '3', name: 'Eggs', category: 'Dairy', quantity: 12, minQuantity: 25, price: 150 }
      ]);
      
      setReorderSuggestions([
        {
          _id: '1',
          productId: '1',
          productName: 'Fresh Milk',
          category: 'Dairy',
          currentStock: 8,
          minRequired: 20,
          suggestedQuantity: 50,
          price: 120,
          totalCost: 6000,
          urgency: 'High',
          lastOrdered: '2024-01-10',
          supplier: 'Dairy Farm Co.'
        },
        {
          _id: '2',
          productId: '2',
          productName: 'Bread Loaf',
          category: 'Bakery',
          currentStock: 5,
          minRequired: 15,
          suggestedQuantity: 30,
          price: 80,
          totalCost: 2400,
          urgency: 'Critical',
          lastOrdered: '2024-01-08',
          supplier: 'Bakery Supplies Ltd.'
        },
        {
          _id: '3',
          productId: '3',
          productName: 'Eggs',
          category: 'Dairy',
          currentStock: 12,
          minRequired: 25,
          suggestedQuantity: 40,
          price: 150,
          totalCost: 6000,
          urgency: 'Medium',
          lastOrdered: '2024-01-12',
          supplier: 'Poultry Farm Inc.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === reorderSuggestions.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(reorderSuggestions.map(item => item._id)));
    }
  };

  const handlePlaceOrder = () => {
    const selectedItemsData = reorderSuggestions.filter(item => selectedItems.has(item._id));
    const totalCost = selectedItemsData.reduce((sum, item) => sum + item.totalCost, 0);
    
    alert(`Order placed for ${selectedItemsData.length} items. Total cost: Rs. ${totalCost.toLocaleString()}`);
    
    // Reset form
    setSelectedItems(new Set());
    setSupplier('');
    setNotes('');
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTotalCost = () => {
    return reorderSuggestions
      .filter(item => selectedItems.has(item._id))
      .reduce((sum, item) => sum + item.totalCost, 0);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4 animate-pulse">
          <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reorder Management</h2>
        <div className="flex gap-4">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            {selectedItems.size === reorderSuggestions.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={selectedItems.size === 0}
            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Place Order ({selectedItems.size})
          </button>
        </div>
      </div>

      {/* Order Summary */}
      {selectedItems.size > 0 && (
        <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Order Summary
              </h3>
              <p className="text-blue-700">
                {selectedItems.size} items selected • Total Cost: Rs. {getTotalCost().toLocaleString()}
              </p>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              Rs. {getTotalCost().toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Order Details Form */}
      {selectedItems.size > 0 && (
        <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Order Details</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Supplier
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter supplier name"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add order notes"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reorder Suggestions */}
      <div className="space-y-4">
        {reorderSuggestions.map((item) => (
          <div
            key={item._id}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
              selectedItems.has(item._id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item._id)}
                  onChange={() => handleSelectItem(item._id)}
                  className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.productName}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(item.urgency)}`}>
                      {item.urgency}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <p className="font-medium">{item.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Stock:</span>
                      <p className="font-medium">{item.currentStock}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Min Required:</span>
                      <p className="font-medium">{item.minRequired}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Suggested Qty:</span>
                      <p className="font-medium">{item.suggestedQuantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Unit Price:</span>
                      <p className="font-medium">Rs. {item.price}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Cost:</span>
                      <p className="font-medium text-green-600">Rs. {item.totalCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Supplier:</span>
                      <p className="font-medium">{item.supplier}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Ordered:</span>
                      <p className="font-medium">{new Date(item.lastOrdered).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reorderSuggestions.length === 0 && (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl text-green-500">✓</div>
          <div className="text-lg text-gray-500">All products are well stocked!</div>
          <div className="mt-2 text-sm text-gray-400">
            No reorder suggestions at this time
          </div>
        </div>
      )}
    </div>
  );
};

export default Reorder;
