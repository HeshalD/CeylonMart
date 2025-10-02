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

      const isAdminLogin = (formData.email || '').trim().toLowerCase() === 'ann03@gmail.com';

      // For supplier accounts, hash password client-side (SHA-256). For admin demo, keep plaintext.
      let passwordToSend = formData.password;
      if (!isAdminLogin) {
        const encoder = new TextEncoder();
        const data = encoder.encode(formData.password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        passwordToSend = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      }

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

      // If admin, go straight to admin dashboard (no supplier profile fetch)
      if ((role || 'supplier') === 'admin') {
        navigate('/admin');
        return;
      }

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

      navigate('/profile');

    } catch (err) {
      console.error('Login error:', err);
      
      const isAdminLogin = (formData.email || '').trim().toLowerCase() === 'admin@test.com';
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = isAdminLogin ? 'Invalid admin credentials.' : 'Invalid email or password.';
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
    <div className="min-h-screen flex flex-col login-page">
      <Header />

      {/* Content */}
      <main className="main-content">
        <div className="container">
          <div className="auth-card">
            <h2 className="auth-title">Sign in to CeylonMart</h2>
            <p className="auth-subtitle">Supplier Portal</p>

            {success && (
              <div className="alert alert-success">{success}</div>
            )}

            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="password-field">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="toggle-password"
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

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <div style={{ marginTop: 12 }} className="helper-text">
                Don't have an account?{' '}
                <button type="button" onClick={() => navigate('/supplierRegister')} className="link-btn">Register as Supplier</button>
              </div>

              {/* Forgot Password Link */}
              <div style={{ marginTop: 12 }} className="helper-text">
                <button type="button" onClick={() => navigate('/forgot-password')} className="link-btn">Forgot Password?</button>
              </div>

              <div style={{ marginTop: 16, background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 6, padding: 12 }}>
                <h3 style={{ fontSize: 13, color: '#495057', marginBottom: 8 }}>Demo Credentials:</h3>
                <div style={{ fontSize: 12, color: '#6c757d' }}>
                  <p><strong>Supplier:</strong> supplier@test.com / password123</p>
                  <p><strong>Admin:</strong> ann03@gmail.com / lamann01</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
