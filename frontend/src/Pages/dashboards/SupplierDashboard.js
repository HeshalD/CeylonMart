import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../../components/ui/AdminDashboard';

const SupplierDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('SupplierDashboard: Token exists:', !!token);
    console.log('SupplierDashboard: User data exists:', !!userData);
    
    if (!token || !userData) {
      console.log('SupplierDashboard: Redirecting to login');
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    console.log('SupplierDashboard: User role:', parsedUser.role);
    setUser(parsedUser);
  }, [navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Supply Manager Dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('SupplierDashboard: Rendering AdminDashboard');
  return <AdminDashboard />;
};

export default SupplierDashboard;
