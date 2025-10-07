import React, { useState, useEffect } from 'react';
import { getImageFallbackUrls } from '../utils/imageUrlConverter';

/**
 * Smart Image Component
 * Tries multiple image URLs until one works, with fallback content
 */
const SmartImage = ({
  src,
  alt,
  className = '',
  fallbackContent,
  onLoad,
  onAllFailed,
  ...props
}) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fallbackUrls] = useState(() => getImageFallbackUrls(src));

  const currentUrl = fallbackUrls[currentUrlIndex];

  useEffect(() => {
    setCurrentUrlIndex(0);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    console.log(`✅ Image loaded successfully:`, currentUrl);
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    console.log(`❌ Image failed to load:`, currentUrl);

    // Try next URL in the fallback list
    if (currentUrlIndex + 1 < fallbackUrls.length) {
      console.log(`🔄 Trying next fallback URL...`);
      setCurrentUrlIndex(currentUrlIndex + 1);
    } else {
      // All URLs failed
      console.log(`💥 All image URLs failed for:`, src);
      setIsLoading(false);
      setHasError(true);
      if (onAllFailed) onAllFailed();
    }
  };

  // Show fallback content if all images failed or no src provided
  if (!src || hasError) {
    return fallbackContent || <div className={className}>No image</div>;
  }

  return (
    <>
      <img
        src={currentUrl}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: isLoading && hasError ? 'none' : 'block' }}
        {...props}
      />
      {/* Show loading indicator while trying URLs */}
      {isLoading && !hasError && (
        <div className={`${className} animate-pulse bg-gray-200 flex items-center justify-center`}>
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );
};

export default SmartImage;