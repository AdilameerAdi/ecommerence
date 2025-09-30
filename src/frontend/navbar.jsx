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
      <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
        {/* Logo + Name */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none flex-shrink-0"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src={logoimg}
            alt="Reseller Market Logo"
            className="h-12 w-24 sm:h-16 sm:w-32 md:h-20 md:w-40 lg:h-[80px] lg:w-[200px] object-contain"
          />
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg ml-4">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 bg-white text-black py-2 pl-8 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
          <button
            type="submit"
            className="absolute left-2 sm:left-3 top-2 sm:top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 hover:text-black transition-colors"
          >
            <Search className="h-full w-full" />
          </button>
        </form>
      </div>
    </header>
  );
}
