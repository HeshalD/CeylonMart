import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';

const SupplierDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
  }, [navigate]);


  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 flex flex-col">
      <Header />
      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to CeylonMart</h1>
            <p className="text-lg text-gray-600">Your supplier dashboard for managing products and orders</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SupplierDashboard;
