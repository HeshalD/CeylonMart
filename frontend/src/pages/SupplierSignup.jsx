import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supplierAPI } from '../api';
import Header from '../Header';
import Footer from '../Footer';

const CATEGORY_OPTIONS = [
  'Fresh Products',
  'Dairy and Eggs',
  'Pantry Staples (Dry Goods)',
  'Frozen Foods',
  'Snacks and Beverages',
  'Household and Essentials',
  'Personal Care',
  'Other',
];

const SupplierSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    product: '',
    categories: [],
    password: '',
    confirmPassword: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const gmailRegex = /^\S+@gmail\.com$/;
  const phoneRegex = /^0\d{9}$/;
  const strongPasswordRegex = /^(?=.*[A-Z]).{8,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const exists = prev.categories.includes(value);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== value)
          : [...prev.categories, value],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    // Email & phone validation
    if (!gmailRegex.test(String(formData.email))) {
      setError('Email must be a gmail.com address.');
      return;
    }
    if (!phoneRegex.test(String(formData.phone))) {
      setError('Phone must start with 0 and be 10 digits.');
      return;
    }

    if (!String(formData.product).trim()) {
      setError('Product is required.');
      return;
    }

    // Basic client-side password validation if provided
    if (formData.password || formData.confirmPassword) {
      if (!formData.password || !formData.confirmPassword) {
        setError('Please enter both password and confirm password.');
        return;
      }
      if (!strongPasswordRegex.test(String(formData.password))) {
        setError('Password must be at least 8 characters and include one uppercase letter.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    try {
      setLoading(true);
      // Register supplier -> backend sends OTP
      const payload = {
        ...formData,
        products: formData.product
          ? String(formData.product)
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean)
          : [],
      };
      delete payload.product;
      const res = await supplierAPI.registerSupplier(payload);
      if (res?.data?._id) {
        localStorage.setItem('supplierId', res.data._id);
        localStorage.setItem('supplierEmail', formData.email);
      }
      setOtpSent(true);
      setSuccess('OTP sent to your email. Redirecting to verification...');
      setTimeout(() => navigate('/verify-otp'), 800);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Supplier Signup</h1>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-200">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded bg-green-100 text-green-700 border border-green-200">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Name</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <input
                  type="text"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Main product(s) you supply"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password (optional)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      value={opt}
                      checked={formData.categories.includes(opt)}
                      onChange={handleCategoryChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-md transition disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit & Send OTP'}
            </button>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SupplierSignup;


