import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supplierAPI } from '../api';
import Header from '../Header';
import Footer from '../Footer';

const OtpVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      setLoading(true);
      const supplierId = localStorage.getItem('supplierId');
      const email = localStorage.getItem('supplierEmail');
      if (!email) {
        throw new Error('Missing email. Please register again.');
      }
      await supplierAPI.verifyOtp({ supplierId, email, otp });
      setSuccess('OTP verified. Your account is pending admin approval.');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Verify OTP</h1>
          {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-200">{error}</div>}
          {success && <div className="mb-4 p-3 rounded bg-green-100 text-green-700 border border-green-200">{success}</div>}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-md transition disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OtpVerification;
