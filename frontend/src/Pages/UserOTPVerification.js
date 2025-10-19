import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

const UserOTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state or localStorage
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem('pendingUserEmail');
    
    if (emailFromState) {
      setEmail(emailFromState);
      localStorage.setItem('pendingUserEmail', emailFromState);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      // If no email found, redirect to register
      navigate('/register');
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, location.state]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
      setError('');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/user-otp/verify', {
        email,
        otp
      });

      setSuccess(response.data.message);
      
      // Get pending registration data
      const pendingData = localStorage.getItem('pendingRegistration');
      
      if (pendingData) {
        // Complete registration automatically
        try {
          const registrationData = JSON.parse(pendingData);
          const registrationResponse = await axios.post('http://localhost:5000/api/users/register', registrationData);
          
          // Clear pending data
          localStorage.removeItem('pendingUserEmail');
          localStorage.removeItem('pendingRegistration');
          
          // Show success and redirect to login
          setTimeout(() => {
            alert('Registration successful! Please login to continue.');
            navigate('/login');
          }, 2000);
          
        } catch (regError) {
          console.error('Registration completion error:', regError);
          setError('Email verified but registration failed. Please try registering again.');
        }
      } else {
        // Clear pending email from localStorage
        localStorage.removeItem('pendingUserEmail');
        
        // Redirect to complete registration
        setTimeout(() => {
          navigate('/register', { 
            state: { 
              email, 
              otpVerified: true,
              message: 'Email verified successfully! Please complete your registration.' 
            } 
          });
        }, 2000);
      }

    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/user-otp/resend', {
        email
      });

      setSuccess(response.data.message);
      setTimeLeft(600); // Reset timer to 10 minutes
      setCanResend(false);
      setOtp(''); // Clear current OTP input

    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 flex flex-col">
      <Header />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Main Form Container */}
          <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">
                Verify Your Email
              </h2>
              <p className="mt-2 text-emerald-100">
                We've sent a verification code to your email
              </p>
            </div>

            {/* Form Section */}
            <div className="px-8 py-8">
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                {/* Email Display */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Verification code sent to:</p>
                  <p className="text-lg font-semibold text-gray-900">{email}</p>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {success}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* OTP Input */}
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={handleOtpChange}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-center text-2xl font-mono tracking-widest"
                      maxLength="6"
                      autoComplete="off"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                {/* Timer */}
                <div className="text-center">
                  {timeLeft > 0 ? (
                    <p className="text-sm text-gray-600">
                      Code expires in: <span className="font-semibold text-emerald-600">{formatTime(timeLeft)}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 font-semibold">
                      Code expired. Please request a new one.
                    </p>
                  )}
                </div>

                {/* Verify Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6 || timeLeft <= 0}
                    className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Verify Email
                      </>
                    )}
                  </button>
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading || !canResend}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Resend Code'}
                  </button>
                </div>

                {/* Back to Register */}
                <div className="text-center pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Wrong email?{" "}
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                    >
                      Go back to registration
                    </button>
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

export default UserOTPVerification;
