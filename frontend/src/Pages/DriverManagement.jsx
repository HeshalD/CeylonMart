import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Header from '../components/Header';
import './DriverManagement.css';

function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [showDriverSelectionModal, setShowDriverSelectionModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableDriversForOrder, setAvailableDriversForOrder] = useState([]);
  const [showAllDrivers, setShowAllDrivers] = useState(false);
  const [driverSearchTerm, setDriverSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    vehicleType: '',
    vehicleNumber: '',
    capacity: '',
    district: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDrivers();
    fetchOrders();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all drivers (including inactive ones for management)
      const res = await client.get('/drivers');
      console.log('All drivers:', res.data);
      setDrivers(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      // Fetch orders that need driver assignment
      const res = await client.get('/orders');
      console.log('All orders:', res.data);
      // Filter for orders that don't have a driver assigned yet
      const unassignedOrders = res.data.filter(order => 
        order.status === 'pending' && !order.driverId
      );
      setOrders(unassignedOrders);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
      setError(e.response?.data?.error || 'Failed to fetch orders');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName || !formData.firstName.toString().trim()) errors.firstName = 'First name is required';
    if (!formData.lastName || !formData.lastName.toString().trim()) errors.lastName = 'Last name is required';
    if (!formData.email || !formData.email.toString().trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email.toString())) errors.email = 'Invalid email format';
    if (!formData.phone || !formData.phone.toString().trim()) errors.phone = 'Phone number is required';
    else if (isNaN(formData.phone)) errors.phone = 'Phone must be numeric';
    if (!formData.licenseNumber || !formData.licenseNumber.toString().trim()) errors.licenseNumber = 'License number is required';
    else if (isNaN(formData.licenseNumber)) errors.licenseNumber = 'License number must be numeric';
    if (!formData.vehicleType || !formData.vehicleType.toString().trim()) errors.vehicleType = 'Vehicle type is required';
    if (!formData.vehicleNumber || !formData.vehicleNumber.toString().trim()) errors.vehicleNumber = 'Vehicle number is required';
    if (!formData.capacity || !formData.capacity.toString().trim()) errors.capacity = 'Capacity is required';
    else if (isNaN(formData.capacity) || parseInt(formData.capacity) < 1) errors.capacity = 'Capacity must be a number greater than 0';
    if (!formData.district || !formData.district.toString().trim()) errors.district = 'District is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convert numeric fields to numbers before sending to backend
      const submitData = {
        ...formData,
        phone: parseInt(formData.phone),
        licenseNumber: parseInt(formData.licenseNumber),
        capacity: parseInt(formData.capacity)
      };
      
      console.log('Submitting driver data:', submitData);
      if (editingDriver) {
        const response = await client.put(`/drivers/${editingDriver._id}`, submitData);
        console.log('Update response:', response.data);
        setSuccess('Driver updated successfully');
      } else {
        const response = await client.post('/drivers', submitData);
        console.log('Create response:', response.data);
        setSuccess('Driver added successfully');
      }
      
      setShowModal(false);
      resetForm();
      await fetchDrivers();
    } catch (e) {
      console.error('Error saving driver:', e.response?.data);
      setError(e.response?.data?.error || 'Failed to save driver');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await client.delete(`/drivers/${id}`);
      setSuccess('Driver deleted successfully');
      await fetchDrivers();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to delete driver');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      firstName: driver.firstName || '',
      lastName: driver.lastName || '',
      email: driver.email || '',
      phone: driver.phone ? driver.phone.toString() : '',
      licenseNumber: driver.licenseNumber ? driver.licenseNumber.toString() : '',
      vehicleType: driver.vehicleType || '',
      vehicleNumber: driver.vehicleNumber || '',
      capacity: driver.capacity ? driver.capacity.toString() : '',
      district: driver.district || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      vehicleType: '',
      vehicleNumber: '',
      capacity: '',
      district: ''
    });
    setEditingDriver(null);
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterDistrict('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const findNearestDriver = (orderDistrict) => {
    // Find available drivers in the same district
    const availableDrivers = drivers.filter(driver => 
      driver.availability === 'available' && 
      driver.district === orderDistrict &&
      !driver.isDeleted
    );
    
    if (availableDrivers.length === 0) {
      return null;
    }
    
    // For now, return the first available driver in the same district
    // In a real app, you might want to consider driver capacity, current load, etc.
    return availableDrivers[0];
  };

  const showAvailableDriversForOrder = (order) => {
    const orderDistrict = order.deliveryAddress?.district;
    
    if (!orderDistrict) {
      setError('Order does not have a delivery district specified');
      return;
    }
    
    // Find available drivers in the same district
    const availableDrivers = drivers.filter(driver => 
      driver.availability === 'available' && 
      driver.district === orderDistrict &&
      !driver.isDeleted
    );
    
    if (availableDrivers.length === 0) {
      setError(`No available drivers found in ${orderDistrict} district`);
      return;
    }
    
    setSelectedOrder(order);
    setAvailableDriversForOrder(availableDrivers);
    setShowAllDrivers(false);
    setDriverSearchTerm('');
    setShowDriverSelectionModal(true);
  };

  const showAllDriversForOrder = (order) => {
    setSelectedOrder(order);
    setAvailableDriversForOrder(drivers.filter(driver => !driver.isDeleted));
    setShowAllDrivers(true);
    setDriverSearchTerm('');
    setShowDriverSelectionModal(true);
  };

  const assignOrderToSelectedDriver = async (driverId, driverName) => {
    try {
      setLoading(true);
      setError('');
      
      // Assign the order to the selected driver
      const response = await client.patch(`/orders/${selectedOrder._id}/assign`, {
        driverId: driverId,
        status: 'assigned'
      });
      
      setSuccess(`Order assigned to ${driverName} in ${selectedOrder.deliveryAddress?.district}`);
      
      // Close modal and refresh data
      setShowDriverSelectionModal(false);
      setSelectedOrder(null);
      setAvailableDriversForOrder([]);
      await fetchOrders();
      await fetchDrivers();
      
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to assign order to driver');
    } finally {
      setLoading(false);
    }
  };



  // const getAvailabilityColor = (availability) => {
  //   switch (availability) {
  //     case 'available': return 'bg-green-100 text-green-700';
  //     case 'busy': return 'bg-yellow-100 text-yellow-700';
  //     case 'unavailable': return 'bg-red-100 text-red-700';
  //     default: return 'bg-gray-100 text-gray-700';
  //   }
  // };

  // Filter drivers based on search and filter criteria
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = !searchTerm || 
      driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || driver.vehicleType === filterType;
    const matchesDistrict = !filterDistrict || driver.district === filterDistrict;
    
    return matchesSearch && matchesType && matchesDistrict;
  });

  const vehicleTypes = ['car', 'van', 'bike', 'lorry'];
  const districts = ['Colombo', 'Gampaha', 'Kalutara'];

  return (
    <div className="driver-management-page">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
      <div className="page-header">
        <div>
          <h2 className="page-title">Driver Management</h2>
          <p className="page-subtitle">Manage your delivery drivers efficiently</p>
        </div>
        <div className="flex gap-3">
          <button onClick={openAddModal} className="btn-primary">
            <span>+</span> Add Driver
          </button>
        </div>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}
      {success && <div className="alert-success mb-4">{success}</div>}

      {/* Search and Filter Section */}
      <div className="section">
        <div className="filter-grid">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input"
          >
            <option value="">All Vehicle Types</option>
            {vehicleTypes.map(type => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="input"
          >
            <option value="">All Districts</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
        </div>
      </div>

      {/* Orders Section */}
      <div className="section">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pending Orders</h2>
          <button 
            onClick={fetchOrders} 
            className="btn-secondary"
          >
            🔄 Refresh Orders
          </button>
        </div>
        
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No pending orders</h3>
            <p>All orders have been assigned to drivers.</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <h4 className="order-id">Order #{order.orderId || order._id}</h4>
                  <span className="order-status pending">Pending Assignment</span>
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
                    <span className="detail-label">Delivery District:</span>
                    <span className="detail-value">{order.deliveryAddress?.district || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Items:</span>
                    <span className="detail-value">
                      {order.items?.length || 0} items ({order.totalWeight || 0}kg)
                    </span>
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
                    onClick={() => showAvailableDriversForOrder(order)}
                    className="btn-primary"
                    disabled={loading}
                  >
                    🚛 Select from District
                  </button>
                  <button 
                    onClick={() => showAllDriversForOrder(order)}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    👤 Choose Any Driver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drivers Grid */}
      <div className="table-container">
        {loading ? (
          <div className="loading">Loading drivers...</div>
        ) : filteredDrivers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚛</div>
            <h3>No drivers found</h3>
            <p>Try adjusting your search criteria or add a new driver.</p>
          </div>
        ) : (
          <div className="drivers-grid">
            {filteredDrivers.map((driver) => (
              <div key={driver._id} className="driver-card">
                <div className="driver-header">
                  <div className="driver-avatar">
                    {driver.firstName?.charAt(0)}{driver.lastName?.charAt(0)}
                  </div>
                  <div className="driver-info">
                    <div className="driver-name">{driver.firstName} {driver.lastName}</div>
                    <div className="muted">{driver.email}</div>
                  </div>
                  <div className="availability-info">
                    <span className={`badge ${driver.availability}`}>{driver.availability}</span>
                  </div>
                </div>
                
                <div className="driver-details">
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{driver.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">License:</span>
                    <span className="detail-value">{driver.licenseNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Vehicle:</span>
                    <span className="detail-value">{driver.vehicleType?.toUpperCase()} - {driver.vehicleNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Capacity:</span>
                    <span className="detail-value">{driver.capacity} kg/items</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">District:</span>
                    <span className="detail-value">📍 {driver.district || 'Not set'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Deliveries:</span>
                    <span className="detail-value">{driver.completedDeliveries || 0} completed</span>
                  </div>
                </div>

                <div className="driver-actions">
                  <button onClick={() => handleEdit(driver)} className="btn-edit">
                    <span>✏️</span> Edit
                  </button>
                  <button onClick={() => handleDelete(driver._id)} className="btn-delete">
                    <span>🗑️</span> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h3>
              <button onClick={closeModal} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="field">
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className={`input ${formErrors.firstName ? 'error' : ''}`}
                    placeholder="Enter first name"
                  />
                  {formErrors.firstName && <div className="error">{formErrors.firstName}</div>}
                </div>
                <div className="field">
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className={`input ${formErrors.lastName ? 'error' : ''}`}
                    placeholder="Enter last name"
                  />
                  {formErrors.lastName && <div className="error">{formErrors.lastName}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label className="label">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`input ${formErrors.email ? 'error' : ''}`}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && <div className="error">{formErrors.email}</div>}
                </div>
                <div className="field">
                  <label className="label">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`input ${formErrors.phone ? 'error' : ''}`}
                    placeholder="Enter phone number"
                  />
                  {formErrors.phone && <div className="error">{formErrors.phone}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label className="label">License Number *</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    className={`input ${formErrors.licenseNumber ? 'error' : ''}`}
                    placeholder="Enter license number"
                  />
                  {formErrors.licenseNumber && <div className="error">{formErrors.licenseNumber}</div>}
                </div>
                <div className="field">
                  <label className="label">Vehicle Type *</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className={`input ${formErrors.vehicleType ? 'error' : ''}`}
                  >
                    <option value="">Select vehicle type</option>
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type.toUpperCase()}</option>
                    ))}
                  </select>
                  {formErrors.vehicleType && <div className="error">{formErrors.vehicleType}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label className="label">Vehicle Number *</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                    className={`input ${formErrors.vehicleNumber ? 'error' : ''}`}
                    placeholder="Enter vehicle number"
                  />
                  {formErrors.vehicleNumber && <div className="error">{formErrors.vehicleNumber}</div>}
                </div>
                <div className="field">
                  <label className="label">Capacity (kg/items) *</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className={`input ${formErrors.capacity ? 'error' : ''}`}
                    placeholder="Enter capacity"
                    min="1"
                  />
                  {formErrors.capacity && <div className="error">{formErrors.capacity}</div>}
                </div>
              </div>

              <div className="field">
                <label className="label">Operating District *</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  className={`input ${formErrors.district ? 'error' : ''}`}
                >
                  <option value="">Select district</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                {formErrors.district && <div className="error">{formErrors.district}</div>}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (editingDriver ? 'Update Driver' : 'Add Driver')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Selection Modal */}
      {showDriverSelectionModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select Driver for Order #{selectedOrder.orderId || selectedOrder._id}</h2>
              <button 
                onClick={() => {
                  setShowDriverSelectionModal(false);
                  setSelectedOrder(null);
                  setAvailableDriversForOrder([]);
                  setShowAllDrivers(false);
                  setDriverSearchTerm('');
                }}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            
            <div className="order-info-section">
              <h3>Order Details:</h3>
              <div className="order-info-grid">
                <div className="info-item">
                  <span className="info-label">Customer:</span>
                  <span className="info-value">
                    {selectedOrder.customerId?.firstName} {selectedOrder.customerId?.lastName}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Delivery District:</span>
                  <span className="info-value">{selectedOrder.deliveryAddress?.district}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Items:</span>
                  <span className="info-value">
                    {selectedOrder.items?.length || 0} items ({selectedOrder.totalWeight || 0}kg)
                  </span>
                </div>
              </div>
            </div>

            <div className="available-drivers-section">
              <div className="drivers-section-header">
                <h3>
                  {showAllDrivers ? 'All Drivers' : `Available Drivers in ${selectedOrder.deliveryAddress?.district}`}
                </h3>
                {showAllDrivers && (
                  <div className="driver-search-container">
                    <input
                      type="text"
                      placeholder="Search drivers by name, email, or district..."
                      value={driverSearchTerm}
                      onChange={(e) => setDriverSearchTerm(e.target.value)}
                      className="driver-search-input"
                    />
                  </div>
                )}
              </div>
              
              {(() => {
                let filteredDrivers = availableDriversForOrder;
                
                if (showAllDrivers && driverSearchTerm) {
                  filteredDrivers = availableDriversForOrder.filter(driver => 
                    (driver.firstName && driver.firstName.toLowerCase().includes(driverSearchTerm.toLowerCase())) ||
                    (driver.lastName && driver.lastName.toLowerCase().includes(driverSearchTerm.toLowerCase())) ||
                    (driver.email && driver.email.toLowerCase().includes(driverSearchTerm.toLowerCase())) ||
                    (driver.district && driver.district.toLowerCase().includes(driverSearchTerm.toLowerCase())) ||
                    (driver.vehicleType && driver.vehicleType.toLowerCase().includes(driverSearchTerm.toLowerCase()))
                  );
                }
                
                return filteredDrivers.length === 0 ? (
                  <div className="no-drivers-message">
                    <p>
                      {showAllDrivers ? 
                        (driverSearchTerm ? 'No drivers found matching your search.' : 'No drivers available.') :
                        'No available drivers found in this district.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="drivers-selection-grid">
                    {filteredDrivers.map((driver) => (
                      <div key={driver._id} className="driver-selection-card">
                        <div className="driver-selection-info">
                          <div className="driver-avatar-small">
                            {driver.firstName?.[0]}{driver.lastName?.[0]}
                          </div>
                          <div className="driver-details-small">
                            <div className="driver-name-small">
                              {driver.firstName} {driver.lastName}
                              {showAllDrivers && (
                                <span className={`availability-badge ${driver.availability}`}>
                                  {driver.availability}
                                </span>
                              )}
                            </div>
                            <div className="driver-contact-small">
                              {driver.phone} • {driver.email}
                            </div>
                            <div className="driver-vehicle-small">
                              {driver.vehicleType?.toUpperCase()} • {driver.vehicleNumber}
                            </div>
                            <div className="driver-capacity-small">
                              Capacity: {driver.capacity}kg
                            </div>
                            {showAllDrivers && (
                              <div className="driver-district-small">
                                District: {driver.district || 'Not specified'}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => assignOrderToSelectedDriver(
                            driver._id, 
                            `${driver.firstName} ${driver.lastName}`
                          )}
                          className={`assign-driver-btn ${driver.availability !== 'available' && showAllDrivers ? 'disabled-driver' : ''}`}
                          disabled={loading}
                          title={driver.availability !== 'available' && showAllDrivers ? 
                            `Warning: This driver is currently ${driver.availability}` : 
                            'Assign order to this driver'
                          }
                        >
                          Assign to this Driver
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
}

export default DriverManagement;