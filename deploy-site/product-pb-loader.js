/**
 * PocketBase Product Loader
 * Fetches live product data from PocketBase and falls back to products-data.js
 */

const PB_CONFIG = {
    url: window.location.hostname === 'localhost' 
        ? 'http://localhost:8090'
        : 'https://success-chemistry-pb.fly.dev',
    apiUrl: window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://successchemistry.com'
};

class ProductLoader {
    constructor() {
        this.cache = new Map();
        this.cacheTime = new Map();
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        this.useLiveData = true; // Toggle to enable/disable PocketBase
    }

    /**
     * Get product by SKU - tries PocketBase first, falls back to products-data.js
     */
    async getProductBySKU(sku) {
        // Check cache
        if (this.cache.has(sku)) {
            const age = Date.now() - this.cacheTime.get(sku);
            if (age < this.CACHE_DURATION) {
                console.log('📦 Using cached product:', sku);
                return this.cache.get(sku);
            }
        }

        let product = null;

        // Try PocketBase first (if enabled)
        if (this.useLiveData) {
            try {
                product = await this.fetchFromPocketBase(sku);
                if (product) {
                    console.log('✅ Loaded from PocketBase:', sku);
                    this.cacheProduct(sku, product);
                    return product;
                }
            } catch (error) {
                console.warn('⚠️ PocketBase fetch failed, falling back to static data:', error.message);
            }
        }

        // Fallback to products-data.js
        if (typeof PRODUCTS_DATA !== 'undefined' && PRODUCTS_DATA[sku]) {
            console.log('📄 Using static data:', sku);
            product = this.formatStaticProduct(PRODUCTS_DATA[sku], sku);
            this.cacheProduct(sku, product);
            return product;
        }

        console.error('❌ Product not found:', sku);
        return null;
    }

    /**
     * Fetch product from PocketBase API
     */
    async fetchFromPocketBase(sku) {
        try {
            const response = await fetch(`${PB_CONFIG.apiUrl}/api/products?sku=${sku}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const product = await response.json();
            return this.formatPocketBaseProduct(product);
        } catch (error) {
            console.error('PocketBase API error:', error);
            return null;
        }
    }

    /**
     * Format PocketBase product to match products-data.js structure
     */
    formatPocketBaseProduct(product) {
        return {
            sku: product.sku,
            name: product.name,
            price: product.price,
            category: product.category || 'Supplements',
            description: product.description || '',
            short_description: product.shortDescription || '',
            suggested_use: product.suggestedUse || '',
            supplement_facts: product.supplementFacts || '',
            ingredients: product.ingredients || '',
            weight: product.weight || '3oz',
            dimensions: product.dimensions || '2 x 3.5 inches',
            images: this.getProductImages(product),
            stock: product.stock || 0,
            upc: product.upc || product.gtin || '',
            gtin: product.gtin || product.upc || '',
            key_search_terms: product.keySearchTerms || '',
            seo_targets: product.seoTargets || {},
            // PocketBase-specific fields
            _pbId: product.id,
            _pbSlug: product.slug,
            _isLive: true,
            _editUrl: `${PB_CONFIG.url}/_/#/collections/products/records/${product.id}`
        };
    }

    /**
     * Get product images from PocketBase
     */
    getProductImages(product) {
        const images = [];

        // PocketBase uploaded images
        if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
                images.push(`${PB_CONFIG.url}/api/files/products/${product.id}/${img}`);
            });
        }

        // Fallback to imagePaths (from products-data.js migration)
        if (images.length === 0 && product.imagePaths && product.imagePaths.length > 0) {
            images.push(...product.imagePaths);
        }

        return images;
    }

    /**
     * Format static product from products-data.js
     */
    formatStaticProduct(product, sku) {
        return {
            ...product,
            sku,
            _isLive: false,
            _editUrl: null
        };
    }

    /**
     * Cache product
     */
    cacheProduct(sku, product) {
        this.cache.set(sku, product);
        this.cacheTime.set(sku, Date.now());
    }

    /**
     * Clear cache for a specific product or all products
     */
    clearCache(sku = null) {
        if (sku) {
            this.cache.delete(sku);
            this.cacheTime.delete(sku);
            console.log('🗑️ Cleared cache for:', sku);
        } else {
            this.cache.clear();
            this.cacheTime.clear();
            console.log('🗑️ Cleared all product cache');
        }
    }

    /**
     * Check if admin is logged in (for showing edit button)
     */
    isAdmin() {
        // Check localStorage for admin token
        const adminToken = localStorage.getItem('pb_admin_token');
        const pbAuth = localStorage.getItem('pocketbase_auth');
        
        return !!(adminToken || pbAuth);
    }

    /**
     * Show edit button for admins
     */
    showEditButton(product) {
        if (!this.isAdmin() || !product._isLive) return;

        // Check if button already exists
        if (document.getElementById('pb-edit-button')) return;

        const button = document.createElement('div');
        button.id = 'pb-edit-button';
        button.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 12px 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                display: flex;
                gap: 10px;
                align-items: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <span style="color: white; font-size: 14px; font-weight: 600;">
                    Admin Mode
                </span>
                <a 
                    href="${product._editUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                        background: white;
                        color: #667eea;
                        padding: 8px 16px;
                        border-radius: 8px;
                        text-decoration: none;
                        font-size: 14px;
                        font-weight: 600;
                        transition: transform 0.2s;
                    "
                    onmouseover="this.style.transform='scale(1.05)'"
                    onmouseout="this.style.transform='scale(1)'"
                >
                    ✏️ Edit in PocketBase
                </a>
                <button
                    onclick="window.productLoader.clearCache('${product.sku}'); window.location.reload();"
                    style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                    "
                >
                    🔄 Refresh
                </button>
            </div>
        `;

        document.body.appendChild(button);
    }

    /**
     * Show live data indicator
     */
    showLiveIndicator(isLive) {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${isLive ? '#10b981' : '#6b7280'};
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            z-index: 9998;
            display: flex;
            align-items: center;
            gap: 6px;
        `;
        indicator.innerHTML = `
            <span style="
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                display: inline-block;
                ${isLive ? 'animation: pulse 2s infinite;' : ''}
            "></span>
            ${isLive ? 'Live from PocketBase' : 'Static Data'}
        `;

        // Add pulse animation
        if (isLive) {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(indicator);
    }
}

// Create global instance
window.productLoader = new ProductLoader();

// Helper function for backward compatibility
async function loadProduct(sku) {
    return await window.productLoader.getProductBySKU(sku);
}

console.log('🚀 PocketBase Product Loader initialized');
