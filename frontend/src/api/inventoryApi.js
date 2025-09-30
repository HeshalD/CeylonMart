import axios from "axios";

const API_URL = "http://localhost:5000/categories";

// Get all categories
export const getCategories = () => axios.get(API_URL);

// Add new category
export const addCategory = (formData) =>
  axios.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Update category
export const updateCategory = (id, formData) =>
  axios.put(`${API_URL}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Delete category
export const deleteCategory = (id) => axios.delete(`${API_URL}/${id}`);

// Get single category
export const getCategoryById = (id) => axios.get(`${API_URL}/${id}`);

// Product-related functions
export const getProducts = async () => {
  try {
    const response = await axios.get('http://localhost:5000/products');
    return { data: response.data.products || [] };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: [] };
  }
};

export const getExpiringProducts = async () => {
  try {
    const response = await axios.get('http://localhost:5000/products');
    const products = response.data.products || [];
    
    const calculateDaysLeft = (expiryDate) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const exp = new Date(expiryDate);
      exp.setHours(0, 0, 0, 0);
      const diff = Math.floor((exp - today) / (1000 * 60 * 60 * 24));
      return diff;
    };
    
    const expiringProducts = products.filter(p => calculateDaysLeft(p.expiryDate) <= 10);
    return { data: expiringProducts };
  } catch (error) {
    console.error('Error fetching expiring products:', error);
    return { data: [] };
  }
};

export const getReorderSuggestions = () => Promise.resolve({ data: [] });

// ✅ Updated: connect to backend Reports API
export const generateInventoryReport = async (reportType, payload) => {
  try {
    const response = await axios.post('http://localhost:5000/api/reports/generate', {
      reportType,
      ...payload,
    });
    return response;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};

export const getSalesTrends = () => Promise.resolve({ data: [] });

export const getStockHistory = () => Promise.resolve({ data: [] });

const API = axios.create({ baseURL: "http://localhost:5000" });

export const getLowStockProducts = () => API.get("/products/low-stock");
