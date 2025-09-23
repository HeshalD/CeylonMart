import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.name}!</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Profile
                </button>
                <button
                  onClick={() => navigate('/account-settings')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Account Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Name: {user.name}</p>
                  <p className="text-sm text-gray-600">Email: {user.email}</p>
                  <p className="text-sm text-gray-600">Phone: {user.phone || 'Not provided'}</p>
                  <p className="text-sm text-gray-600">Address: {user.address || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                <div className="mt-4 space-y-2">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Browse Products
                  </button>
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    View Orders
                  </button>
                  <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                    Track Delivery
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">No recent activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
