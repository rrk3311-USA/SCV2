// Product loader for your site
// Fetches live product data from PocketBase

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const PB_URL = process.env.NEXT_PUBLIC_PB_URL || 'http://localhost:8090';

// Cache products in memory (optional)
let productCache = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get product by slug (for product pages)
 */
export async function getProductBySlug(slug) {
  try {
    // Option 1: Via your API endpoint
    const response = await fetch(`${API_URL}/api/products?slug=${slug}`);
    if (!response.ok) {
      throw new Error('Product not found');
    }
    return await response.json();

    // Option 2: Direct from PocketBase (if you want)
    // const response = await fetch(`${PB_URL}/api/collections/products/records?filter=slug="${slug}"`);
    // const data = await response.json();
    // return data.items[0];
  } catch (error) {
    console.error('Error loading product:', error);
    return null;
  }
}

/**
 * Get all products (for product listing pages)
 */
export async function getAllProducts(options = {}) {
  const { useCache = true, filter = '' } = options;

  // Check cache
  if (useCache && productCache && cacheTime) {
    const age = Date.now() - cacheTime;
    if (age < CACHE_DURATION) {
      console.log('📦 Using cached products');
      return productCache;
    }
  }

  try {
    const url = filter 
      ? `${API_URL}/api/products?filter=${encodeURIComponent(filter)}`
      : `${API_URL}/api/products`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const products = await response.json();
    
    // Update cache
    productCache = products;
    cacheTime = Date.now();
    
    return products;
  } catch (error) {
    console.error('Error loading products:', error);
    return productCache || []; // Return cached data if available
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category) {
  return getAllProducts({ 
    filter: `category = "${category}"`,
    useCache: false 
  });
}

/**
 * Search products
 */
export async function searchProducts(query) {
  try {
    const response = await fetch(
      `${API_URL}/api/products?search=${encodeURIComponent(query)}`
    );
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

/**
 * Clear product cache (call after updates)
 */
export function clearProductCache() {
  productCache = null;
  cacheTime = null;
  console.log('🗑️ Product cache cleared');
}

/**
 * Get product image URL
 */
export function getProductImageUrl(product, imageIndex = 0) {
  if (!product) return null;
  
  // If using PocketBase file storage
  if (product.images && product.images.length > 0) {
    return `${PB_URL}/api/files/products/${product.id}/${product.images[imageIndex]}`;
  }
  
  // If using imagePaths (from products-data.js)
  if (product.imagePaths && product.imagePaths.length > 0) {
    return product.imagePaths[imageIndex];
  }
  
  return null;
}

/**
 * Format product for display
 */
export function formatProduct(product) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    price: product.price,
    description: product.description,
    shortDescription: product.shortDescription,
    category: product.category,
    inStock: product.inStock,
    stock: product.stock,
    images: product.images || product.imagePaths || [],
    imageUrl: getProductImageUrl(product),
    url: `/product/${product.slug}`,
    // Add edit link for admins
    editUrl: `${PB_URL}/_/#/collections/products/records/${product.id}`
  };
}
