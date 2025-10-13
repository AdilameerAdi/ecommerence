import React, { useState, useEffect } from 'react';
import { getCategoriesWithBrandCounts } from '../lib/supabase';

export default function CategoryCards({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCategoriesWithBrandCounts();
      setCategories(result.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  if (loading) {
    return (
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">Browse Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-2 sm:p-3 flex flex-col"
              style={{ height: '280px' }}
            >
              <div 
                className="w-full bg-gray-200 rounded-lg mb-2"
                style={{ height: '238px' }}
              ></div>
              <div 
                className="flex flex-col justify-between"
                style={{ height: '42px' }}
              >
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">Browse Categories</h2>
        <div className="flex justify-center items-center h-48">
          <div className="text-red-600 text-center">
            <p className="text-lg font-semibold mb-2">Failed to load categories</p>
            <button 
              onClick={fetchCategories}
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
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">Browse Categories</h2>
        <p className="text-gray-600 text-sm sm:text-base">Select a category to explore brands and products</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 p-2 sm:p-3 flex flex-col cursor-pointer"
            style={{ height: '280px' }}
          >
            {/* Category Image - Fixed height for consistency */}
            <div 
              className="w-full rounded-lg overflow-hidden bg-gray-50 mb-2"
              style={{ height: '238px' }}
            >
              {category.image_url ? (
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block'
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
                  style={{ height: '238px' }}
                >
                  <div className="text-3xl sm:text-4xl text-gray-400">
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            {/* Category Info - Fixed height for consistency */}
            <div 
              className="flex flex-col justify-between"
              style={{ height: '42px' }}
            >
              <h3 className="text-sm sm:text-base font-semibold text-black line-clamp-1 mb-1">
                {category.name}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {category.brand_count || 0} brands
                </span>
                <span className="text-blue-600 font-medium text-xs">Explore →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No categories available</h3>
          <p className="text-gray-500 text-center">
            Categories will appear here once they are added to the system.
          </p>
        </div>
      )}
    </section>
  );
}
