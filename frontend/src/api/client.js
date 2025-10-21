import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" }
});

export const OrdersAPI = {
  createOrder(payload) {
    return api.post(`/orders`, payload).then(r => r.data);
  },
  getOrderById(orderId) {
    return api.get(`/orders/${orderId}`).then(r => r.data);
  },
  getCart(customerId) {
    return api.get(`/orders/cart/${customerId}`).then(r => r.data);
  },
  addItemToCart(customerId, payload) {
    return api.post(`/orders/cart/${customerId}/items`, payload).then(r => r.data);
  },
  updateItemQuantity(orderId, productId, quantity) {
    return api.put(`/orders/${orderId}/items/${productId}`, { quantity }).then(r => r.data);
  },
  removeItem(orderId, productId) {
    return api.delete(`/orders/${orderId}/items/${productId}`).then(r => r.data);
  },
  clearCart(orderId) {
    return api.delete(`/orders/${orderId}/items`).then(r => r.data);
  },
  getOrders() {
    return api.get(`/orders`).then(r => r.data);
  }
};

export const PaymentsAPI = {
  createPayment(payload) {
    return api.post(`/payments`, payload).then(r => r.data);
  },
  getPaymentById(paymentId) {
    return api.get(`/payments/${paymentId}`).then(r => r.data);
  },
  getPayments() {
    return api.get(`/payments`).then(r => r.data);
  },
  updatePaymentStatus(paymentId, status) {
    return api.put(`/payments/${paymentId}/status`, { status }).then(r => r.data);
  }
};

export const CustomersAPI = {
  createCustomer(payload) {
    return api.post(`/api/customers`, payload).then(r => r.data);
  },
  getCustomer(id) {
    return api.get(`/api/customers/${id}`).then(r => r.data);
  }
};

export const DriversAPI = {
  // Create driver
  createDriver(payload) {
    return api.post(`/drivers`, payload).then(r => r.data);
  },
  
  // Get all drivers
  getDrivers() {
    return api.get(`/drivers`).then(r => r.data);
  },
  
  // Get available drivers
  getAvailableDrivers() {
    return api.get(`/drivers/available`).then(r => r.data);
  },
  
  // Get driver by ID
  getDriverById(id) {
    return api.get(`/drivers/${id}`).then(r => r.data);
  },
  
  // Get driver history
  getDriverHistory(id) {
    return api.get(`/drivers/${id}/history`).then(r => r.data);
  },
  
  // Update driver
  updateDriver(id, payload) {
    return api.put(`/drivers/${id}`, payload).then(r => r.data);
  },
  
  // Update driver availability
  updateDriverAvailability(id, availability) {
    return api.patch(`/drivers/${id}/availability`, { availability }).then(r => r.data);
  },
  
  // Update driver district
  updateDriverDistrict(id, district) {
    return api.patch(`/drivers/${id}/district`, { district }).then(r => r.data);
  },
  
  // Delete driver
  deleteDriver(id) {
    return api.delete(`/drivers/${id}`).then(r => r.data);
  },
  
  // Download drivers PDF
  downloadDriversPDF() {
    return api.get(`/drivers/pdf`, {
      responseType: 'blob'
    }).then(r => r.data);
  }
};

export default api;


