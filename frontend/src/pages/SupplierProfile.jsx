import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI, messageAPI } from '../api';
import NotificationBell from '../components/NotificationBell';
import Header from '../Header';
import Footer from '../Footer';

const SupplierProfile = () => {
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSupplierProfile();
  }, []);

  const fetchSupplierProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setSupplier(response.data);
      // Ensure Header greeting persists on direct visits/refresh
      try {
        const profile = response.data;
        const displayName = profile?.contactName || profile?.companyName || 'Supplier';
        localStorage.setItem('user', JSON.stringify({ name: displayName, role: 'supplier' }));
      } catch (_) {
        // ignore
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching supplier profile:', err);
      setError('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const adminPhone = '+94716440276';
    const message = encodeURIComponent(`Supplier ${supplier?.companyName} needs stock discussion`);
    window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    const adminEmail = 'admin@ceylonmart.com';
    const subject = encodeURIComponent(`Stock Request from ${supplier?.companyName}`);
    const body = encodeURIComponent('Please review my request');
    window.open(`mailto:${adminEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleQuickMsg = async () => {
    const title = window.prompt('Title for message', 'Quick message');
    if (title === null) return;
    const content = window.prompt('Enter message for admin');
    if (!content) return;
    try {
      await messageAPI.supplierReply(supplier._id, { title, content });
      alert('Message sent to admin');
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('supplierId');
    localStorage.removeItem('supplierStatus');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Profile not found'}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Back to Login
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (supplier.status !== 'approved') {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
            Your account is pending admin approval.
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">{supplier.companyName}</h2>
                <p className="text-blue-100 text-lg">{supplier.contactName}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    supplier.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : supplier.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {supplier.status?.charAt(0).toUpperCase() + supplier.status?.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Contact Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{supplier.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{supplier.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-900 whitespace-pre-line">{supplier.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories and Actions */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Categories
                </h3>
                
                {supplier.categories && supplier.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(supplier.categories) ? supplier.categories.map((category, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                      >
                        {category}
                      </span>
                    )) : (
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {supplier.categories}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No categories specified</p>
                )}

                <div className="pt-2">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Products</h4>
                  <p className="text-gray-900">
                    {Array.isArray(supplier.products)
                      ? supplier.products.join(', ')
                      : (Array.isArray(supplier.product) ? supplier.product.join(', ') : (supplier.product || 'N/A'))}
                  </p>
                </div>

                {supplier.status === 'approved' ? (
                  <div className="pt-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Contact Admin</h4>
                    <div className="space-y-3">
                      <button
                        onClick={handleQuickMsg}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l.8-4A7.97 7.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Quick Message</span>
                      </button>
                      <button
                        onClick={handleWhatsApp}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        <span>WhatsApp Admin</span>
                      </button>

                      <button
                        onClick={handleEmail}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Email Admin</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4">
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                      <p className="text-sm font-medium">
                        Your profile will be visible after admin approval.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SupplierProfile;