import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Mail } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 🔹 Replace this with your actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess('Password reset link has been sent to your email.');
      setEmail('');
    } catch (err: any) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4E2] to-[#FF9E6D] flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF7E3D] rounded-2xl mb-4">
            <Mail size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1F2935] mb-2">
            Forgot Password
          </h1>
          <p className="text-[#626262]">
            Enter your email to receive a reset link
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-700 px-4 py-3 rounded-xl mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#626262] text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-[#D0C5BC] rounded-xl px-4 py-3 text-[#1F2935] placeholder-[#828282] focus:outline-none focus:ring-2 focus:ring-[#FF7E3D]"
              placeholder="admin@tether.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF7E3D] text-white py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-[#FF7E3D]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-[#626262] mt-6">
          Remember your password?{' '}
          <Link
            to="/login"
            className="text-[#FF7E3D] font-semibold hover:text-[#828282] transition-colors"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};
