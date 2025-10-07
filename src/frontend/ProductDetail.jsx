import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../lib/supabase';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      const productData = await getProductById(parseInt(productId));

      if (productData) {
        // Transform product_images to images array (same as in products.jsx)
        const transformedProduct = {
          ...productData,
          images: productData.product_images
            ?.sort((a, b) => a.display_order - b.display_order)
            .map(img => img.image_url) || [],
          category: productData.categories?.name || 'Uncategorized',
        };
        
        setProduct(transformedProduct);
        setMainImage(transformedProduct.images[0] || '');
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image, index) => {
    setMainImage(image);
    setCurrentImageIndex(index);
  };

  const handleInstagramClick = async () => {
    if (!product) return;

    const priceText = product.ending_price
      ? `$${product.price} to $${product.ending_price}`
      : `$${product.price}`;
    
    const productInfo = `Hi! I'm interested in this product:\n\n📦 ${product.name}\n💰 Price: ${priceText}\n🔢 Code: ${product.code}\n👤 Reseller: ${product.reseller_name}\n\nCan you please provide more details about availability and delivery?`;

    // Copy product info to clipboard silently
    navigator.clipboard.writeText(productInfo).catch(() => {
      // Silently fail if clipboard doesn't work
    });

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
  };

  const handleShareClick = async () => {
    if (!product) return;

    const productUrl = `${window.location.origin}/product/${product.id}`;
    
    try {
      // Always copy to clipboard for instant sharing
      await navigator.clipboard.writeText(productUrl);
      
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
    } catch (err) {
      console.error('Error copying link:', err);
      // Fallback for older browsers
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const hasMissingPrice = (product) => {
    return !product.price || product.price === 0 || product.price === null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Products
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Product Details</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={mainImage || 'https://via.placeholder.com/400x400?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageClick(image, index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition ${
                        currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Trending Badge */}
              {product.is_trending && (
                <div className="inline-block bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                  🔥 TRENDING
                </div>
              )}

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

              {/* Product Code */}
              <p className="text-gray-600">
                <span className="font-medium">Product Code:</span> {product.code}
              </p>

              {/* Reseller */}
              <p className="text-gray-600">
                <span className="font-medium">Shipping:</span> {product.reseller_name}
              </p>

              {/* Price */}
              {hasMissingPrice(product) ? (
                <p className="text-blue-600 text-xl font-medium">
                  📞 DM to know about the price
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-green-600 text-2xl font-bold">
                    ${product.price}
                    {product.ending_price && (
                      <span className="text-lg"> to ${product.ending_price}</span>
                    )}
                  </p>
                  {product.retail_price && (
                    <p className="text-red-600 text-lg">
                      Retail: ${product.retail_price}
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Category */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Category</h3>
                <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {product.category}
                </span>
              </div>

              {/* How to buy instruction */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  📸 <strong>How to buy:</strong> Take a screenshot of this product, then send via Instagram DM for pricing and availability.
                </p>
                <p className="text-sm text-amber-800 mt-2">
                  📸 <strong>Money back guarantee:</strong> ✅ 100% Money-Back Guarantee – Full refund if your product doesn't arrive or is damaged.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  id="share-product-btn"
                  onClick={handleShareClick}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition text-base font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Product Link
                </button>

                <button
                  onClick={handleInstagramClick}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition text-base font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Contact on Instagram
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
