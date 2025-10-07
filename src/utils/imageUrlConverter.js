/**
 * Universal Image URL Converter
 * Converts various types of image sharing URLs to direct image URLs that work in <img> tags
 */

export const convertToDirectImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  // Already a direct image URL
  if (isDirectImageUrl(url)) {
    return url;
  }

  // Google Drive share link
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // Convert to: https://drive.google.com/uc?export=view&id=FILE_ID
  const googleDriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (googleDriveMatch) {
    return `https://drive.google.com/uc?export=view&id=${googleDriveMatch[1]}`;
  }

  // Google Photos share link
  // Format: https://photos.google.com/share/...
  // Convert using a proxy service
  if (url.includes('photos.google.com')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  }

  // Dropbox share link
  // Format: https://www.dropbox.com/s/HASH/filename?dl=0
  // Convert to: https://www.dropbox.com/s/HASH/filename?raw=1
  if (url.includes('dropbox.com') && url.includes('?dl=0')) {
    return url.replace('?dl=0', '?raw=1');
  }

  // OneDrive share link
  // Format: https://onedrive.live.com/...
  // Convert using embed format
  if (url.includes('onedrive.live.com')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  }

  // Instagram image link
  // Already works but ensure https
  if (url.includes('instagram.com') || url.includes('cdninstagram.com')) {
    return url.replace('http://', 'https://');
  }

  // Facebook image link
  // Use proxy service for Facebook images
  if (url.includes('facebook.com') || url.includes('fbcdn.net')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  }

  // Twitter/X image link
  if (url.includes('twitter.com') || url.includes('twimg.com') || url.includes('x.com')) {
    return url.replace('http://', 'https://');
  }

  // Generic share.google link (like in your database)
  // Format: https://share.google/images/HASH
  if (url.includes('share.google') || url.includes('goo.gl')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  }

  // Pinterest image
  if (url.includes('pinterest.com') || url.includes('pinimg.com')) {
    return url.replace('http://', 'https://');
  }

  // Imgur link
  // Convert to direct link if needed
  if (url.includes('imgur.com') && !url.includes('.jpg') && !url.includes('.png') && !url.includes('.gif')) {
    const imgurId = url.split('/').pop().split('?')[0];
    return `https://i.imgur.com/${imgurId}.jpg`;
  }

  // Reddit image
  if (url.includes('reddit.com') || url.includes('redd.it')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  }

  // For any other URL that might not work, use a proxy service
  if (!isDirectImageUrl(url)) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  }

  // Ensure https for security
  return url.replace('http://', 'https://');
};

/**
 * Check if URL is already a direct image URL
 */
const isDirectImageUrl = (url) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  const urlLower = url.toLowerCase();

  // Check if URL ends with image extension
  if (imageExtensions.some(ext => urlLower.includes(ext))) {
    return true;
  }

  // Check for common direct image hosting patterns
  const directImageHosts = [
    'i.imgur.com',
    'images.unsplash.com',
    'via.placeholder.com',
    'picsum.photos',
    'cdn.pixabay.com',
    'images.pexels.com'
  ];

  return directImageHosts.some(host => urlLower.includes(host));
};

/**
 * Get multiple fallback URLs for an image
 */
export const getImageFallbackUrls = (originalUrl) => {
  const urls = [];

  // Original URL
  if (originalUrl) {
    urls.push(originalUrl);
  }

  // Converted URL
  const converted = convertToDirectImageUrl(originalUrl);
  if (converted && converted !== originalUrl) {
    urls.push(converted);
  }

  // Additional proxy services as fallbacks
  if (originalUrl) {
    urls.push(`https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}`);
    urls.push(`https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}&w=200&h=200&fit=cover`);
  }

  return urls;
};

/**
 * Test if an image URL is accessible
 */
export const testImageUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve(false);
    }, 5000); // 5 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    img.src = url;
  });
};

/**
 * Component hook for smart image loading with fallbacks
 */
export const useSmartImage = (originalUrl) => {
  const fallbackUrls = getImageFallbackUrls(originalUrl);

  return {
    primaryUrl: fallbackUrls[0],
    fallbackUrls: fallbackUrls.slice(1),
    convertedUrl: convertToDirectImageUrl(originalUrl)
  };
};