import React, { useState } from 'react';
import { otpAPI } from '../api';
import Header from '../Header';
import Footer from '../Footer';

const Register = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const sendOtp = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      if (!form.email) return setError('Email is required');
      await otpAPI.sendOtp({ email: form.email });
      setSuccess('OTP sent to your email. Check your inbox.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be 6 digits');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const payload = { ...form, otp };
      await otpAPI.verifyOtp(payload);
      setSuccess('Registration successful! You can now log in.');
      setStep(1);
      setForm({ name: '', email: '', phone: '', password: '' });
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Supplier Registration</h2>

        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">{success}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{error}</div>}

        {step === 1 && (
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm text-gray-700">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="0712345678" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="••••••••" />
            </div>
            <button type="button" onClick={sendOtp} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">{loading ? 'Sending...' : 'Send OTP'}</button>
          </form>
        )}

        {step === 2 && (
          <form className="space-y-4" onSubmit={verifyOtp}>
            <div>
              <label className="block text-sm text-gray-700">Enter OTP</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} className="mt-1 w-full border rounded px-3 py-2 tracking-widest text-center text-xl" placeholder="000000" />
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50">{loading ? 'Verifying...' : 'Verify & Register'}</button>
            <button type="button" onClick={() => setStep(1)} className="w-full bg-gray-200 text-gray-800 py-2 rounded">Back</button>
          </form>
        )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;


