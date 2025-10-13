import React, { useState, useEffect } from "react";
import { getProducts } from "../lib/supabase";

export default function SaleBanner() {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Modal state for product details
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");

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
        retail_price: product.retail_price ? parseFloat(product.retail_price) : null,
        price: parseFloat(product.price),
        ending_price: product.ending_price ? parseFloat(product.ending_price) : null,
        code: product.code,
        description: product.description,
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

  // Modal functions
  const openModal = (product) => {
    setSelectedProduct(product);
    setMainImage(product.images[0]);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setMainImage("");
  };

  // Helper function to check if any price is missing
  const hasMissingPrice = (product) => {
    return !product.retail_price || !product.price || !product.ending_price;
  };

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
          <div className="mb-3 sm:mb-4">
            {hasMissingPrice(currentProduct) ? (
              <p className="text-blue-300 text-lg sm:text-xl font-medium">
                📞 DM to know about the price
              </p>
            ) : (
              <>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-300">
                  ${currentProduct.price}{currentProduct.ending_price && (
                    <> to ${currentProduct.ending_price}</>
                  )}
                </div>
                {currentProduct.retail_price && (
                  <div className="text-lg sm:text-base text-red-500 mt-1">
                    Retail: <span className="">${currentProduct.retail_price}</span>
                  </div>
                )}
              </>
            )}
          </div>
          <button
            onClick={() => openModal(currentProduct)}
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

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex justify-center items-center z-50 p-3 sm:p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-4 sm:p-6 relative flex flex-col lg:flex-row">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-black text-xl font-bold z-10 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            {/* Left - Images */}
            <div className="lg:w-1/2 flex flex-col items-center mb-6 lg:mb-0">
              <div className="w-full max-w-sm aspect-square rounded-lg border border-gray-200 mb-4 overflow-hidden bg-gray-50 relative">
                <img
                  src={mainImage || 'https://via.placeholder.com/400x400?text=No+Image'}
                  alt="Main"
                  className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover"
                  style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                />
              </div>
              <div className="flex space-x-2 overflow-x-auto w-full justify-center pb-2">
                {selectedProduct.images.slice(0, 4).map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border cursor-pointer flex-shrink-0 transition-all overflow-hidden bg-gray-50 ${
                      mainImage === img ? "border-2 border-black shadow-lg" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`thumb-${index}`}
                      className="w-full h-full object-cover"
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Details */}
            <div className="lg:w-1/2 lg:ml-6 flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-2 pr-8">
                {selectedProduct.name}
              </h2>
              {hasMissingPrice(selectedProduct) ? (
                <p className="text-blue-600 text-lg sm:text-xl mb-3 font-medium">
                  📞 DM to know about the price
                </p>
              ) : (
                <div className="mb-3">
                  <p className="text-lg sm:text-xl font-semibold text-green-600">
                    ${selectedProduct.price}{selectedProduct.ending_price && (
                      <> to ${selectedProduct.ending_price}</>
                    )}
                  </p>
                  {selectedProduct.retail_price && (
                    <p className="text-sm text-gray-600 mt-1">
                      Retail: <span className="line-through">${selectedProduct.retail_price}</span>
                    </p>
                  )}
                </div>
              )}
              <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed">
                {selectedProduct.description}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Product Code: <span className="font-mono">{selectedProduct.code}</span>
              </p>
              <p className="text-xs sm:text-sm text-blue-600 mb-4">
                Shipping: <span className="font-medium">{selectedProduct.reseller_name}</span>
              </p>

              {/* Simple instruction note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-xs sm:text-sm text-amber-800">
                  📸 <strong>How to buy:</strong> Take a screenshot of this product, then send via Instagram DM for pricing and availability.
                </p>
                <p className="text-xs sm:text-sm text-amber-800">
                  📸 <strong>Money back guarantee:</strong> ✅ 100% Money-Back Guarantee – Full refund if your product doesn't arrive or is damaged.
                </p>
              </div>

              <div className="mt-auto space-y-3">
                <button
                  id="share-product-btn"
                  onClick={() => {
                    try {
                      const productUrl = `${window.location.origin}/product/${selectedProduct.id}`;
                      
                      // Always copy to clipboard for instant sharing
                      navigator.clipboard.writeText(productUrl);
                      
                      // Show success feedback
                      const button = document.getElementById('share-product-btn');
                      if (button) {
                        const originalText = button.innerHTML;
                        button.innerHTML = '✓ Link Copied!';
                        button.classList.add('bg-green-600', 'hover:bg-green-700');
                        button.classList.remove('bg-blue-600', 'hover:bg-blue-700');

                        setTimeout(() => {
                          button.innerHTML = originalText;
                          button.classList.remove('bg-green-600', 'hover:bg-green-700');
                          button.classList.add('bg-blue-600', 'hover:bg-blue-700');
                        }, 2000);
                      }
                    } catch (error) {
                      console.error('Failed to copy link:', error);
                      // Fallback for older browsers
                      const productUrl = `${window.location.origin}/product/${selectedProduct.id}`;
                      const textArea = document.createElement('textarea');
                      textArea.value = productUrl;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      
                      // Show success feedback even for fallback
                      const button = document.getElementById('share-product-btn');
                      if (button) {
                        const originalText = button.innerHTML;
                        button.innerHTML = '✓ Link Copied!';
                        button.classList.add('bg-green-600', 'hover:bg-green-700');
                        button.classList.remove('bg-blue-600', 'hover:bg-blue-700');

                        setTimeout(() => {
                          button.innerHTML = originalText;
                          button.classList.remove('bg-green-600', 'hover:bg-green-700');
                          button.classList.add('bg-blue-600', 'hover:bg-blue-700');
                        }, 2000);
                      }
                    }
                  }}
                  className="w-full bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base font-medium flex items-center justify-center gap-2"
                  title="Share product link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Product Link
                </button>

                <button
                  onClick={() => {
                    const priceText = selectedProduct.ending_price ?
                      `$${selectedProduct.price} to $${selectedProduct.ending_price}` :
                      `$${selectedProduct.price}`;
                    const productInfo = `Hi! I'm interested in this product:\n\n📦 ${selectedProduct.name}\n💰 Price: ${priceText}\n🔢 Code: ${selectedProduct.code}\n👤 Reseller: ${selectedProduct.reseller_name}\n\nCan you please provide more details about availability and delivery?`;

                    // Copy product info to clipboard silently
                    navigator.clipboard.writeText(productInfo).catch(() => {
                      // Silently fail if clipboard doesn't work
                    });

                    // Direct Instagram link to open the person's chat/profile
                    const instagramUrl = 'https://www.instagram.com/reseller.market_?igsh=ZndjaXd3eWZpenl6&utm_source=qr';

                    // Try to open Instagram app first on mobile, then fallback to web
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                    if (isMobile) {
                      // Try Instagram app deep link first
                      const appUrl = 'instagram://user?username=reseller.market_';
                      window.location.href = appUrl;

                      // Fallback to web version after 1.5 seconds if app doesn't open
                      setTimeout(() => {
                        window.open(instagramUrl, '_blank');
                      }, 1500);
                    } else {
                      // Desktop: Open web version directly
                      window.open(instagramUrl, '_blank');
                    }
                  }}
                  className="w-full bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition text-sm sm:text-base font-medium"
                >
                  Send DM on Instagram
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
