import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Header from '../components/Header';
import './DriverManagement.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDriverSelectionModal, setShowDriverSelectionModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableDriversForOrder, setAvailableDriversForOrder] = useState([]);
  const [showAllDrivers, setShowAllDrivers] = useState(false);
  const [driverSearchTerm, setDriverSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch orders that need driver assignment
      const res = await client.get('/orders');
      console.log('All orders:', res.data);
      // Filter for orders that don't have a driver assigned yet
      const unassignedOrders = res.data.filter(order => 
        order.status === 'pending' && !order.driverId
      );
      console.log('Unassigned orders:', unassignedOrders);
      setOrders(unassignedOrders);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
      setError(e.response?.data?.error || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDrivers = async (orderId, orderDistrict) => {
    try {
      // First try the available drivers endpoint
      let res;
      try {
        res = await client.get('/drivers/available');
        console.log('Available drivers from /drivers/available:', res.data);
      } catch (e) {
        // Fallback to all drivers if available endpoint doesn't work
        console.log('Available endpoint failed, trying all drivers:', e);
        res = await client.get('/drivers');
        console.log('All drivers from /drivers:', res.data);
      }
      
      // Filter drivers by the order's district and availability
      let driversInDistrict = res.data.filter(driver => 
        driver.district === orderDistrict && 
        driver.availability === 'available' &&
        !driver.isDeleted
      );
      
      // If no drivers in specific district, show all available drivers
      if (driversInDistrict.length === 0) {
        console.log('No drivers in specific district, showing all available drivers');
        driversInDistrict = res.data.filter(driver => 
          driver.availability === 'available' &&
          !driver.isDeleted
        );
      }
      
      console.log(`Order district: ${orderDistrict}`);
      console.log(`All drivers:`, res.data);
      console.log(`Drivers in ${orderDistrict} district:`, driversInDistrict);
      setAvailableDriversForOrder(driversInDistrict);
    } catch (e) {
      console.error('Failed to fetch drivers:', e);
      setError(e.response?.data?.error || 'Failed to fetch drivers');
    }
  };

  const assignDriverToOrder = async (orderId, driverId) => {
    try {
      setLoading(true);
      const res = await client.put(`/orders/${orderId}/assign-driver`, {
        driverId: driverId
      });
      console.log('Driver assigned successfully:', res.data);
      setSuccess('Driver assigned successfully!');
      setShowDriverSelectionModal(false);
      setSelectedOrder(null);
      setAvailableDriversForOrder([]);
      fetchOrders(); // Refresh orders list
    } catch (e) {
      console.error('Failed to assign driver:', e);
      setError(e.response?.data?.error || 'Failed to assign driver');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = (order) => {
    console.log('Assigning driver to order:', order);
    console.log('Order district:', order.district);
    setSelectedOrder(order);
    setShowDriverSelectionModal(true);
    fetchAvailableDrivers(order._id, order.district);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || order.paymentMethod === filterType;
    const matchesDistrict = !filterDistrict || order.district === filterDistrict;
    
    return matchesSearch && matchesType && matchesDistrict;
  });

  const filteredDrivers = availableDriversForOrder.filter(driver => {
    const matchesSearch = !driverSearchTerm || 
      driver.firstName?.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
      driver.lastName?.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
      driver.vehicleType?.toLowerCase().includes(driverSearchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pending Orders ({filteredOrders.length})</h1>
          <p className="text-gray-600 text-lg">Manage and assign drivers to pending orders</p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-emerald-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
              <input
                type="text"
                placeholder="Search by order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">All Methods</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">All Districts</option>
                <option value="Colombo">Colombo</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Kaluthara">Kaluthara</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={fetchOrders} 
                className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-medium"
              >
                🔄 Refresh Orders
              </button>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="section">
          
          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No pending orders</h3>
              <p>All orders have been assigned to drivers.</p>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map((order) => {
                console.log('Order data:', order);
                return (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <h4 className="order-id">#{order.orderId || order._id}</h4>
                    <span className="order-status pending">PENDING ASSIGNMENT</span>
                  </div>
                  
                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">Customer:</span>
                      <span className="detail-value">{order.customerId?.name || 'Guest Customer'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Total Amount:</span>
                      <span className="detail-value">Rs. {order.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Payment Method:</span>
                      <span className="detail-value capitalize">
                        {order.paymentMethod === 'credit_card' ? 'Credit Card' :
                         order.paymentMethod === 'debit_card' ? 'Debit Card' :
                         order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' :
                         order.paymentMethod || 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">District:</span>
                      <span className="detail-value">{order.district || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Items:</span>
                      <span className="detail-value">{order.items?.length || 0} items</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Order Date:</span>
                      <span className="detail-value">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button
                      onClick={() => handleAssignDriver(order)}
                      className="btn-primary"
                      disabled={loading}
                    >
                      Assign Driver
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Driver Selection Modal */}
      {showDriverSelectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Assign Driver to Order #{selectedOrder?.orderId || selectedOrder?._id}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Available drivers in {selectedOrder?.district} district
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDriverSelectionModal(false);
                    setSelectedOrder(null);
                    setAvailableDriversForOrder([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search drivers..."
                  value={driverSearchTerm}
                  onChange={(e) => setDriverSearchTerm(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredDrivers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">🚗</div>
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No available drivers</h4>
                    <p className="text-gray-500 mb-4">
                      There are no available drivers in {selectedOrder?.district} district.
                    </p>
                    <div className="text-sm text-gray-400">
                      <p>• Check if drivers are marked as "available"</p>
                      <p>• Verify drivers are assigned to the correct district</p>
                      <p>• Add new drivers through Driver Management</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredDrivers.map((driver) => (
                      <div key={driver._id} className="border border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-colors bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-emerald-600 font-bold text-lg">
                                  {driver.firstName?.[0]}{driver.lastName?.[0]}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">
                                  {driver.firstName} {driver.lastName}
                                </h4>
                                <p className="text-gray-600 text-sm">{driver.email}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm font-medium text-gray-700">Vehicle</p>
                                <p className="text-gray-900">{driver.vehicleType?.toUpperCase()} - {driver.vehicleNumber}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Capacity</p>
                                <p className="text-gray-900">{driver.capacity} kg</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Phone</p>
                                <p className="text-gray-900">{driver.phone}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">License</p>
                                <p className="text-gray-900">{driver.licenseNumber}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Available
                              </span>
                              <span className="text-sm text-gray-500">
                                District: {driver.district}
                              </span>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <button
                              onClick={() => assignDriverToOrder(selectedOrder._id, driver._id)}
                              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-md hover:shadow-lg"
                              disabled={loading}
                            >
                              {loading ? 'Assigning...' : 'Assign'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
