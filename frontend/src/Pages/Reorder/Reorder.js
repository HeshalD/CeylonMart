import React, { useState, useEffect } from 'react';
import { getProducts } from '../../api/inventoryApi';
import { reorderAPI } from '../../api';

const Reorder = () => {
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [notes, setNotes] = useState('');
  const [reorderQuantities, setReorderQuantities] = useState({});
  const [requiredDates, setRequiredDates] = useState({});
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [showSentOrders, setShowSentOrders] = useState(false);
  const [newRequest, setNewRequest] = useState({
    product: '',
    quantity: '',
    requiredDate: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [orderFormErrors, setOrderFormErrors] = useState({});
  const [sentReorderRequests, setSentReorderRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // all, approved, rejected, pending
  const [dateRange, setDateRange] = useState('all'); // all, 7days, 30days, 90days
  const [editingRequest, setEditingRequest] = useState(null);
  const [editFields, setEditFields] = useState({ quantity: '', requiredDate: '', notes: '' });

  useEffect(() => {
    fetchData();
    fetchSentReorderRequests();
  }, []);

  const fetchSentReorderRequests = async () => {
    try {
      const res = await reorderAPI.list();
      setSentReorderRequests((res.data || []).filter(r => !r.archivedByRequester));
    } catch (e) {
      const requests = JSON.parse(localStorage.getItem('reorderRequests') || '[]');
      setSentReorderRequests(requests);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsResponse = await getProducts();
      const productsData = productsResponse.data || [];
      setProducts(productsData);
      
      // Calculate reorder suggestions based on products with low stock
      const suggestions = productsData
        .filter(product => product.currentStock <= product.minimumStockLevel)
        .map(product => ({
          _id: product._id,
          productId: product._id,
          productName: product.productName,
          category: product.category,
          currentStock: product.currentStock,
          minRequired: product.minimumStockLevel,
          suggestedQuantity: Math.max(0, (product.minimumStockLevel * 2) - product.currentStock),
          urgency: product.currentStock === 0 ? 'Critical' : 
                  product.currentStock <= product.minimumStockLevel / 2 ? 'High' : 'Medium',
          lastOrdered: product.updatedAt || new Date().toISOString()
        }));
      
      setReorderSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Mock data for demo if API fails
      const mockProducts = [
        { _id: '1', productName: 'Fresh Milk', category: 'Dairy', currentStock: 8, minimumStockLevel: 20 },
        { _id: '2', productName: 'Bread Loaf', category: 'Bakery', currentStock: 5, minimumStockLevel: 15 },
        { _id: '3', productName: 'Eggs', category: 'Dairy', currentStock: 12, minimumStockLevel: 25 }
      ];
      
      const mockSuggestions = mockProducts
        .filter(product => product.currentStock <= product.minimumStockLevel)
        .map(product => ({
          _id: product._id,
          productId: product._id,
          productName: product.productName,
          category: product.category,
          currentStock: product.currentStock,
          minRequired: product.minimumStockLevel,
          suggestedQuantity: Math.max(0, (product.minimumStockLevel * 2) - product.currentStock),
          urgency: product.currentStock === 0 ? 'Critical' : 
                  product.currentStock <= product.minimumStockLevel / 2 ? 'High' : 'Medium',
          lastOrdered: new Date().toISOString()
        }));
      
      setProducts(mockProducts);
      setReorderSuggestions(mockSuggestions);
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
    
    // Automatically show the order form when items are selected
    if (newSelected.size > 0 && !showOrderForm) {
      setShowOrderForm(true);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === reorderSuggestions.length) {
      setSelectedItems(new Set());
      // Hide the order form when all items are deselected
      setShowOrderForm(false);
    } else {
      setSelectedItems(new Set(reorderSuggestions.map(item => item._id)));
      // Show the order form when items are selected
      setShowOrderForm(true);
    }
  };

  const validateOrderForm = () => {
    const newErrors = {};
    const selectedItemsData = reorderSuggestions.filter(item => selectedItems.has(item._id));
    
    // Validate each selected item
    selectedItemsData.forEach(item => {
      const quantity = reorderQuantities[item._id] || item.suggestedQuantity;
      const requiredDate = requiredDates[item._id] || '';
      
      if (!quantity || quantity <= 0) {
        newErrors[`quantity-${item._id}`] = 'Quantity must be greater than 0';
      }
      
      if (!requiredDate) {
        newErrors[`date-${item._id}`] = 'Required by date is required';
      } else {
        // Check if date is in the past
        const selectedDate = new Date(requiredDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          newErrors[`date-${item._id}`] = 'Date cannot be in the past';
        }
      }
    });
    
    return newErrors;
  };

  const handlePlaceOrder = async () => {
    const newErrors = validateOrderForm();
    
    if (Object.keys(newErrors).length > 0) {
      setOrderFormErrors(newErrors);
      return;
    }
    
    const selectedItemsData = reorderSuggestions.filter(item => selectedItems.has(item._id));
    
    // Create reorder requests for each selected item
    const reorderRequests = selectedItemsData.map(item => ({
      type: 'reorder',
      product: item.productName,
      quantity: reorderQuantities[item._id] || item.suggestedQuantity,
      requiredDate: requiredDates[item._id] || '',
      notes: notes,
      status: 'pending',
      createdAt: new Date().toISOString()
    }));

    try {
      await reorderAPI.create(reorderRequests);
      const res = await reorderAPI.list();
      setSentReorderRequests(res.data || []);
      alert(`Order placed for ${selectedItemsData.length} items.`);
    } catch (err) {
      const existingRequests = JSON.parse(localStorage.getItem('reorderRequests') || '[]');
      const updatedRequests = [...existingRequests, ...reorderRequests];
      localStorage.setItem('reorderRequests', JSON.stringify(updatedRequests));
      setSentReorderRequests(updatedRequests);
      alert(`Order placed for ${selectedItemsData.length} items (offline cache).`);
    }
    
    // Reset form
    setSelectedItems(new Set());
    setNotes('');
    setReorderQuantities({});
    setRequiredDates({});
    setOrderFormErrors({});
    setShowOrderForm(false);
  };

  const handleNewRequestChange = (field, value) => {
    setNewRequest(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateNewRequest = () => {
    const newErrors = {};
    
    if (!newRequest.product) {
      newErrors.product = 'Please select a product';
    }
    
    if (!newRequest.quantity || newRequest.quantity <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    
    if (!newRequest.requiredDate) {
      newErrors.requiredDate = 'Please select a required by date';
    } else {
      // Check if date is in the past
      const selectedDate = new Date(newRequest.requiredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.requiredDate = 'Required by date cannot be in the past';
      }
    }
    
    return newErrors;
  };

  const handleAddNewRequest = async () => {
    const newErrors = validateNewRequest();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create reorder request object
    const reorderRequest = {
      type: 'reorder',
      product: newRequest.product,
      quantity: newRequest.quantity,
      requiredDate: newRequest.requiredDate,
      notes: newRequest.notes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await reorderAPI.create(reorderRequest);
      const res = await reorderAPI.list();
      setSentReorderRequests(res.data || []);
      alert(`New reorder request added\nProduct: ${newRequest.product}\nQuantity: ${newRequest.quantity}\nRequired by: ${newRequest.requiredDate}`);
    } catch (err) {
      const existingRequests = JSON.parse(localStorage.getItem('reorderRequests') || '[]');
      const updatedRequests = [...existingRequests, reorderRequest];
      localStorage.setItem('reorderRequests', JSON.stringify(updatedRequests));
      setSentReorderRequests(updatedRequests);
      alert(`New reorder request added (offline cache)\nProduct: ${newRequest.product}\nQuantity: ${newRequest.quantity}\nRequired by: ${newRequest.requiredDate}`);
    }
    
    // Reset form
    setNewRequest({
      product: '',
      quantity: '',
      requiredDate: '',
      notes: ''
    });
    setErrors({});
    setShowNewRequestForm(false);
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

  const getUrgencyBorderColor = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'border-l-4 border-l-red-500';
      case 'High':
        return 'border-l-4 border-l-orange-500';
      case 'Medium':
        return 'border-l-4 border-l-yellow-500';
      default:
        return 'border-l-4 border-l-gray-500';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      case 'pending':
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  const handleDeleteRequest = async (request) => {
    if (!window.confirm(`Delete reorder request for ${request.product}?`)) return;
    try {
      if (request._id) {
        await reorderAPI.remove(request._id);
        await fetchSentReorderRequests();
      } else {
        // Fallback: delete from localStorage by client id
        const existing = JSON.parse(localStorage.getItem('reorderRequests') || '[]');
        const updated = existing.filter(r => (r._id || r.id) !== (request._id || request.id));
        localStorage.setItem('reorderRequests', JSON.stringify(updated));
        setSentReorderRequests(updated);
      }
      alert(`Reorder request for ${request.product} deleted.`);
    } catch (e) {
      alert('Failed to delete reorder request');
    }
  };

  const handleStartEdit = (request) => {
    setEditingRequest(request);
    setEditFields({
      quantity: request.quantity,
      requiredDate: request.requiredDate ? request.requiredDate.split('T')[0] : '',
      notes: request.notes || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRequest) return;
    const updates = {
      quantity: Number(editFields.quantity),
      requiredDate: editFields.requiredDate,
      notes: editFields.notes
    };
    if (!updates.quantity || updates.quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }
    if (!updates.requiredDate) {
      alert('Required date is required');
      return;
    }
    try {
      if (editingRequest._id) {
        await reorderAPI.update(editingRequest._id, updates);
        await fetchSentReorderRequests();
      } else {
        const existing = JSON.parse(localStorage.getItem('reorderRequests') || '[]');
        const updated = existing.map(r => {
          const keyA = r._id || r.id;
          const keyB = editingRequest._id || editingRequest.id;
          if (keyA === keyB) {
            return { ...r, ...updates };
          }
          return r;
        });
        localStorage.setItem('reorderRequests', JSON.stringify(updated));
        setSentReorderRequests(updated);
      }
      setEditingRequest(null);
    } catch (e) {
      alert('Failed to update request');
    }
  };

  const updateReorderQuantity = (itemId, quantity) => {
    setReorderQuantities(prev => ({
      ...prev,
      [itemId]: quantity
    }));
  };

  const updateRequiredDate = (itemId, date) => {
    setRequiredDates(prev => ({
      ...prev,
      [itemId]: date
    }));
  };

  // Calculate minimum date for date input (today)
  const today = new Date().toISOString().split('T')[0];

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

  // Filter requests based on status and date range
  const filteredRequests = sentReorderRequests.filter(request => {
    // Status filter
    if (statusFilter !== 'all' && request.status !== statusFilter) {
      return false;
    }
    
    // Date range filter
    if (dateRange !== 'all') {
      const requestDate = new Date(request.createdAt);
      const currentDate = new Date();
      
      let daysToSubtract = 0;
      if (dateRange === '7days') daysToSubtract = 7;
      if (dateRange === '30days') daysToSubtract = 30;
      if (dateRange === '90days') daysToSubtract = 90;
      
      const startDate = new Date();
      startDate.setDate(currentDate.getDate() - daysToSubtract);
      
      if (requestDate < startDate) {
        return false;
      }
    }
    
    return true;
  });

  // Ensure newest requests appear first
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reorder Management</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowSentOrders(true)}
            className="px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Sent Orders ({sentReorderRequests.length})
          </button>
          <button
            onClick={() => setShowNewRequestForm(true)}
            className="px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            Add New Request
          </button>
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            {selectedItems.size === reorderSuggestions.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Sent Orders Modal */}
      {showSentOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Sent Reorder Requests</h3>
              <button
                onClick={() => setShowSentOrders(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Time</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setDateRange('all');
                    }}
                    className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
            
            {/* Requests List with Scroll */}
            <div className="flex-1 overflow-y-auto">
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No reorder requests found matching your filters.
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {sortedRequests.map((request) => (
                    <div 
                      key={request._id || request.id} 
                      className={`p-4 rounded-lg border-l-4 shadow-sm ${
                        request.status === 'approved' 
                          ? 'border-l-green-500 bg-green-50' 
                          : request.status === 'rejected' 
                            ? 'border-l-red-500 bg-red-50' 
                            : 'border-l-yellow-500 bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{request.product}</h4>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="grid grid-cols-1 gap-3 mt-3 md:grid-cols-3">
                            <div>
                              <p className="text-xs text-gray-500">Quantity</p>
                              <p className="text-sm font-medium">{request.quantity}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Required By</p>
                              <p className="text-sm font-medium">{new Date(request.requiredDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Requested On</p>
                              <p className="text-sm font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {request.notes && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Notes</p>
                              <p className="text-sm text-gray-700">{request.notes}</p>
                            </div>
                          )}
                          {request.status === 'rejected' && request.rejectReason && (
                            <div className="p-2 mt-2 rounded bg-red-50">
                              <p className="text-xs text-red-500">Rejection Reason</p>
                              <p className="text-sm text-red-700">{request.rejectReason}</p>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex items-start gap-2">
                          {request.status === 'pending' && (
                            <button
                              onClick={() => handleStartEdit(request)}
                              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteRequest(request)}
                            className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              {editingRequest ? (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={editFields.quantity}
                    onChange={(e) => setEditFields({ ...editFields, quantity: e.target.value })}
                    className="w-28 px-2 py-1 border border-gray-300 rounded"
                    placeholder="Quantity"
                  />
                  <input
                    type="date"
                    value={editFields.requiredDate}
                    min={today}
                    onChange={(e) => setEditFields({ ...editFields, requiredDate: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={editFields.notes}
                    onChange={(e) => setEditFields({ ...editFields, notes: e.target.value })}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    placeholder="Notes (optional)"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingRequest(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSentOrders(false)}
                  className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Request Form */}
      {showNewRequestForm && (
        <div className="p-6 mb-6 border-2 border-green-200 shadow-md bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
          <h3 className="mb-4 text-lg font-semibold text-green-800">Add New Reorder Request</h3>
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-green-700">
                Product *
              </label>
              <select
                value={newRequest.product}
                onChange={(e) => handleNewRequestChange('product', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white ${
                  errors.product ? 'border-red-500' : 'border-green-300'
                }`}
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product._id} value={product.productName}>
                    {product.productName}
                  </option>
                ))}
              </select>
              {errors.product && (
                <p className="mt-1 text-sm text-red-600">{errors.product}</p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-green-700">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={newRequest.quantity}
                onChange={(e) => handleNewRequestChange('quantity', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white ${
                  errors.quantity ? 'border-red-500' : 'border-green-300'
                }`}
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-green-700">
                Required By Date *
              </label>
              <input
                type="date"
                value={newRequest.requiredDate}
                onChange={(e) => handleNewRequestChange('requiredDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white ${
                  errors.requiredDate ? 'border-red-500' : 'border-green-300'
                }`}
                min={today}
              />
              {errors.requiredDate && (
                <p className="mt-1 text-sm text-red-600">{errors.requiredDate}</p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-green-700">
                Notes
              </label>
              <input
                type="text"
                value={newRequest.notes}
                onChange={(e) => handleNewRequestChange('notes', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Add notes"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowNewRequestForm(false)}
              className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNewRequest}
              className="px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
            >
              Add Request
            </button>
          </div>
        </div>
      )}

      {/* Order Form */}
      {showOrderForm && (
        <div className="p-6 mb-6 border-2 border-blue-200 shadow-md bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
          <h3 className="mb-4 text-lg font-semibold text-blue-800">Order Details</h3>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-blue-700">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add order notes"
            />
          </div>
          
          <h4 className="mb-3 font-semibold text-blue-800 text-md">Selected Items</h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {reorderSuggestions
              .filter(item => selectedItems.has(item._id))
              .map((item) => (
                <div key={item._id} className="p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-blue-900">{item.productName}</h5>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(item.urgency)}`}>
                      {item.urgency}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs text-blue-700">Reorder Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={reorderQuantities[item._id] || item.suggestedQuantity}
                        onChange={(e) => {
                          updateReorderQuantity(item._id, parseInt(e.target.value) || 0);
                          // Clear error when user starts typing
                          if (orderFormErrors[`quantity-${item._id}`]) {
                            setOrderFormErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors[`quantity-${item._id}`];
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full px-2 py-1 mt-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          orderFormErrors[`quantity-${item._id}`] 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-blue-300 bg-white'
                        }`}
                      />
                      {orderFormErrors[`quantity-${item._id}`] && (
                        <p className="mt-1 text-xs text-red-600">{orderFormErrors[`quantity-${item._id}`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-blue-700">Required By Date</label>
                      <input
                        type="date"
                        value={requiredDates[item._id] || ''}
                        onChange={(e) => {
                          updateRequiredDate(item._id, e.target.value);
                          // Clear error when user starts typing
                          if (orderFormErrors[`date-${item._id}`]) {
                            setOrderFormErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors[`date-${item._id}`];
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full px-2 py-1 mt-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          orderFormErrors[`date-${item._id}`] 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-blue-300 bg-white'
                        }`}
                        min={today}
                      />
                      {orderFormErrors[`date-${item._id}`] && (
                        <p className="mt-1 text-xs text-red-600">{orderFormErrors[`date-${item._id}`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-blue-700">Current Stock</label>
                      <div className="px-2 py-1 mt-1 text-sm text-blue-700 border border-blue-200 rounded bg-blue-50">
                        {item.currentStock} (Min: {item.minRequired})
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowOrderForm(false)}
              className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceOrder}
              className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Place Order
            </button>
          </div>
        </div>
      )}

      {/* Reorder Suggestions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {reorderSuggestions.map((item) => (
          <div
            key={item._id}
            className={`rounded-xl shadow-md border-2 p-6 transition-all duration-300 transform hover:scale-[1.02] ${
              selectedItems.has(item._id) 
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50' 
                : 'border-gray-200 bg-white'
            } ${getUrgencyBorderColor(item.urgency)}`}
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
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
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
                    <div className="col-span-2">
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