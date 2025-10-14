import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, supplierAPI } from '../api';
import Header from '../Header';
import Footer from '../Footer';
import bgPhoto from '../bgPhoto.jpg';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    product: '',
    categories: [],
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [supplierId, setSupplierId] = useState(null);

  const gmailRegex = /^\S+@gmail\.com$/;
  const phoneRegex = /^07\d{8}$/; // 10 digits starting with 07
  const contactNameRegex = /^[A-Za-z\s]{3,}$/; // letters/spaces only, min 3 chars

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

  useEffect(() => {
    fetchSupplierProfile();
  }, []);

  const fetchSupplierProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      const supplier = response.data;
      setSupplierId(supplier._id);
      
      setFormData({
        companyName: supplier.companyName || '',
        contactName: supplier.contactName || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        product: Array.isArray(supplier.product) ? supplier.product.join(', ') : (supplier.product || ''),
        categories: Array.isArray(supplier.categories) ? supplier.categories : [],
        address: supplier.address || ''
      });
    } catch (err) {
      console.error('Error fetching supplier profile:', err);
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

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
    } else if (!gmailRegex.test(formData.email)) {
      newErrors.email = 'Email must be a gmail.com address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(String(formData.phone))) {
      newErrors.phone = 'Phone must be 10 digits and start with 07';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.product.trim()) {
      newErrors.product = 'Product is required';
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
      setSubmitLoading(true);

      const supplierData = {
        ...formData,
        products: formData.product
          .split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0),
        categories: Array.isArray(formData.categories) ? formData.categories : []
      };
      delete supplierData.product;

      await supplierAPI.updateSupplier(supplierId, supplierData);
      navigate('/supplierProfile');

    } catch (err) {
      console.error('Error updating supplier:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid data provided. Please check your inputs.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check if the server is running.';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/supplierProfile');
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col relative"
        style={{
          backgroundImage: `url(${bgPhoto})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Blur overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        
        <div className="relative z-10">
          <Header />
        </div>
        
        <div className="flex-grow flex justify-center items-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
        
        <div className="relative z-10">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url(${bgPhoto})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <div className="relative z-10">
        <Header />
      </div>
      
      <div className="flex-grow flex items-center justify-center py-8 px-4 relative z-10">
        <div className="container mx-auto max-w-2xl w-full">
          <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border border-white/20 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.companyName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter contact person name"
              />
              {errors.contactName && (
                <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
                Product(s) *
              </label>
              <input
                type="text"
                id="product"
                name="product"
                value={formData.product}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.product ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter products (comma separated)"
              />
              {errors.product && (
                <p className="mt-1 text-sm text-red-600">{errors.product}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories *
              </label>
              <div className={`mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-lg p-3 ${errors.categories ? 'border-red-500' : 'border-gray-300'}`}>
                {CATEGORY_OPTIONS.map(option => (
                  <label key={option} className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={formData.categories.includes(option)}
                      onChange={() => handleCategoryToggle(option)}
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {errors.categories && (
                <p className="mt-1 text-sm text-red-600">{errors.categories}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                {submitLoading ? 'Updating...' : 'Update Profile'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default EditProfile;
