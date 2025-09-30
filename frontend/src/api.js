import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('supplierId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('supplierStatus');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API functions
export const authAPI = {
  // Register supplier
  register: (supplierData) => api.post('/auth/register', supplierData),
  
  // Verify OTP
  verifyOTP: (otpData) => api.post('/auth/verify-otp', otpData),
  // Resend OTP
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  
  // Login supplier
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current supplier profile
  getProfile: () => api.get('/suppliers/me'),
  
  // Password reset
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Supplier API functions
export const supplierAPI = {
  // Register supplier and send OTP
  registerSupplier: (supplierData) => api.post('/suppliers/register', supplierData),
  // Verify OTP
  verifyOtp: (payload) => api.post('/suppliers/verify-otp', payload),
  // Create supplier
  createSupplier: (supplierData) => api.post('/suppliers', supplierData),
  // Get all suppliers (admin only)
  getAllSuppliers: () => api.get('/suppliers'),
  
  // Get single supplier by ID
  getSupplierById: (id) => api.get(`/suppliers/${id}`),
  
  // Update supplier
  updateSupplier: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
  // Approve supplier (admin)
  approveSupplier: (id) => api.patch(`/suppliers/${id}/approve`),
  // Reject supplier (admin)
  rejectSupplier: (id) => api.patch(`/suppliers/${id}/reject`),
  
  // Delete supplier
  deleteSupplier: (id) => api.delete(`/suppliers/${id}`),
};

export default api;

// OTP-only flow endpoints (standalone minimal registration)
export const otpAPI = {
  sendOtp: (payload) => api.post('/send-otp', payload),
  verifyOtp: (payload) => api.post('/verify-otp', payload),
};

// Notifications & Messaging
export const notificationAPI = {
  sendToSupplier: (payload) => api.post('/admin/send-notification', payload),
  getSupplierNotifications: (supplierId) => api.get(`/supplier/notifications/${supplierId}`),
  markNotificationRead: (notificationId) => api.patch(`/supplier/notifications/${notificationId}/mark-read`),
  deleteNotification: (notificationId) => api.delete(`/supplier/notifications/${notificationId}`),
};

export const messageAPI = {
  supplierReply: (supplierId, payload) => api.post(`/supplier/reply/${supplierId}`, payload),
  getSupplierThread: (supplierId) => api.get(`/supplier/messages/${supplierId}`),
  getAdminThread: (supplierId) => api.get(`/admin/messages/${supplierId}`),
  markMessageRead: (messageId) => api.patch(`/supplier/messages/${messageId}/mark-read`),
  // Admin inbox
  getAdminInbox: () => api.get('/admin/inbox'),
  adminMarkRead: (messageId) => api.patch(`/admin/messages/${messageId}/mark-read`),
  adminDeleteMessage: (messageId) => api.delete(`/admin/messages/${messageId}`),
};
