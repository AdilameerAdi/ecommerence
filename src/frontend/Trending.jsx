import React, { useState, useEffect } from "react";
import { getProducts } from "../lib/supabase";

export default function SaleBanner() {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    setLoading(true);
    try {
      // Fetch only trending products
      const { products } = await getProducts(1, 10, { isTrending: true });
      const transformedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        code: product.code,
        reseller_name: product.reseller_name,
        images: product.product_images
          ?.sort((a, b) => a.display_order - b.display_order)
          .map(img => img.image_url) || [],
        is_trending: product.is_trending
      }));
      setTrendingProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching trending products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-slide functionality
  useEffect(() => {
    if (trendingProducts.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % trendingProducts.length);
      }, 4000); // Change slide every 4 seconds
      return () => clearInterval(interval);
    }
  }, [trendingProducts.length]);

  if (loading) {
    return (
      <section className="relative bg-black text-white rounded-xl lg:rounded-2xl shadow-lg overflow-hidden max-w-7xl mx-auto mt-4 sm:mt-6 lg:mt-8 sm:mx-4 lg:mx-auto">
        <div className="flex justify-center items-center h-24 sm:h-36 md:h-48">
          <div className="text-white text-sm sm:text-base">Loading trending products...</div>
        </div>
      </section>
    );
  }

  if (!trendingProducts || trendingProducts.length === 0) {
    return null; // Don't show banner if no trending products
  }

  const currentProduct = trendingProducts[currentSlide];

  return (
    <section className="relative bg-black text-white rounded-xl lg:rounded-2xl shadow-lg overflow-hidden max-w-7xl mx-auto mt-4 sm:mt-6 lg:mt-8 sm:mx-4 lg:mx-auto">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentProduct.images[0] || "https://via.placeholder.com/800x400?text=Trending+Product"}
          alt={currentProduct.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
      </div>

      {/* Slider Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10">
        {/* Left Side - Product Info */}
        <div className="flex-1 text-center lg:text-left mb-4 lg:mb-0">
          <div className="inline-flex items-center bg-red-500 text-white px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold mb-2 sm:mb-3">
            🔥 TRENDING NOW
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3 leading-tight">
            {currentProduct.name}
          </h2>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-300 mb-3 sm:mb-4">
            ${currentProduct.price}
          </div>
          <button
            onClick={() => {
              const productsSection = document.querySelector('[data-products-section]');
              if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-white text-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-200 transition text-sm sm:text-base"
          >
            View Product
          </button>
        </div>

        {/* Right Side - Product Image */}
        <div className="w-40 h-40 sm:w-52 sm:h-52 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-xl overflow-hidden border-4 border-white/20 bg-white/10 backdrop-blur-sm">
          <img
            src={currentProduct.images[0] || "https://via.placeholder.com/400x400?text=Product"}
            alt={currentProduct.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Slider Navigation */}
      {trendingProducts.length > 1 && (
        <>
          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {trendingProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Arrow Navigation */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + trendingProducts.length) % trendingProducts.length)}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full backdrop-blur-sm transition-all z-20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % trendingProducts.length)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full backdrop-blur-sm transition-all z-20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Product Counter */}
      <div className="absolute top-3 right-3 bg-black/40 text-white px-2.5 py-0.5 rounded-full text-xs sm:text-sm backdrop-blur-sm">
        {currentSlide + 1} / {trendingProducts.length}
      </div>
    </section>
  );
}
