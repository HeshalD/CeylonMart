import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useUser } from '../contexts/UserContext';
import DriverDashboardHeader from '../components/DriverDashboardHeader';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './DriverDashboard.css';

function DriverDashboard() {
  const { user, userRole, isAuthenticated, login, logout } = useUser();
  const [driver, setDriver] = useState(null);
  const [driverId, setDriverId] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    licenseNumber: ''
  });

  useEffect(() => {
    if (isAuthenticated && userRole === 'driver' && user?.id) {
      setDriverId(user.id);
      setShowLogin(false);
      fetchDriverData(user.id);
    } else {
      setShowLogin(true);
    }
  }, [isAuthenticated, userRole, user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get all drivers and search for matching email and license number
      const res = await client.get('/drivers');
      
      const foundDriver = res.data.find(d => 
        d.email === loginData.email && 
        d.licenseNumber.toString() === loginData.licenseNumber.toString()
      );

      if (foundDriver) {
        console.log('Driver found:', foundDriver);
        console.log('Setting driver ID:', foundDriver._id);
        
        // Use the user context to login
        login({ id: foundDriver._id, name: `${foundDriver.firstName} ${foundDriver.lastName}`, email: foundDriver.email }, 'driver');
        setDriver(foundDriver);
        setDriverId(foundDriver._id);
        setShowLogin(false);
        await fetchDriverOrders(foundDriver._id);
        setSuccess('Login successful!');
      } else {
        setError('Invalid email or license number');
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setDriver(null);
    setDriverId('');
    setOrders([]);
    setShowLogin(true);
    setError('');
    setSuccess('');
  };

  const fetchDriverData = async (id) => {
    try {
      const res = await client.get(`/drivers/${id}`);
      console.log('Driver data:', res.data); // Debug log
      setDriver(res.data);
      await fetchDriverOrders(id);
    } catch (e) {
      setError('Failed to fetch driver data');
      setShowLogin(true);
    }
  };

  const fetchDriverOrders = async (id) => {
    try {
      const res = await client.get(`/drivers/${id}/history`, {
        params: { status: 'assigned,picked,in_transit' }
      });
      console.log('Driver orders response:', res.data);
      setOrders(res.data.deliveries || []);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
      setError('Failed to fetch assigned orders');
    }
  };

  const updateAvailability = async (availability) => {
    if (!driverId) {
      setError('Driver ID not found. Please login again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Updating availability for driver:', driverId, 'to:', availability);
      const response = await client.patch(`/drivers/${driverId}/availability`, { availability });
      console.log('Availability update response:', response.data);
      
      setDriver({ ...driver, availability });
      setSuccess('Availability updated successfully');
    } catch (e) {
      console.error('Failed to update availability:', e);
      console.error('Error response:', e.response?.data);
      setError(e.response?.data?.error || e.response?.data?.message || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  const updateDriverInfo = async (field, value) => {
    if (!driverId) {
      setError('Driver ID not found. Please login again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Updating driver info for driver:', driverId, 'field:', field, 'value:', value);
      console.log('Request payload:', { [field]: value });
      
      let response;
      if (field === 'district') {
        // Use specific district endpoint
        response = await client.patch(`/drivers/${driverId}/district`, { district: value });
      } else {
        // Use general update endpoint for other fields
        response = await client.put(`/drivers/${driverId}`, { [field]: value });
      }
      
      console.log('Driver info update response:', response.data);
      
      // Update the driver state with the new value
      setDriver(prevDriver => ({ ...prevDriver, [field]: value }));
      setSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
    } catch (e) {
      console.error('Failed to update driver info:', e);
      console.error('Error response:', e.response?.data);
      console.error('Error status:', e.response?.status);
      setError(e.response?.data?.error || e.response?.data?.message || 'Failed to update driver information');
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId, status) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await client.patch(`/drivers/delivery/${deliveryId}/status`, {
        status,
        notes: `Updated by driver: ${driver.firstName} ${driver.lastName}`
      });
      setSuccess('Delivery status updated successfully');
      await fetchDriverOrders(driverId);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update delivery status');
    } finally {
      setLoading(false);
    }
  };

  const handleShowCustomerDetails = async (customerId) => {
    try {
      setLoading(true);
      const res = await client.get(`/api/customers/${customerId}`);
      setSelectedCustomer(res.data);
      setShowCustomerDetails(true);
    } catch (e) {
      console.error('Failed to fetch customer details:', e);
      setError('Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  };

  const closeCustomerDetails = () => {
    setShowCustomerDetails(false);
    setSelectedCustomer(null);
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'assigned': return 'bg-orange-100 text-orange-700';
      case 'picked': return 'bg-blue-100 text-blue-700';
      case 'in_transit': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'busy': return 'bg-yellow-100 text-yellow-700';
      case 'unavailable': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen flex flex-col login-page">
        <Header />

        {/* Content */}
        <main className="main-content">
          <div className="login-container">
            <div className="login-card">
              <div className="login-header">
                <h2 className="login-title">Driver Login</h2>
                <p className="login-subtitle">Access your dashboard and manage deliveries</p>
              </div>
              
              <form onSubmit={handleLogin} className="login-form">
                <div className="field">
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="input"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="field">
                  <label className="label">License Number</label>
                  <input
                    type="text"
                    value={loginData.licenseNumber}
                    onChange={(e) => setLoginData({...loginData, licenseNumber: e.target.value})}
                    className="input"
                    placeholder="Enter your license number"
                    required
                  />
                </div>
                
                {error && <div className="alert-error">{error}</div>}
                {success && <div className="alert-success">{success}</div>}
                
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="driver-dashboard-page">
      <DriverDashboardHeader driver={driver} onLogout={handleLogout} />
      
      {/* Alert Messages - Positioned right after header */}
      <div className="alerts-container">
        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}
      </div>
      
      <div className="container">
        {/* Driver Profile Header */}
        <div className="driver-profile-header">
          <div className="driver-info-section">
            <div className="driver-avatar-large">
              {driver?.firstName?.charAt(0)}{driver?.lastName?.charAt(0)}
            </div>
            <div className="driver-details">
              <h2 className="driver-name-large">{driver?.firstName} {driver?.lastName}</h2>
              <p className="driver-email-large">{driver?.email}</p>
              <div className="driver-contact-info">
                <div className="contact-item">
                  <span className="contact-label">Phone:</span>
                  <span className="contact-value">{driver?.phone || 'Not provided'}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">License:</span>
                  <span className="contact-value">{driver?.licenseNumber || 'Not provided'}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Vehicle:</span>
                  <span className="contact-value">{driver?.vehicleType?.toUpperCase()} - {driver?.vehicleNumber}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Capacity:</span>
                  <span className="contact-value">{driver?.capacity}kg</span>
                </div>
              </div>
              <div className="driver-stats">
                <span className="stat-item">
                  <strong>{driver?.completedDeliveries || 0}</strong> Completed
                </span>
                <span className="stat-item">
                  <strong>{driver?.rating || 0}</strong> ⭐ Rating
                </span>
                <span className="stat-item">
                  <strong>{driver?.district || 'Not set'}</strong> District
                </span>
              </div>
            </div>
          </div>
          
          <div className="driver-actions-section">
            <div className="availability-controls">
              <h3>Update Your Status</h3>
              <p className="status-description">
                Update your availability status to help managers assign deliveries to you.
              </p>
              
              <div className="availability-buttons">
                <button 
                  onClick={() => updateAvailability('available')}
                  className={`btn-availability ${driver?.availability === 'available' ? 'active' : ''}`}
                  disabled={loading}
                  title="Click to set status as Available for new deliveries"
                >
                  <span className="availability-icon">✅</span>
                  <span className="availability-text">Available</span>
                  <span className="availability-description">Ready for new orders</span>
                </button>
                <button 
                  onClick={() => updateAvailability('busy')}
                  className={`btn-availability ${driver?.availability === 'busy' ? 'active' : ''}`}
                  disabled={loading}
                  title="Click to set status as Busy - currently on delivery"
                >
                  <span className="availability-icon">🚛</span>
                  <span className="availability-text">Busy</span>
                  <span className="availability-description">Currently on delivery</span>
                </button>
                <button 
                  onClick={() => updateAvailability('unavailable')}
                  className={`btn-availability ${driver?.availability === 'unavailable' ? 'active' : ''}`}
                  disabled={loading}
                  title="Click to set status as Unavailable"
                >
                  <span className="availability-icon">❌</span>
                  <span className="availability-text">Unavailable</span>
                  <span className="availability-description">Not available for orders</span>
                </button>
              </div>
              
              <div className="current-status-display">
                <span className="status-label">Current Status:</span>
                <span className={`status-badge ${driver?.availability}`}>
                  {driver?.availability || 'Not set'}
                </span>
              </div>
            </div>
            
            <div className="district-controls">
              <h4>Operating District</h4>
              <select
                value={driver?.district || ''}
                onChange={(e) => {
                  console.log('District changed to:', e.target.value);
                  updateDriverInfo('district', e.target.value);
                }}
                className="district-select"
                disabled={loading}
              >
                <option value="">Select district</option>
                <option value="Colombo">Colombo</option>
                <option value="Kalutara">Kalutara</option>
                <option value="Gampaha">Gampaha</option>
              </select>
            </div>
            
          </div>
        </div>


        {/* Orders Section */}
        <div className="orders-section">
          <div className="section-header">
            <h3>My Assigned Orders</h3>
            <p>Manage your delivery orders and update their status</p>
          </div>

          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No orders assigned</h3>
              <p>You don't have any pending orders at the moment.</p>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => {
                console.log('Order data:', order);
                return (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h4 className="order-id">Order #{order._id || order.orderId || 'N/A'}</h4>
                      <span className={`order-status ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">Customer:</span>
                      <span className="detail-value">
                        {order.customerId?.name || 'Guest Customer'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{order.customerId?.phone}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{order.customerId?.email}</span>
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
                      <span className="detail-value">
                        {order.items?.length || 0} items
                      </span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button 
                      onClick={() => handleShowCustomerDetails(order.customerId._id)}
                      className="btn-status-update"
                      disabled={loading}
                    >
                      📋 Details
                    </button>
                    {order.status === 'picked' && (
                      <button 
                        onClick={() => updateDeliveryStatus(order._id, 'in_transit')}
                        className="btn-status-update"
                        disabled={loading}
                      >
                        🚛 Start Delivery
                      </button>
                    )}
                    {order.status === 'in_transit' && (
                      <button 
                        onClick={() => updateDeliveryStatus(order._id, 'delivered')}
                        className="btn-status-update delivered"
                        disabled={loading}
                      >
                        ✅ Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {showCustomerDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  Customer Details
                </h3>
                <button
                  onClick={closeCustomerDetails}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedCustomer ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-bold text-lg">
                        {selectedCustomer.name?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {selectedCustomer.name || 'N/A'}
                      </h4>
                      <p className="text-gray-600 text-sm">{selectedCustomer.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Name:</span>
                      <span className="text-gray-900">{selectedCustomer.name || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Phone:</span>
                      <span className="text-gray-900">{selectedCustomer.phone || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Email:</span>
                      <span className="text-gray-900">{selectedCustomer.email || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-start py-2">
                      <span className="text-sm font-medium text-gray-700">Address:</span>
                      <span className="text-gray-900 text-right max-w-48">
                        {selectedCustomer.address || 'No address provided'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">👤</div>
                  <p className="text-gray-500">Loading customer details...</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={closeCustomerDetails}
                className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverDashboard;
