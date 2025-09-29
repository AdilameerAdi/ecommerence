import React from "react";

export default function SaleBanner() {
  return (
    <section className="relative bg-black text-white rounded-2xl shadow-lg overflow-hidden max-w-6xl mx-auto mt-8">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://www.shutterstock.com/image-photo/gold-fashionable-elegant-watch-classic-600nw-2477327319.jpg" // replace with your banner image
          alt="Trending Sale"
          className="w-full h-full object-cover opacity-70"
        />
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          🔥 Trending Sale Products
        </h2>
        <p className="text-lg md:text-xl mb-6">
          Get up to <span className="font-bold text-yellow-300">50% OFF</span> on best sellers
        </p>
        <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
          Shop Now
        </button>
      </div>
    </section>
  );
}
