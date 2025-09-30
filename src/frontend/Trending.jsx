import React, { useState, useEffect } from "react";
import { getTrendingBanner } from "../lib/supabase";

export default function SaleBanner() {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const bannerData = await getTrendingBanner();
      setBanner(bannerData);
    } catch (error) {
      console.error('Error fetching banner:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative bg-black text-white rounded-xl lg:rounded-2xl shadow-lg overflow-hidden max-w-7xl mx-auto mt-4 sm:mt-6 lg:mt-8 mx-3 sm:mx-4 lg:mx-auto">
        <div className="flex justify-center items-center h-32 sm:h-48 md:h-64">
          <div className="text-white text-sm sm:text-base">Loading...</div>
        </div>
      </section>
    );
  }

  if (!banner) {
    return null; // Don't show banner if no data
  }

  return (
    <section className="relative bg-black text-white rounded-xl lg:rounded-2xl shadow-lg overflow-hidden max-w-7xl mx-auto mt-4 sm:mt-6 lg:mt-8 mx-3 sm:mx-4 lg:mx-auto">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={banner.banner_image_url || "https://www.shutterstock.com/image-photo/gold-fashionable-elegant-watch-classic-600nw-2477327319.jpg"}
          alt="Trending Sale"
          className="w-full h-full object-cover opacity-70"
        />
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
          {banner.title || '🔥 Trending Sale Products'}
        </h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 max-w-2xl leading-relaxed">
          {banner.subtitle || (
            <>Get up to <span className="font-bold text-yellow-300">{banner.discount_text || '50% OFF'}</span> on best sellers</>
          )}
        </p>
        <button className="bg-white text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-200 transition text-sm sm:text-base">
          {banner.button_text || 'Shop Now'}
        </button>
      </div>
    </section>
  );
}
