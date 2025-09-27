import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supplierAPI } from '../api';
import Header from '../Header';
import Footer from '../Footer';

const AdminSupplierProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await supplierAPI.getSupplierById(id);
        setSupplier(res.data);
      } catch (err) {
        setError('Failed to load supplier');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error || 'Not found'}</div>
          <button onClick={() => navigate('/admin')} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">Back</button>
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
          {/* Profile Header (match supplier profile style) */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">{supplier.companyName}</h2>
                <p className="text-blue-100 text-lg">{supplier.contactName}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    supplier.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : supplier.status === 'pending' || supplier.status === 'pending approval'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {supplier.status?.charAt(0).toUpperCase() + supplier.status?.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Contact Information</h3>
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

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Products</p>
                      <p className="font-medium text-gray-900">
                        {Array.isArray(supplier.products)
                          ? supplier.products.join(', ')
                          : (Array.isArray(supplier.product) ? supplier.product.join(', ') : (supplier.product || 'N/A'))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Categories</h3>
                {supplier.categories && supplier.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(supplier.categories) ? supplier.categories : [supplier.categories]).map((category, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{category}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No categories specified</p>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/${supplier.phone}?text=Admin%20needs%20to%20discuss%20with%20you`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    WhatsApp Supplier
                  </a>
                  <a
                    href={`mailto:${supplier.email}?subject=Stock%20Discussion&body=Please%20respond%20to%20this%20request`}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    Email Supplier
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminSupplierProfile;