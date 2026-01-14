import React, { useState } from "react";
import { useAuth } from "../../context/auth";
import { useNavigate,Link } from "@tanstack/react-router";
import { LogOut, ChevronDown,User } from "lucide-react";
import LogoIcon from "../../assets/logo.png";
import LogoIcon2 from "../../assets/logo-2.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate({ to: "/admin/login" as any });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4E2] to-[#FF9E6D]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#FFF4E2] border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center">
              {/* <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-[#1F2935]"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button> */}

              <img src={LogoIcon} alt="Tether Logo" className="w-auto" />
               <img src={LogoIcon2} alt="Tether Logo" className="object-contain  h-8 w-auto" />
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#FF7E3D] flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0)}
                </div>

                {/* Name */}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-[#1F2935]">
                    {user?.name}
                  </p>
                  <p className="text-xs text-[#626262]">{user?.email}</p>
                </div>

                {/* Dropdown Icon */}
                <ChevronDown
                  size={18}
                  className={`text-[#626262] transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 w-48 bg-white rounded-lg shadow-lg border border-black/5 z-50">
                  <ul className="py-2 text-sm text-[#1F2935] ">
                    <li>
    <Link
      to="/admin/profile"
      className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100"
    >
      <User size={16} />
      Profile
    </Link>
  </li>
                    
                    <li
                      onClick={handleLogout}
                      className="px-4 py-2 text-red-600 cursor-pointer flex items-center gap-2 hover:bg-red-100"
                    >
                      <LogOut size={16} />
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
};