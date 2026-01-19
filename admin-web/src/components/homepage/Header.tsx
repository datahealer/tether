import { Link } from "@tanstack/react-router";
import Logo from "../../assets/home/logo.png";
export default function Header() {
  return (
    <header className="relative z-50 bg-gradient-to-r from-[#FF9D6E] to-[#FFD7C2] p-4">
      {/* The colored header bar with gradient + blue border */}
      <div 
        className="
          mx-auto max-w-[1440px] 
          bg-white/50
          rounded-full 
          shadow-lg
          overflow-hidden
        "
      >
        <div className="px-8 py-4 flex items-center justify-between">
          {/* Logo + Heart */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={Logo} alt="Tether Logo" className="h-10 w-auto" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-10 text-white font-medium">
            <a 
              href="#" 
              className="hover:text-black/80 text-black transition-colors text-base font-normal"
            >
              Home
            </a>
            <a 
              href="#" 
              className="hover:text-black/80 text-black transition-colors text-base font-normal"
            >
              About
            </a>
            <a 
              href="#" 
              className="hover:text-black/80 text-black transition-colors text-base font-normal"
            >
              FAQs
            </a>
             <Link
            to="/admin/login"
            className="
              bg-[#FF7E3D] hover:bg-[#ff6b25] 
              text-white font-semibold 
              px-8 py-3 rounded-full 
              text-base font-normal shadow-md 
              transition-all duration-200
              border border-white/30
            "
          >
            Play for Free
          </Link>
          </nav>
         
        </div>
      </div>
    </header>
  );
}