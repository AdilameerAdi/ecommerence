import React, { useState, useEffect, useRef } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css"; // required styles
import { getCategoriesWithBrandCounts, getBrandsByCategory } from "../lib/supabase";
import SmartImage from "../components/SmartImage";

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
  const [showCategories, setShowCategories] = useState(false);
  const categoriesRef = useRef(null);

  const [showPrice, setShowPrice] = useState(false);
  const priceRef = useRef(null);

  // Fetch categories and brands on component mount
  useEffect(() => {
    fetchCategories();
    fetchBrands(); // Fetch all brands initially
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
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setShowCategories(false);
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
      const result = await getCategoriesWithBrandCounts();
      setCategories(result.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchBrands = async (categoryId = null) => {
    try {
      setLoadingBrands(true);
      const result = await getBrandsByCategory(categoryId);
      setBrands(result.data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    setShowPrice(false); // auto-close if another filter is clicked
    setShowBrands(false);
    setShowCategories(false);

    // If category changed, fetch brands for that category and clear selected brands
    if (e.target.name === 'category') {
      const categoryId = e.target.value ? parseInt(e.target.value) : null;
      fetchBrands(categoryId);
      newFilters.brands = []; // Clear selected brands when category changes
      setFilters(newFilters);
    }

    // Notify parent component of filter changes
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleCategorySelect = (categoryId) => {
    const newFilters = { ...filters, category: categoryId.toString(), brands: [] };
    setFilters(newFilters);
    setShowCategories(false);

    // Fetch brands for the selected category
    fetchBrands(categoryId || null);

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
    <div className="w-full max-w-7xl mx-auto bg-white border-b py-4 sm:py-5 px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Categories - Dropdown */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Categories</label>
          <div ref={categoriesRef}>
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-left focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all hover:bg-amber-50 hover:border-amber-400 flex items-center justify-between"
            >
              <span className="flex items-center">
                {filters.category === '' ? (
                  <>
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-white">All</span>
                    </div>
                    All Categories
                  </>
                ) : (
                  <>
                    {(() => {
                      const selectedCategory = categories.find(cat => cat.id.toString() === filters.category);
                      return selectedCategory ? (
                        <>
                          <SmartImage
                            src={selectedCategory.image_url}
                            alt={selectedCategory.name}
                            className="w-5 h-5 rounded-full object-cover mr-2"
                            fallbackContent={
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mr-2">
                                <span className="text-xs font-bold text-white">
                                  {selectedCategory.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            }
                          />
                          {selectedCategory.name}
                        </>
                      ) : 'All Categories';
                    })()}
                  </>
                )}
              </span>
              <svg className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showCategories && (
              <div className="absolute z-20 mt-2 bg-white border rounded-lg p-3 w-full sm:w-64 shadow-xl left-0 sm:left-auto max-h-60 overflow-y-auto">
                {loadingCategories ? (
                  <p className="text-sm text-gray-500 animate-pulse">Loading categories...</p>
                ) : (
                  <div className="space-y-1">
                    <button
                      onClick={() => handleCategorySelect('')}
                      className={`w-full flex items-center p-2 rounded-lg transition-all text-left ${
                        filters.category === ''
                          ? 'bg-amber-50 border border-amber-200'
                          : 'hover:bg-amber-50 border border-transparent hover:border-amber-200'
                      }`}
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
                        <span className="text-xs font-bold text-white">All</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">All Categories</span>
                    </button>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`w-full flex items-center p-2 rounded-lg transition-all text-left ${
                          filters.category === category.id.toString()
                            ? 'bg-amber-50 border border-amber-200'
                            : 'hover:bg-amber-50 border border-transparent hover:border-amber-200'
                        }`}
                      >
                        <SmartImage
                          src={category.image_url}
                          alt={category.name}
                          className="w-6 h-6 rounded-full object-cover mr-3 shadow-sm"
                          fallbackContent={
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mr-3 shadow-sm">
                              <span className="text-xs font-bold text-white">
                                {category.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          {category.brand_count > 0 && (
                            <div className="text-xs text-amber-600">{category.brand_count} brands</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Price Range - Click to Expand */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Price Range</label>
          <div ref={priceRef}>
            <button
              onClick={() => setShowPrice(!showPrice)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-left focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all hover:bg-amber-50 hover:border-amber-400"
            >
              ${filters.price[0].toLocaleString()} – ${filters.price[1].toLocaleString()}
              <svg className={`w-4 h-4 float-right mt-0.5 transition-transform ${showPrice ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showPrice && (
              <div className="absolute z-20 mt-2 bg-white border rounded-lg p-4 w-full sm:w-64 shadow-xl left-0 sm:left-auto">
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
                  ${filters.price[0].toLocaleString()} CAD – ${filters.price[1].toLocaleString()} CAD
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">Sort By</label>
          <select
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all hover:bg-amber-50 hover:border-amber-400"
          >
            <option value="">Default Order</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>

        {/* Trending Products */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">Product Type</label>
          <select
            name="trending"
            value={filters.trending}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all hover:bg-amber-50 hover:border-amber-400"
          >
            <option value="">All Products</option>
            <option value="trending">🔥 Trending Only</option>
            <option value="regular">Regular Products</option>
          </select>
        </div>

        {/* Brands - Multiple Selection */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Brands</label>
          <div ref={brandsRef}>
            <button
              onClick={() => setShowBrands(!showBrands)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-left focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all hover:bg-amber-50 hover:border-amber-400 flex items-center justify-between"
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
              <div className="absolute z-20 mt-2 bg-white border rounded-lg p-3 w-full sm:w-64 shadow-xl left-0 sm:left-auto max-h-60 overflow-y-auto">
                {loadingBrands ? (
                  <p className="text-sm text-gray-500 animate-pulse">Loading brands...</p>
                ) : brands.length === 0 ? (
                  <p className="text-sm text-gray-500">No brands available for this category</p>
                ) : (
                  <div className="space-y-1">
                    {brands.map(brand => (
                      <label key={brand.id} className="flex items-center cursor-pointer hover:bg-amber-50 p-2 rounded-lg border border-transparent hover:border-amber-200 transition-all">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand.id)}
                          onChange={() => handleBrandToggle(brand.id)}
                          className="mr-3 text-amber-500 focus:ring-amber-500 rounded"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <SmartImage
                            src={brand.image_url}
                            alt={brand.name}
                            className="w-6 h-6 rounded-full object-cover shadow-sm"
                            fallbackContent={
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-sm">
                                <span className="text-xs font-bold text-white">
                                  {brand.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                            {brand.category_name && (
                              <div className="text-xs text-amber-600">{brand.category_name}</div>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-center pt-2 border-t border-gray-200">
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              ✕ Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
