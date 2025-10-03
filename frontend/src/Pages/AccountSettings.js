import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AccountSettings = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
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
    localStorage.removeItem('loginTime');
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'customer': 'Customer',
      'shop_owner': 'Shop Owner',
      'supplier_admin': 'Supplier Admin',
      'inventory_manager': 'Inventory Manager',
      'delivery_admin': 'Delivery Admin',
      'admin': 'Administrator'
    };
    return roleNames[role] || role;
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  // Handle special cases for different roles
                  if (user.role === 'inventory_manager') {
                    navigate('/dashboard/inventory');
                  } else if (user.role === 'delivery_admin') {
                    navigate('/drivers/management'); // Redirect delivery admin to driver management
                  } else if (user.role === 'customer') {
                    navigate('/products'); // Redirect customers to products page
                  } else {
                    navigate(`/dashboard/${user.role}`);
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Back to Dashboard
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
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`${
                    activeTab === 'profile'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  Profile Management
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`${
                    activeTab === 'security'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  Security Settings
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`${
                    activeTab === 'account'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  Account Actions
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">View Profile</h4>
                      <p className="text-sm text-gray-600 mb-3">View and manage your personal information</p>
                      <button
                        onClick={() => navigate('/profile')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                      >
                        Go to Profile
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Update Information</h4>
                      <p className="text-sm text-gray-600 mb-3">Edit your name, email, phone, and address</p>
                      <button
                        onClick={() => navigate('/profile')}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
                      <p className="text-sm text-gray-600 mb-3">Update your account password for better security</p>
                      <button
                        onClick={() => navigate('/profile')}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-sm"
                      >
                        Change Password
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Login History</h4>
                      <p className="text-sm text-gray-600 mb-3">View your recent login activity</p>
                      <button
                        disabled
                        className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Name:</span>
                          <span className="ml-2 text-gray-600">{user.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Email:</span>
                          <span className="ml-2 text-gray-600">{user.email}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Role:</span>
                          <span className="ml-2 text-gray-600">{getRoleDisplayName(user.role)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Member Since:</span>
                          <span className="ml-2 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button
                        onClick={() => navigate('/profile')}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CRUD Operations Summary */}
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Available Account Operations
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Complete CRUD functionality for your account
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">CREATE</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ✅ Account creation through registration
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">READ</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ✅ View profile information and account details
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">UPDATE</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ✅ Edit profile information and change password
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">DELETE</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ✅ Delete your account permanently
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountSettings;

