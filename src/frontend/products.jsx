import React, { useState, useEffect, useCallback } from "react";
import { getProducts } from "../lib/supabase";

export default function Products({ filters = {}, searchQuery = "" }) {
  // --- State for products from database ---
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to check if any price is missing
  const hasMissingPrice = (product) => {
    return !product.retail_price || !product.price || !product.ending_price;
  };

  // --- Pagination logic ---
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build filter object for API call
      const apiFilters = {
        search: searchQuery,
        categoryId: filters.category || null,
        brandIds: filters.brands && filters.brands.length > 0 ? filters.brands : null,
        isTrending: filters.trending === 'trending' ? true : filters.trending === 'regular' ? false : null,
        minPrice: filters.price ? filters.price[0] : null,
        maxPrice: filters.price ? filters.price[1] : null,
        sort: filters.sort || null
      };

      const { products, totalPages: pages, totalCount: count } = await getProducts(currentPage, itemsPerPage, apiFilters);

      // Transform the data to match our component structure
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
        category: product.categories?.name || 'Uncategorized',
        is_trending: product.is_trending
      }));

      setAllProducts(transformedProducts);
      setTotalPages(pages);
      setTotalCount(count);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, searchQuery]);

  // --- Fetch products from database ---
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- Modal state ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");

  const openModal = (product) => {
    setSelectedProduct(product);
    setMainImage(product.images[0]);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setMainImage("");
  };

  // --- Loading state ---
  if (loading && allProducts.length === 0) {
    return (
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">Our Products</h2>
        <div className="flex justify-center items-center h-48 sm:h-64">
          <div className="text-sm sm:text-lg text-gray-600">Loading products...</div>
        </div>
      </section>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">Our Products</h2>
        <div className="flex justify-center items-center h-48 sm:h-64">
          <div className="text-red-600 text-sm sm:text-base text-center px-4">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section data-products-section className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-2 sm:mb-0">Our Products</h2>
        <div className="text-sm text-gray-600">
          {loading ? (
            "Loading..."
          ) : (
            `Showing ${allProducts.length} of ${totalCount} products`
          )}
          {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </div>
      </div>

      {/* --- Cards Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
        {allProducts.map((item) => (
          <div
            key={item.id}
            onClick={() => openModal(item)}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-3 sm:p-4 flex flex-col cursor-pointer relative group hover:scale-105"
          >
            {/* Trending Badge */}
            {item.is_trending && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10 shadow-lg">
                🔥 TRENDING
              </div>
            )}
            <div className="w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gray-50 relative">
              <img
                src={item.images[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
                alt={item.name}
                className="absolute inset-0 min-w-full min-h-full w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
              />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-black mb-1 line-clamp-2">
              {item.name}
            </h3>
          <p className="text-black text-xs sm:text-sm mb-3">Shipping : {item.reseller_name}</p>

            <p className="text-black text-xs sm:text-[15px] mb-3">
              Code : {item.code}
              {item.retail_price && (
                <span className="ml-2 text-red-600">
                  | Retail: ${item.retail_price}
                </span>
              )}
            </p>
            {hasMissingPrice(item) ? (
              <p className="text-blue-600 text-sm sm:text-base mb-3 font-medium">
                📞 DM to know about the price
              </p>
            ) : (
              <p className="text-green-600 text-xl sm:text-base mb-3">
                ${item.price}{item.ending_price && (
                  <> to ${item.ending_price}</>
                )}
              </p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal(item);
              }}
              className="mt-auto bg-black text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800 transition text-xs sm:text-sm font-medium"
            >
              Show details
            </button>
          </div>
        ))}
      </div>

      {/* No Results State */}
      {!loading && allProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500 text-center">
            {searchQuery ? (
              <>No products match "<strong>{searchQuery}</strong>". Try adjusting your search or filters.</>
            ) : (
              "No products match your current filters. Try adjusting your selection."
            )}
          </p>
        </div>
      )}

      {/* --- Pagination --- */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 sm:mt-8 space-x-1 sm:space-x-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 transition-colors"
        >
          <span className="hidden sm:inline">Prev</span>
          <span className="sm:hidden">‹</span>
        </button>

        <div className="flex space-x-1 sm:space-x-2 max-w-xs sm:max-w-none overflow-x-auto scrollbar-hide">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm transition-colors flex-shrink-0 ${
                currentPage === i + 1
                  ? "bg-black text-white border-black"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">›</span>
        </button>
        </div>
      )}

      {/* --- Modal --- */}
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
                <p className="text-lg sm:text-xl font-semibold text-green-600 mb-3">
                  ${selectedProduct.price}{selectedProduct.ending_price && (
                    <> to ${selectedProduct.ending_price}</>
                  )}
                </p>
              )}
              <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed">
                {selectedProduct.description}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Product Code: <span className="font-mono">{selectedProduct.code}</span>
                {selectedProduct.retail_price && (
                  <span className="ml-2">
                    | Retail Price: <span className="font-semibold">${selectedProduct.retail_price}</span>
                  </span>
                )}
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
                  📸 <strong>Money back gurrantee:</strong> ✅ 100% Money-Back Guarantee – Full refund if your product doesn’t arrive or is damaged.
                </p>
              </div>

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

                  // Removed instruction modal for simpler approach

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
                className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition mt-auto text-sm sm:text-base font-medium"
              >
                Send DM on Instagram
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
