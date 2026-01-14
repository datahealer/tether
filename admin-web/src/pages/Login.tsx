import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '../context/auth';
import { LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate({ to: '/admin/dashboard' as any });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
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
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1F2935] mb-2">Welcome Back</h1>
          <p className="text-[#626262]">Sign in to your admin account</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-800 px-4 py-3 rounded-xl mb-6">
            {error}
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
          <div>
            <label className="block text-[#626262] text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-[#D0C5BC] rounded-xl px-4 py-3 text-[#1F2935] placeholder-[#828282] focus:outline-none focus:ring-2 focus:ring-[#FF7E3D]"
              placeholder="••••••••"
              required
            />
            <div className="text-right">
                <Link to="/admin/forgot-password" className="text-[#FF7E3D] mt-6 cursor-pointer text-right font-semibold hover:text-[#828282] transition-colors">
                   Forgot password?
                </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF7E3D] text-white py-3 cursor-pointer rounded-xl font-medium hover:from-[#626262]-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-[#FF7E3D]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[#626262] mt-6">
          Don't have an account?{' '}
          <Link 
  to="/admin/signup" 
  className="text-[#FF7E3D] font-semibold hover:text-[#828282] transition-colors"
>
  Sign up
</Link>
        </p>
      </div>
    </div>
  );
};