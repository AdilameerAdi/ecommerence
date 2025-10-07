import React, { useState, useEffect } from 'react';

/**
 * AdvertisementPopup Component
 * 
 * Shows an attractive advertisement popup for first-time visitors
 * Uses the same Instagram link as product cards for consistency
 * 
 * @param {number} delay - Delay in milliseconds before showing popup (default: 2500ms)
 * @param {boolean} showOnEveryVisit - Whether to show popup on every visit (default: false)
 * 
 * Usage:
 * <AdvertisementPopup 
 *   delay={3000} 
 *   showOnEveryVisit={false} 
 * />
 */
const AdvertisementPopup = ({ 
  delay = 2500,
  showOnEveryVisit = false 
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Check if this is the first visit or if we should show on every visit
    const hasVisited = localStorage.getItem('hasVisited');
    
    if (!hasVisited || showOnEveryVisit) {
      setIsFirstVisit(true);
      // Show popup after specified delay
      const timer = setTimeout(() => {
        setShowPopup(true);
        // Mark as visited only if not showing on every visit
        if (!showOnEveryVisit) {
          localStorage.setItem('hasVisited', 'true');
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay, showOnEveryVisit]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPopup]);

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleInstagramClick = () => {
    // Use the same Instagram link as in product cards
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

  if (!showPopup || !isFirstVisit) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full relative border border-gray-200" style={{ position: 'relative', zIndex: 10000 }}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-10 bg-white hover:bg-gray-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-lg border border-gray-200"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-xl">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Easy Shopping</h2>
            <p className="text-white/90 text-sm">Get your products delivered!</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Steps */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-bold">1</span>
              </div>
              <span className="text-gray-700 text-sm">📸 Take Screenshot</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-pink-600 text-sm font-bold">2</span>
              </div>
              <span className="text-gray-700 text-sm">💬 DM on Instagram</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">3</span>
              </div>
              <span className="text-gray-700 text-sm">💰 Pay & Get Delivered</span>
            </div>
          </div>

          {/* Instagram Button */}
          <button
            onClick={handleInstagramClick}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Contact on Instagram</span>
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-3">
            Quick & Easy Shopping Experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementPopup;
