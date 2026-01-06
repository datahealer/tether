import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '../context/auth';
import { UserPlus } from 'lucide-react';

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signup({ name, email, password });
      navigate({ to: '/' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4E2] to-[#FF9E6D]
 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF7E3D] rounded-2xl mb-4">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1F2935] mb-2">Create Account</h1>
          <p className="text-[#626262]">Join the admin dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#626262] text-sm mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/10 border border-[#D0C5BC] rounded-xl px-4 py-3 text-[#1F2935] placeholder-[#828282] focus:outline-none focus:ring-2 focus:ring-[#FF7E3D]"
              placeholder="John Doe"
              required
            />
          </div>

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

          <div>
            <label className="block text-[#626262] text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-[#D0C5BC] rounded-xl px-4 py-3 text-[#1F2935] placeholder-[#828282] focus:outline-none focus:ring-2 focus:ring-[#FF7E3D]"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-[#626262] text-sm mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/10 border border-[#D0C5BC] rounded-xl px-4 py-3 text-[#1F2935] placeholder-[#828282] focus:outline-none focus:ring-2 focus:ring-[#FF7E3D]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF7E3D] text-white py-3 rounded-xl font-medium hover:from-[#626262]-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-[#626262]-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-[#626262] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#FF7E3D] font-semibold ">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
