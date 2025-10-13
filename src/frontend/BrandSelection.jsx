import React, { useState, useEffect } from 'react';
import { getBrandsByCategory } from '../lib/supabase';

export default function BrandSelection({ selectedCategory, onBrandSelect, onBackToCategories }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedCategory) {
      fetchBrands();
    }
  }, [selectedCategory]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getBrandsByCategory(selectedCategory.id);
      setBrands(result.data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = (brand) => {
    if (onBrandSelect) {
      onBrandSelect(brand, selectedCategory);
    }
  };

  if (loading) {
    return (
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
        <div className="flex items-center mb-6">
          <button
            onClick={onBackToCategories}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mr-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </button>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
          Brands in {selectedCategory?.name}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 animate-pulse">
              <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
        <div className="flex items-center mb-6">
          <button
            onClick={onBackToCategories}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mr-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </button>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
          Brands in {selectedCategory?.name}
        </h2>
        
        <div className="flex justify-center items-center h-48">
          <div className="text-red-600 text-center">
            <p className="text-lg font-semibold mb-2">Failed to load brands</p>
            <button 
              onClick={fetchBrands}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBackToCategories}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mr-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Categories
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
          Brands in {selectedCategory?.name}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Select a brand to view products
        </p>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
        {brands.map((brand) => (
          <div
            key={brand.id}
            onClick={() => handleBrandClick(brand)}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 sm:p-6 flex flex-col cursor-pointer group hover:scale-105"
          >
            {/* Brand Logo/Image */}
            <div className="w-full mb-4 rounded-lg overflow-hidden bg-gray-50 relative" style={{ height: '200px' }}>
              {brand.logo_url || brand.image_url ? (
                <img
                  src={brand.logo_url || brand.image_url}
                  alt={brand.name}
                  className="w-full h-full object-cover"
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200" style={{ height: '200px' }}>
                  <div className="text-4xl sm:text-5xl text-gray-400 font-bold">
                    {brand.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            {/* Brand Info */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg sm:text-xl font-semibold text-black mb-2 line-clamp-2">
                {brand.name}
              </h3>
              
              {brand.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {brand.description}
                </p>
              )}
              
              <div className="mt-auto">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Products available
                  </span>
                  <span className="text-blue-600 font-medium">View →</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Brands State */}
      {brands.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🏷️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No brands available</h3>
          <p className="text-gray-500 text-center">
            No brands are currently available in the {selectedCategory?.name} category.
          </p>
        </div>
      )}
    </section>
  );
}
