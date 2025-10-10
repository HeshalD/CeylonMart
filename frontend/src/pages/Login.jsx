import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../api';
import Header from '../Header';
import Footer from '../Footer';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check for success message from location state
    if (location.state?.message) {
      setSuccess(location.state.message);
    }

    // Check if user is already logged in
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const supplierStatus = localStorage.getItem('supplierStatus');
    
    // Do not auto-redirect to profile from supplier login page; allow re-login
    if (token && supplierStatus !== 'approved') {
      setError('Your account is pending admin approval.');
    }
  }, [navigate, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Send plaintext; backend normalizes to SHA-256 for comparison
      const passwordToSend = formData.password;

      const response = await authAPI.login({
        email: formData.email,
        password: passwordToSend,
      });
      const { token, role } = response.data;

      // Store token and role first
      // Unify with general login: set both 'token' and 'user'
      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role || 'supplier');
      try {
        // For general guard compatibility, ensure 'user' exists
        const roleForUser = role || 'supplier_admin';
        const existingUser = localStorage.getItem('user');
        if (!existingUser) {
          localStorage.setItem('user', JSON.stringify({ role: roleForUser }));
        }
      } catch (_) {}

      // Supplier flow: fetch fresh profile to get latest status/id
      const profileRes = await authAPI.getProfile();
      const profile = profileRes.data;
      localStorage.setItem('supplierId', profile._id);
      localStorage.setItem('supplierStatus', profile.status || 'pending');
      // Persist user for Header greeting
      try {
        const displayName = profile.contactName || profile.companyName || 'Supplier';
        // Keep role compatible with general guard expectations
        const userObj = { name: displayName, role: 'supplier_admin' };
        localStorage.setItem('user', JSON.stringify(userObj));
      } catch (_) {
        // ignore JSON/storage errors
      }

      if ((profile.status || '').toLowerCase() !== 'approved') {
        // Not approved: clean up and show message
        localStorage.removeItem('authToken');
        localStorage.removeItem('supplierId');
        localStorage.removeItem('supplierStatus');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        setError('Your account is pending admin approval. Please wait for approval before logging in.');
        return;
      }

      navigate('/supplierProfile');

    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 403) {
        errorMessage = 'Your account is pending admin approval.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Account not found. Please register first.';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('supplierId');
    localStorage.removeItem('supplierStatus');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Sign in to CeylonMart</h2>
              <p className="mt-2 text-emerald-100">Supplier Portal</p>
            </div>

            <div className="px-8 py-8">
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6">
                  {success}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 border-gray-300"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-12 py-3 border rounded-xl bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 border-gray-300"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9.88 4.64A10.47 10.47 0 0112 4.5c5.177 0 9.57 3.294 10.818 7.823a.75.75 0 010 .354 12.36 12.36 0 01-2.29 4.25M5.62 5.62A12.361 12.361 0 001.182 12.677a.75.75 0 000 .354A12.36 12.36 0 006.9 18.62" />
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10.584 10.587A3 3 0 0012 15a3 3 0 002.828-1.997" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                          <circle cx="12" cy="12" r="3" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <button type="button" onClick={() => navigate('/supplierForgotPassword')} className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Forgot your password?
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </div>

                <div className="text-center pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => navigate('/supplierRegister')} className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200">Register as Supplier</button>
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

export default Login;
