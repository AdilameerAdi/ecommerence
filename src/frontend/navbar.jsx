import React, { useState } from "react";
import { Search } from "lucide-react"; // if installed
import logoimg from "../img/logo.png"; // your logo

export default function Navbar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    // Real-time search (optional - you can remove this if you want search only on submit)
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white text-black shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-3 lg:px-4 py-1 sm:py-2 gap-2 sm:gap-3">
        {/* Logo + Name */}
        <div
          className="flex items-center gap-1 sm:gap-2 cursor-pointer select-none flex-shrink-0"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src={logoimg}
            alt="Reseller Market Logo"
            className="h-6 w-12 sm:h-10 sm:w-20 md:h-12 md:w-28 lg:h-14 lg:w-36 object-contain"
          />
        </div>
        {/* Instagram DM Button */}
 <button
          onClick={() => {
            const instagramUrl = 'https://www.instagram.com/reseller.market_?igsh=ZndjaXd3eWZpenl6&utm_source=qr';
            
            // Try to open Instagram app first on mobile, then fallback to web
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile) {
              // Try Instagram app deep link first
              const appUrl = 'instagram://user?username=reseller.market_';
              window.location.href = appUrl;
              
              // Fallback to web version after 1.5 seconds if app doesn't open
              setTimeout(() => {
                window.open(instagramUrl, '_blank');
              }, 1500);
            } else {
              // Desktop: Open web version directly
              window.open(instagramUrl, '_blank');
            }
          }}
          className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-sm hover:shadow-md text-xs sm:text-sm font-medium flex-shrink-0"
        >
          {/* Instagram Icon */}
          <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span className="hidden min-[480px]:inline">DM Here</span>
          <span className="min-[480px]:hidden">DM</span>
        </button>
        {/* Search Box */}
        <form
          onSubmit={handleSearch}
          className="relative flex-1 max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg"
        >
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 bg-white text-black py-1.5 sm:py-2 pl-6 sm:pl-10 pr-2 sm:pr-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-sm"
          />
          <button
            type="submit"
            className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
          >
            <Search className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </form>

        
       
      </div>
    </header>
  );
}
