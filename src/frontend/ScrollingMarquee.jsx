import React, { useState, useEffect } from 'react';
import { getSlidingContent } from '../lib/supabase';

export default function ScrollingMarquee() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const duration = 30; // Animation duration in seconds

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
    <div className="w-full bg-black text-white overflow-hidden">
      <div
        className="flex whitespace-nowrap will-change-transform items-center py-1 sm:py-2 md:py-3"
        role="status"
        aria-label={message}
      >
        <div
          className="inline-block animate-marquee"
          style={{ animationDuration: `${duration}s` }}
        >
          <span className="mx-6 font-medium text-sm sm:text-base md:text-lg tracking-wide uppercase">
            {message}
          </span>
        </div>
        {/* Duplicate for seamless scrolling */}
        <div
          className="inline-block animate-marquee"
          style={{ animationDuration: `${duration}s` }}
        >
          <span className="mx-6 font-medium text-sm sm:text-base md:text-lg tracking-wide uppercase">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}