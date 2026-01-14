
import { Link } from '@tanstack/react-router';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4E2] to-[#FF9E6D] flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        {/* Logo/Title */}
        <h1 className="text-6xl font-bold text-[#1F2935] mb-6">
          Tether
        </h1>
        
        {/* Subtitle */}
        <p className="text-2xl text-[#1F2935]/80 mb-12">
          Connect, Share, and Grow Together
        </p>

        {/* Description */}
        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 mb-12">
          <p className="text-lg text-[#1F2935] leading-relaxed">
            Welcome to Tether - where relationships flourish through meaningful connections 
            and shared experiences. Build stronger bonds with those who matter most.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-6 justify-center flex-wrap">
          <Link
            to="/admin/login"
            className="bg-[#FF7E3D] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#FF6B35] transition-colors shadow-lg hover:shadow-xl"
          >
            Admin Login
          </Link>
          
          <button className="bg-white text-[#FF7E3D] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-colors shadow-lg hover:shadow-xl">
            Learn More
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-[#1F2935]/60">
          <p>© 2026 Tether. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
