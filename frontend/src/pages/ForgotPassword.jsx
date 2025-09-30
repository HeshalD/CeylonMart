import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import Header from '../Header';
import Footer from '../Footer';
import './Login.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Send password reset request
      await authAPI.forgotPassword(email);
      
      setSuccess('Password reset code sent to your email. Please check your inbox.');
      setStep('reset');
    } catch (err) {
      console.error('Forgot password error:', err);
      let errorMessage = 'Failed to send password reset code. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = 'No account found with this email address.';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the reset code');
      return;
    }
    
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Reset password
      await authAPI.resetPassword({ email, otp, newPassword });
      
      setSuccess('Password reset successfully! Please login with your new password.');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid reset code. Please check the code and try again.';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col login-page">
      <Header />

      {/* Content */}
      <main className="main-content">
        <div className="container">
          <div className="auth-card">
            <h2 className="auth-title">Forgot Password</h2>
            <p className="auth-subtitle">Supplier Portal</p>

            {success && (
              <div className="alert alert-success">{success}</div>
            )}

            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            {step === 'request' ? (
              <form onSubmit={handleEmailSubmit}>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="Enter your registered email"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Sending Reset Code...' : 'Send Reset Code'}
                </button>

                <div style={{ marginTop: 12 }} className="helper-text">
                  Remember your password?{' '}
                  <button type="button" onClick={() => navigate('/login')} className="link-btn">Back to Login</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit}>
                <div className="form-group">
                  <label htmlFor="otp" className="form-label">Reset Code</label>
                  <input
                    id="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="form-input"
                    placeholder="Enter reset code sent to your email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="Confirm new password"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>

                <div style={{ marginTop: 12 }} className="helper-text">
                  <button type="button" onClick={() => setStep('request')} className="link-btn">Resend Reset Code</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;