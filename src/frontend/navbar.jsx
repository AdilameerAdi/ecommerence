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
