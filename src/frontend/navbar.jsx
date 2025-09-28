import React, { useState } from "react";
import { Search } from "lucide-react"; // if installed
import logoimg from "../img/logo.png"; // your logo

export default function Navbar() {
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-white text-black shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo + Name */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src={logoimg}
            alt="Reseller Market Logo"
            className="h-[80px] w-[200px] object-contain"
          />
         
        </div>

        {/* Search Box */}
        <div className="relative w-48 sm:w-64 md:w-80">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white text-black py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
        </div>
      </div>
    </header>
  );
}
