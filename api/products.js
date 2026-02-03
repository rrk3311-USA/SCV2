// API endpoint to fetch products from PocketBase
// Your site calls this to get live product data

import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.PB_URL || 'http://localhost:8090');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { slug, sku, id } = req.query;

    try {
      // Auth as admin
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL,
        process.env.PB_ADMIN_PASSWORD
      );

      // Get single product
      if (slug) {
        const result = await pb.collection('products').getList(1, 1, {
          filter: `slug = "${slug}"`
        });
        
        if (result.items.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
        
        return res.status(200).json(result.items[0]);
      }

      if (sku) {
        const result = await pb.collection('products').getList(1, 1, {
          filter: `sku = "${sku}"`
        });
        
        if (result.items.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
        
        return res.status(200).json(result.items[0]);
      }

      if (id) {
        const product = await pb.collection('products').getOne(id);
        return res.status(200).json(product);
      }

      // Get all products
      const products = await pb.collection('products').getFullList({
        sort: '-created',
        filter: 'inStock = true'
      });

      return res.status(200).json(products);

    } catch (error) {
      console.error('Products API error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch products',
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
