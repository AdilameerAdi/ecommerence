import React, { useState, useEffect } from "react";
import { getSlidingContent } from "../lib/supabase";

export default function Header() {

  const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const duration = 15; // Animation duration in seconds

    useEffect(() => {
      fetchContent();
    }, []);

    const fetchContent = async () => {
      try {
        const data = await getSlidingContent();
        if (data) {
          setMessage(data);
        } else {
          setMessage('🎉 Welcome to Reseller Market - Your one-stop shop for amazing products! 🛍️ Free shipping on orders over $100 📦 New arrivals every week!');
        }
      } catch (error) {
        console.error('Error fetching sliding content:', error);
        setMessage('Welcome to Reseller Market!');
      } finally {
        setLoading(false);
      }
    };
  
    if (loading || !message) return null;
  
  return (
    <header
      className={`w-full overflow-hidden bg-gradient-to-r from-black via-gray-900 to-black text-white shadow-md relative z-40`}
    >
      <div
        className="relative flex overflow-hidden whitespace-nowrap will-change-transform items-center py-1 sm:py-2 md:py-3"
        role="status"
        aria-label={message}
      >
        <div
          className="animate-marquee inline-flex"
          style={{
            animationDuration: `${duration}s`
          }}
        >
          <span className="mx-6 font-medium text-sm sm:text-base md:text-lg tracking-wide uppercase">
            {message}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(100vw);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee linear infinite;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused; /* pause on hover */
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none !important;
          }
        }
      `}</style>
    </header>
  );
}
