import React, { useState, useEffect } from 'react';
import { User, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../context/auth';
import { Link } from '@tanstack/react-router';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 🔹 Sync user data (same source as DashboardLayout)
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = () => {
    // UI only (backend later)
    setPassword('');
    setConfirmPassword('');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPassword('');
    setConfirmPassword('');
    setIsEditing(false);

    // Reset values back to auth user
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4E2] to-[#FF9E6D] flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-8 max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF7E3D] rounded-2xl mb-4">
            <User size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1F2935] mb-2">
            My Profile
          </h1>
          <p className="text-[#626262]">
            Manage your account details
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-[#626262] text-sm mb-2">Name</label>
            <input
              type="text"
              value={name}
              disabled={!isEditing}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 text-[#1F2935] border ${
                isEditing
                  ? 'border-[#D0C5BC] focus:ring-2 focus:ring-[#FF7E3D]'
                  : 'bg-gray-100 border-gray-200'
              }`}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[#626262] text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              disabled={!isEditing}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 text-[#1F2935] border ${
                isEditing
                  ? 'border-[#D0C5BC] focus:ring-2 focus:ring-[#FF7E3D]'
                  : 'bg-gray-100 border-gray-200'
              }`}
            />
          </div>

          {/* Password fields (Edit only) */}
          {isEditing && (
            <>
              <div>
                <label className="block text-[#626262] text-sm mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 text-[#1F2935] border border-[#D0C5BC] focus:ring-2 focus:ring-[#FF7E3D]"
                />
              </div>

              <div>
                <label className="block text-[#626262] text-sm mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 text-[#1F2935] border border-[#D0C5BC] focus:ring-2 focus:ring-[#FF7E3D]"
                />
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-[#FF7E3D] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <Edit3 size={18} />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="w-full bg-[#FF7E3D] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Changes
              </button>

              <button
                onClick={handleCancel}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </>
          )}
        </div>
         <p className="text-center text-[#626262] mt-6">
 <Link
            to="/admin/dashboard"
            className="text-[#FF7E3D] font-semibold hover:text-[#828282] transition-colors"
          >
            Go to Dashboard
          </Link>
          </p>
      </div>
    </div>
  );
};
