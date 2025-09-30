import React, { useState, useEffect, useRef } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css"; // required styles
import { getCategories, getBrands } from "../lib/supabase";

export default function FilterBar({ onFiltersChange }) {
  const [filters, setFilters] = useState({
    category: "",
    price: [0, 200000],
    sort: "",
    trending: "",
    brands: [],
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [showBrands, setShowBrands] = useState(false);
  const brandsRef = useRef(null);

  const [showPrice, setShowPrice] = useState(false);
  const priceRef = useRef(null);

  // Fetch categories and brands on component mount
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (priceRef.current && !priceRef.current.contains(event.target)) {
        setShowPrice(false);
      }
      if (brandsRef.current && !brandsRef.current.contains(event.target)) {
        setShowBrands(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    setShowPrice(false); // auto-close if another filter is clicked
    setShowBrands(false);

    // Notify parent component of filter changes
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleBrandToggle = (brandId) => {
    const newBrands = filters.brands.includes(brandId)
      ? filters.brands.filter(id => id !== brandId)
      : [...filters.brands, brandId];

    const newFilters = { ...filters, brands: newBrands };
    setFilters(newFilters);

    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handlePriceChange = (value) => {
    const newFilters = { ...filters, price: value };
    setFilters(newFilters);

    // Notify parent component of filter changes
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const resetFilters = () => {
    const resetFilters = {
      category: "",
      price: [0, 200000],
      sort: "",
      trending: "",
      brands: [],
    };
    setFilters(resetFilters);
    if (onFiltersChange) {
      onFiltersChange(resetFilters);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = filters.category || filters.sort || filters.trending || filters.brands.length > 0 ||
    (filters.price && (filters.price[0] > 0 || filters.price[1] < 200000));

  return (
    <div className="w-full max-w-7xl mx-auto bg-gray-50 border-b py-3 sm:py-4 px-3 sm:px-4 lg:px-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {/* Category */}
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          disabled={loadingCategories}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all disabled:opacity-50"
        >
          <option value="">All Categories</option>
          {loadingCategories ? (
            <option disabled>Loading categories...</option>
          ) : (
            categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))
          )}
        </select>

        {/* Price Range - Click to Expand */}
        <div className="relative" ref={priceRef}>
          <button
            onClick={() => setShowPrice(!showPrice)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-left focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all hover:bg-gray-50"
          >
            <span className="hidden sm:inline">Price Range: </span>
            <span className="sm:hidden">Price: </span>
            ${filters.price[0].toLocaleString()} – ${filters.price[1].toLocaleString()}
          </button>

          {showPrice && (
            <div className="absolute z-20 mt-2 bg-white border rounded-lg p-4 w-full sm:w-64 shadow-lg left-0 sm:left-auto">
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all"
        >
          <option value="">Sort By</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
        </select>

        {/* Trending Products */}
        <select
          name="trending"
          value={filters.trending}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all"
        >
          <option value="">All Products</option>
          <option value="trending">🔥 Trending Only</option>
          <option value="regular">Regular Products</option>
        </select>

        {/* Brands - Multiple Selection */}
        <div className="relative" ref={brandsRef}>
          <button
            onClick={() => setShowBrands(!showBrands)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-left focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all hover:bg-gray-50 flex items-center justify-between"
          >
            <span>
              {filters.brands.length === 0
                ? "All Brands"
                : `${filters.brands.length} Brand${filters.brands.length > 1 ? 's' : ''} Selected`}
            </span>
            <svg className={`w-4 h-4 transition-transform ${showBrands ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showBrands && (
            <div className="absolute z-20 mt-2 bg-white border rounded-lg p-3 w-full sm:w-64 shadow-lg left-0 sm:left-auto max-h-60 overflow-y-auto">
              {loadingBrands ? (
                <p className="text-sm text-gray-500">Loading brands...</p>
              ) : brands.length === 0 ? (
                <p className="text-sm text-gray-500">No brands available</p>
              ) : (
                <div className="space-y-2">
                  {brands.map(brand => (
                    <label key={brand.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand.id)}
                        onChange={() => handleBrandToggle(brand.id)}
                        className="mr-2 text-amber-500 focus:ring-amber-500 rounded"
                      />
                      <span className="text-sm">{brand.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-center">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
