import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useUser } from '../contexts/UserContext';

function DriverDashboard() {
  const { user, userRole, isAuthenticated, login, logout } = useUser();
  const [driver, setDriver] = useState(null);
  const [driverId, setDriverId] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogin, setShowLogin] = useState(true);

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
      // Search for driver by email and license number
      const res = await client.get('/drivers/search/filter', {
        params: { email: loginData.email }
      });
      
      const foundDriver = res.data.find(d => 
        d.email === loginData.email && 
        d.licenseNumber.toString() === loginData.licenseNumber.toString()
      );

      if (foundDriver) {
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
        params: { status: 'pending,picked,in_transit' }
      });
      setOrders(res.data.deliveries || []);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    }
  };

  const updateAvailability = async (availability) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await client.patch(`/drivers/${driverId}/availability`, { availability });
      setDriver({ ...driver, availability });
      setSuccess('Availability updated successfully');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  const updateDriverInfo = async (field, value) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await client.put(`/drivers/${driverId}`, { [field]: value });
      setDriver({ ...driver, [field]: value });
      setSuccess('Driver information updated successfully');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update driver information');
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


  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
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
    );
  }

  return (
    <div>
      {/* Driver Profile Header */}
      <div className="driver-profile-header">
        <div className="driver-info-section">
          <div className="driver-avatar-large">
            {driver?.firstName?.charAt(0)}{driver?.lastName?.charAt(0)}
          </div>
          <div className="driver-details">
            <h2 className="driver-name-large">{driver?.firstName} {driver?.lastName}</h2>
            <p className="driver-email-large">{driver?.email}</p>
            <div className="driver-stats">
              <span className="stat-item">
                <strong>{driver?.completedDeliveries || 0}</strong> Completed
              </span>
              <span className="stat-item">
                <strong>{driver?.rating || 0}</strong> ⭐ Rating
              </span>
              <span className="stat-item">
                <strong>{driver?.district}</strong> District
              </span>
            </div>
          </div>
        </div>
        
        <div className="driver-actions-section">
          <div className="availability-controls">
            <h3>Update Your Profile</h3>
            <p className="text-sm text-gray-600 mb-4">
              Update your operating district and availability status. This information helps managers assign deliveries to you.
            </p>
            <div className="driver-update-form">
              <div className="field">
                <label className="label">Operating District</label>
                <select
                  value={driver?.district || ''}
                  onChange={(e) => updateDriverInfo('district', e.target.value)}
                  className="input"
                  disabled={loading}
                >
                  <option value="">Select district</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Kalutara">Kalutara</option>
                </select>
              </div>
              
              <div className="availability-buttons">
                <button 
                  onClick={() => updateAvailability('available')}
                  className={`btn-availability ${driver?.availability === 'available' ? 'active' : ''}`}
                  disabled={loading}
                >
                  ✅ Available
                </button>
                <button 
                  onClick={() => updateAvailability('busy')}
                  className={`btn-availability ${driver?.availability === 'busy' ? 'active' : ''}`}
                  disabled={loading}
                >
                  🚛 Busy
                </button>
                <button 
                  onClick={() => updateAvailability('unavailable')}
                  className={`btn-availability ${driver?.availability === 'unavailable' ? 'active' : ''}`}
                  disabled={loading}
                >
                  ❌ Unavailable
                </button>
              </div>
              <span className={`current-status ${getAvailabilityColor(driver?.availability)}`}>
                Current: {driver?.availability}
              </span>
            </div>
          </div>
          
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}
      {success && <div className="alert-success mb-4">{success}</div>}

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
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h4 className="order-id">Order #{order.orderId}</h4>
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
                      {order.customerId?.firstName} {order.customerId?.lastName}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{order.customerId?.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Delivery Address:</span>
                    <span className="detail-value">
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Items:</span>
                    <span className="detail-value">
                      {order.items?.length || 0} items ({order.totalWeight}kg)
                    </span>
                  </div>
                </div>

                <div className="order-actions">
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => updateDeliveryStatus(order._id, 'picked')}
                      className="btn-status-update"
                      disabled={loading}
                    >
                      📦 Mark as Picked
                    </button>
                  )}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverDashboard;
