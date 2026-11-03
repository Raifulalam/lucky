/**
 * Slugify utility for product URLs.
 * Generates clean slugs in format: brand-model-type
 * Removes UI text, city names, and suffixes like "new"
 */

const SLUG_STOP_WORDS = new Set([
  // UI/button text
  'add-to-wishlist', 'compare', 'wishlist', 'compare',
  'in-stock', 'out-of-stock', 'available', 'unavailable',
  'premium', 'standard', 'basic', 'series',
  // Discount/marketing text
  'off', 'discount', 'sale', 'offer', 'deal', 'best',
  // Location suffixes
  'birgunj', 'nepal', 'pune', 'new', 'delhi', 'kathmandu',
  // Generic words
  'price', 'shop', 'buy', 'online', 'store',
]);

const CLEAN_BRANDS = {
  'lg': 'LG',
  'samsung': 'Samsung',
  'whirlpool': 'Whirlpool',
  'haier': 'Haier',
  'voltas': 'Voltas',
  'cg': 'CG',
  'panasonic': 'Panasonic',
  'sony': 'Sony',
  'philips': 'Philips',
  'bosch': 'Bosch',
  'godrej': 'Godrej',
  'videocon': 'Videocon',
  'micromax': 'Micromax',
  'intex': 'Intex',
  'xiaomi': 'Xiaomi',
  'realme': 'Realme',
  'oppo': 'Oppo',
  'vivo': 'Vivo',
  'oneplus': 'OnePlus',
  'apple': 'Apple',
};

/**
 * Clean a string by removing stop words and normalizing
 */
function cleanString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except space and hyphen
    .split(/\s+/)
    .filter(word => word && !SLUG_STOP_WORDS.has(word) && word.length > 1)
    .join(' ');
}

/**
 * Slugify a product to format: brand-model-type
 */
function slugifyProduct(product) {
  const parts = [];

  // Brand (normalized)
  if (product.brand) {
    const brandKey = product.brand.toLowerCase().trim();
    const cleanBrand = CLEAN_BRANDS[brandKey] || product.brand.trim();
    parts.push(cleanBrand.toLowerCase().replace(/\s+/g, '-'));
  }

  // Model (if exists)
  if (product.model) {
    const cleanModel = cleanString(product.model);
    if (cleanModel) {
      parts.push(cleanModel.replace(/\s+/g, '-'));
    }
  }

  // Type/category (if different from brand)
  if (product.category && product.category.toLowerCase() !== product.brand?.toLowerCase()) {
    const cleanCategory = cleanString(product.category);
    if (cleanCategory) {
      parts.push(cleanCategory.replace(/\s+/g, '-'));
    }
  }

  // If we don't have enough parts, use cleaned name
  if (parts.length < 2 && product.name) {
    const cleanName = cleanString(product.name);
    if (cleanName) {
      parts.push(cleanName.replace(/\s+/g, '-'));
    }
  }

  // Join with hyphens and truncate if too long
  let slug = parts.join('-');

  // Ensure slug is safe (only alphanumeric and hyphens)
  slug = slug.replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');

  // Limit length (max 100 chars for URL safety)
  if (slug.length > 100) {
    slug = slug.substring(0, 100).replace(/-$/, '');
  }

  // Add random suffix if empty
  if (!slug) {
    slug = `product-${Date.now()}`;
  }

  return slug;
}

/**
 * Generate a new slug and detect if it changed
 */
function generateSlug(product) {
  const newSlug = slugifyProduct(product);
  const oldSlug = product.slug;

  return {
    newSlug,
    oldSlug,
    changed: oldSlug !== newSlug,
  };
}

module.exports = { slugifyProduct, generateSlug, SLUG_STOP_WORDS, CLEAN_BRANDS };
