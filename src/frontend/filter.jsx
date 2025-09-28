import React, { useState, useEffect, useRef } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css"; // required styles

export default function FilterBar() {
  const [filters, setFilters] = useState({
    category: "",
    price: [0, 200000],
    sort: "",
    discount: "",
  });

  const [showPrice, setShowPrice] = useState(false);
  const priceRef = useRef(null);

  // Close price range when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (priceRef.current && !priceRef.current.contains(event.target)) {
        setShowPrice(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setShowPrice(false); // auto-close if another filter is clicked
  };

  const handlePriceChange = (value) => {
    setFilters((prev) => ({ ...prev, price: value }));
  };

  return (
    <div className="w-full bg-gray-50 border-b py-4 px-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
      {/* Category */}
      <select
        name="category"
        value={filters.category}
        onChange={handleChange}
        className="flex-1 min-w-[150px] border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500"
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="fashion">Fashion</option>
        <option value="home">Home</option>
      </select>

      {/* Price Range - Click to Expand */}
      <div className="flex-1 min-w-[200px] relative" ref={priceRef}>
        <button
          onClick={() => setShowPrice(!showPrice)}
          className="w-full border rounded-lg px-3 py-2 text-sm text-left focus:ring-2 focus:ring-amber-500"
        >
          Price Range: ${filters.price[0].toLocaleString()} cad. – $
          {filters.price[1].toLocaleString()} cad.
        </button>

        {showPrice && (
          <div className="absolute z-20 mt-2 bg-white border rounded-lg p-4 w-64 shadow-lg">
            <Slider
              range
              min={0}
              max={200000}
              step={1000}
              value={filters.price}
              onChange={handlePriceChange}
              trackStyle={[{ backgroundColor: "#f59e0b" }]} // amber-500
              handleStyle={[
                { borderColor: "#f59e0b", backgroundColor: "#fff" },
                { borderColor: "#f59e0b", backgroundColor: "#fff" },
              ]}
            />
            <p className="text-xs text-gray-600 mt-2">
              ${filters.price[0].toLocaleString()} cad. – $
              {filters.price[1].toLocaleString()} cad.
            </p>
          </div>
        )}
      </div>

      {/* Sort By */}
      <select
        name="sort"
        value={filters.sort}
        onChange={handleChange}
        className="flex-1 min-w-[150px] border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500"
      >
        <option value="">Sort By</option>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="low-high">Price: Low to High</option>
        <option value="high-low">Price: High to Low</option>
      </select>

      {/* Discounts / Offers */}
      <select
        name="discount"
        value={filters.discount}
        onChange={handleChange}
        className="flex-1 min-w-[150px] border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500"
      >
        <option value="">All Products</option>
        <option value="sale">On Sale</option>
        <option value="clearance">Clearance</option>
      </select>
    </div>
  );
}
