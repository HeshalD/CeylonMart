import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import Header from '../Header';
import Footer from '../Footer';

const RegisterSupplier = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    product: '',
    categories: [],
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const gmailRegex = /^\S+@gmail\.com$/;
  const phoneRegex = /^07\d{8}$/; // 10 digits starting with 07
  const contactNameRegex = /^[A-Za-z\s]{3,}$/; // letters and spaces, at least 3 chars
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/; // 8+ with upper, lower, number, special

  const CATEGORY_OPTIONS = [
    'Fruits',
    'Vegetables',
    'Dairy',
    'Bakery',
    'Beverages',
    'Snacks',
    'Grains & Rice',
    'Spices',
    'Canned Foods',
    'Household Essentials'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    } else if (!contactNameRegex.test(formData.contactName.trim())) {
      newErrors.contactName = 'Only letters/spaces, min 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (formData.phone && !phoneRegex.test(String(formData.phone))) {
      newErrors.phone = 'Phone must be 10 digits and start with 07';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.product.trim()) {
      newErrors.product = 'Product is required';
    }

    if (formData.email && !gmailRegex.test(String(formData.email))) {
      newErrors.email = 'Email must be a gmail.com address';
    }

    // Password validation (optional but if provided must be valid/matching)
    if (formData.password || formData.confirmPassword) {
      if (!formData.password || !formData.confirmPassword) {
        newErrors.password = 'Enter both password and confirm password';
      } else if (!strongPasswordRegex.test(String(formData.password))) {
        newErrors.password = 'Min 8 chars, include upper, lower, number, special';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = 'Select at least one category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // real-time validation per field
      const fieldErrors = {};
      if (name === 'companyName') {
        fieldErrors.companyName = next.companyName.trim() ? '' : 'Company name is required';
      }
      if (name === 'contactName') {
        if (!next.contactName.trim()) fieldErrors.contactName = 'Contact name is required';
        else fieldErrors.contactName = contactNameRegex.test(next.contactName.trim()) ? '' : 'Only letters/spaces, min 3 characters';
      }
      if (name === 'email') {
        if (!next.email.trim()) fieldErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(next.email)) fieldErrors.email = 'Email is invalid';
        else fieldErrors.email = gmailRegex.test(next.email) ? '' : 'Email must be a gmail.com address';
      }
      if (name === 'phone') {
        if (!next.phone.trim()) fieldErrors.phone = 'Phone number is required';
        else fieldErrors.phone = phoneRegex.test(String(next.phone)) ? '' : 'Phone must be 10 digits and start with 07';
      }
      if (name === 'address') {
        fieldErrors.address = next.address.trim() ? '' : 'Address is required';
      }
      if (name === 'product') {
        fieldErrors.product = next.product.trim() ? '' : 'Product is required';
      }
      if (name === 'password' || name === 'confirmPassword') {
        // validate both passwords cohesively
        if (next.password || next.confirmPassword) {
          if (!next.password || !next.confirmPassword) {
            fieldErrors.password = 'Enter both password and confirm password';
            fieldErrors.confirmPassword = next.confirmPassword ? '' : '';
          } else if (!strongPasswordRegex.test(String(next.password))) {
            fieldErrors.password = 'Min 8 chars, include upper, lower, number, special';
            fieldErrors.confirmPassword = '';
          } else if (next.password !== next.confirmPassword) {
            fieldErrors.password = '';
            fieldErrors.confirmPassword = 'Passwords do not match';
          } else {
            fieldErrors.password = '';
            fieldErrors.confirmPassword = '';
          }
        } else {
          // both empty => clear
          fieldErrors.password = '';
          fieldErrors.confirmPassword = '';
        }
      }

      setErrors(prevErr => ({ ...prevErr, ...fieldErrors }));
      return next;
    });
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const alreadySelected = prev.categories.includes(category);
      const nextCategories = alreadySelected
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      // clear error when selecting
      setErrors(prevErr => ({
        ...prevErr,
        categories: nextCategories.length === 0 ? 'Select at least one category' : ''
      }));
      return { ...prev, categories: nextCategories };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const supplierData = {
        ...formData,
        // map single text inputs to arrays expected by backend
        products: formData.product
          ? formData.product
              .split(',')
              .map(p => p.trim())
              .filter(p => p.length > 0)
          : [],
        categories: Array.isArray(formData.categories) ? formData.categories : []
      };
      delete supplierData.product;

      const response = await authAPI.register(supplierData);
      
      // Store identifiers for OTP verification page
      const returnedId = response?.data?.supplierId || response?.data?._id || response?.data?.id;
      if (returnedId) {
        localStorage.setItem('supplierId', String(returnedId));
      }
      localStorage.setItem('supplierEmail', formData.email);
      
      // Navigate to OTP verification
      navigate('/verify-otp', { 
        state: { 
          message: 'Registration successful! Please check your email for OTP verification.' 
        } 
      });

    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid data provided. Please check your inputs.';
      } else if (err.response?.status === 409) {
        errorMessage = 'Email already exists. Please use a different email.';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full">
          <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Supplier Registration</h2>
              <p className="mt-2 text-emerald-100">Join CeylonMart as a supplier</p>
            </div>

            <div className="px-8 py-8">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
                  {errors.submit}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${errors.companyName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                      placeholder="Enter company name"
                    />
                    {errors.companyName && (
                      <p className="mt-2 text-sm text-red-600">{errors.companyName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contactName" className="block text-sm font-semibold text-gray-700 mb-2">Contact Name *</label>
                    <input
                      id="contactName"
                      name="contactName"
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${errors.contactName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                      placeholder="Enter contact person name"
                    />
                    {errors.contactName && (
                      <p className="mt-2 text-sm text-red-600">{errors.contactName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="product" className="block text-sm font-semibold text-gray-700 mb-2">Product *</label>
                    <input
                      id="product"
                      name="product"
                      type="text"
                      required
                      value={formData.product}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${errors.product ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                      placeholder="Enter main product(s) you supply"
                    />
                    {errors.product && (
                      <p className="mt-2 text-sm text-red-600">{errors.product}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Categories *</label>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-xl p-3 bg-white/50 backdrop-blur-sm ${errors.categories ? 'border-red-300' : 'border-gray-300'}`}>
                      {CATEGORY_OPTIONS.map(option => (
                        <label key={option} className="inline-flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
                            checked={formData.categories.includes(option)}
                            onChange={() => handleCategoryToggle(option)}
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    {errors.categories && (
                      <p className="mt-2 text-sm text-red-600">{errors.categories}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                    <textarea
                      id="address"
                      name="address"
                      required
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                      placeholder="Enter full address"
                    />
                    {errors.address && (
                      <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password (optional)</label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`block w-full px-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                        placeholder="At least 8 characters"
                      />
                      {errors.password && (
                        <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`block w-full px-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70"
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </button>
                </div>

                <div className="text-center pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/supplierLogin')}
                      className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterSupplier;
