let logoUrl = '';

try {
  // Try to load from assets in production build
  logoUrl = new URL('./zerocat.png', import.meta.url).href;
} catch (e) {
  // Fallback for older environments or when import.meta.url is not supported
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      logoUrl = '/zerocat.png'; // Fallback to root path
    }
  } catch (err) {
    console.warn('Failed to load Zerocat logo:', err);
  }
}

export default logoUrl;