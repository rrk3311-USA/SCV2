/**
 * Directus CMS client for SCV2
 * 
 * Provides typed access to Directus API for fetching products,
 * categories, orders, and other content.
 */

import { createDirectus, rest, readItems, readItem } from '@directus/sdk';

// Directus schema types
export type DirectusProduct = {
  id: number;
  status: 'published' | 'draft' | 'archived';
  slug: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  short_description?: string;
  description?: string;
  suggested_use?: string;
  supplement_facts?: string;
  ingredients?: string;
  upc?: string;
  gtin?: string;
  weight?: string;
  dimensions?: string;
  key_search_terms?: string;
  image?: string;
  images?: string[];
  subscribe_save_percent?: number;
  bundle_options?: DirectusBundleOption[];
  faqs?: DirectusFAQ[];
  date_created?: string;
  date_updated?: string;
};

export type DirectusBundleOption = {
  id: number;
  product_id: number;
  label: string;
  quantity: number;
  price: number;
  save_percent?: number;
};

export type DirectusFAQ = {
  id: number;
  product_id: number;
  question: string;
  answer: string;
  sort?: number;
};

export type DirectusCategory = {
  id: number;
  status: 'published' | 'draft' | 'archived';
  category_id: string;
  name: string;
  description?: string;
  image?: string;
  count: number;
  sort?: number;
};

export type DirectusOrder = {
  id: number;
  order_number: string;
  customer_id?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: 'paypal' | 'google_pay' | 'credit_card';
  subtotal?: number;
  tax?: number;
  shipping?: number;
  total: number;
  customer_email?: string;
  shipping_address?: object;
  billing_address?: object;
  items?: DirectusOrderItem[];
  date_created?: string;
  date_updated?: string;
};

export type DirectusOrderItem = {
  id: number;
  order_id: number;
  product_id?: number;
  product_name?: string;
  product_sku?: string;
  quantity: number;
  unit_price?: number;
  total?: number;
};

export type DirectusReview = {
  id: number;
  status: 'published' | 'pending' | 'rejected';
  product_id: number;
  customer_id?: number;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  comment: string;
  customer_name?: string;
  customer_email?: string;
  date_created?: string;
};

// Schema type for Directus SDK
type Schema = {
  products: DirectusProduct[];
  categories: DirectusCategory[];
  bundle_options: DirectusBundleOption[];
  product_faqs: DirectusFAQ[];
  orders: DirectusOrder[];
  order_items: DirectusOrderItem[];
  reviews: DirectusReview[];
};

// Create Directus client
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export const directus = createDirectus<Schema>(DIRECTUS_URL).with(rest());

/**
 * Fetch all published products
 */
export async function getProducts() {
  try {
    return await directus.request(
      readItems('products', {
        filter: { status: { _eq: 'published' } },
        fields: ['*', 'bundle_options.*', 'faqs.*'] as any,
        sort: ['date_created'] as any,
      })
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch a single product by slug
 */
export async function getProductBySlug(slug: string) {
  try {
    const products = await directus.request(
      readItems('products', {
        filter: { 
          slug: { _eq: slug },
          status: { _eq: 'published' }
        },
        fields: ['*', 'bundle_options.*', 'faqs.*'] as any,
        limit: 1,
      })
    );
    return products[0] || null;
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch a single product by SKU
 */
export async function getProductBySku(sku: string) {
  try {
    const products = await directus.request(
      readItems('products', {
        filter: { 
          sku: { _eq: sku },
          status: { _eq: 'published' }
        },
        fields: ['*', 'bundle_options.*', 'faqs.*'] as any,
        limit: 1,
      })
    );
    return products[0] || null;
  } catch (error) {
    console.error(`Error fetching product ${sku}:`, error);
    return null;
  }
}

/**
 * Fetch products by category
 */
export async function getProductsByCategory(category: string) {
  try {
    return await directus.request(
      readItems('products', {
        filter: { 
          category: { _eq: category },
          status: { _eq: 'published' }
        },
        fields: ['*', 'bundle_options.*'] as any,
        sort: ['date_created'] as any,
      })
    );
  } catch (error) {
    console.error(`Error fetching products for category ${category}:`, error);
    return [];
  }
}

/**
 * Fetch all published categories
 */
export async function getCategories() {
  try {
    return await directus.request(
      readItems('categories', {
        filter: { status: { _eq: 'published' } },
        sort: ['id'] as any,
      })
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch reviews for a product
 */
export async function getProductReviews(productId: number) {
  try {
    return await directus.request(
      readItems('reviews', {
        filter: { 
          product_id: { _eq: productId },
          status: { _eq: 'published' }
        },
        sort: ['-date_created'],
      })
    );
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return [];
  }
}

/**
 * Search products by query
 */
export async function searchProducts(query: string) {
  try {
    return await directus.request(
      readItems('products', {
        filter: { 
          _or: [
            { name: { _contains: query } },
            { description: { _contains: query } },
            { short_description: { _contains: query } },
            { key_search_terms: { _contains: query } },
            { sku: { _contains: query } },
          ],
          status: { _eq: 'published' }
        },
        fields: ['*', 'bundle_options.*'] as any,
        limit: 20,
      })
    );
  } catch (error) {
    console.error(`Error searching products: ${query}`, error);
    return [];
  }
}

/**
 * Get image URL from Directus
 */
export function getImageUrl(fileId: string | undefined, options?: {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
  quality?: number;
}) {
  if (!fileId) return '';
  
  const params = new URLSearchParams();
  if (options?.width) params.append('width', options.width.toString());
  if (options?.height) params.append('height', options.height.toString());
  if (options?.fit) params.append('fit', options.fit);
  if (options?.quality) params.append('quality', options.quality.toString());
  
  const queryString = params.toString();
  return `${DIRECTUS_URL}/assets/${fileId}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Convert Directus product to SCV2 Product type
 */
export function convertDirectusProduct(directusProduct: DirectusProduct): any {
  return {
    slug: directusProduct.slug,
    sku: directusProduct.sku,
    name: directusProduct.name,
    price: directusProduct.price,
    category: directusProduct.category,
    short_description: directusProduct.short_description,
    description: directusProduct.description,
    suggested_use: directusProduct.suggested_use,
    supplement_facts: directusProduct.supplement_facts,
    ingredients: directusProduct.ingredients,
    upc: directusProduct.upc,
    gtin: directusProduct.gtin,
    weight: directusProduct.weight,
    dimensions: directusProduct.dimensions,
    key_search_terms: directusProduct.key_search_terms,
    image: directusProduct.image ? getImageUrl(directusProduct.image) : '',
    images: directusProduct.images || [],
    bundle_options: directusProduct.bundle_options?.map(b => ({
      label: b.label,
      quantity: b.quantity,
      price: b.price,
      savePercent: b.save_percent,
    })) || [],
    faqs: directusProduct.faqs?.map(f => ({
      question: f.question,
      answer: f.answer,
    })) || [],
    subscribe_save_percent: directusProduct.subscribe_save_percent || 15,
  };
}
