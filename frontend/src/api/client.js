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

export default api;


