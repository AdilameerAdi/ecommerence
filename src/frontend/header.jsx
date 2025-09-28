import React from "react";

export default function Header({
  message = "Order Method → Click product → Take screenshot → Send on Instagram DM",
  duration = 16, // adjust speed (higher = slower)
  className = "",
}) {
  return (
    <header
      className={`w-full overflow-hidden bg-gradient-to-r from-black via-gray-900 to-black text-white shadow-md ${className}`}
    >
      <div
        className="flex whitespace-nowrap will-change-transform items-center py-2 sm:py-3"
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
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }   /* start off screen right */
          100% { transform: translateX(-100%); } /* move fully off screen left */
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee linear infinite;
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
