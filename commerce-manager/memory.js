// Memory & Knowledge Base for Commerce Manager
// Gives the agent "memory" by storing context in PocketBase

export class AgentMemory {
  constructor(pb) {
    this.pb = pb;
    this.cache = {
      products: null,
      orders: null,
      insights: null,
      lastUpdate: null
    };
  }

  // ============================================
  // KNOWLEDGE BASE
  // ============================================

  async buildKnowledgeBase() {
    console.log('🧠 Building knowledge base...');
    
    await this.pb.auth();

    // Get all products
    const products = await this.pb.getProducts({ limit: 1000 });
    
    // Get recent orders (last 90 days)
    const orders = await this.pb.getOrders({ days: 90, limit: 1000 });
    
    // Calculate insights
    const insights = this.calculateInsights(products.items || [], orders.items || []);
    
    // Cache in memory
    this.cache = {
      products: products.items || [],
      orders: orders.items || [],
      insights,
      lastUpdate: new Date().toISOString()
    };

    // Store in PocketBase for persistence
    await this.saveKnowledgeBase({
      products: products.items?.length || 0,
      orders: orders.items?.length || 0,
      insights,
      lastUpdate: this.cache.lastUpdate
    });

    console.log(`✅ Knowledge base built: ${products.items?.length || 0} products, ${orders.items?.length || 0} orders`);
    
    return this.cache;
  }

  calculateInsights(products, orders) {
    // Top sellers
    const skuCounts = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        if (!skuCounts[item.sku]) {
          skuCounts[item.sku] = { sku: item.sku, name: item.name, quantity: 0, revenue: 0 };
        }
        skuCounts[item.sku].quantity += item.quantity;
        skuCounts[item.sku].revenue += item.price * item.quantity;
      });
    });
    
    const topSellers = Object.values(skuCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Revenue by category
    const categoryRevenue = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const cat = item.category || 'Other';
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item.price * item.quantity);
      });
    });

    // Average order value
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

    // Low stock products
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10);
    const outOfStock = products.filter(p => p.stock === 0 || !p.inStock);

    // Price ranges
    const prices = products.map(p => p.price).filter(Boolean);
    const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return {
      topSellers,
      categoryRevenue,
      totalRevenue,
      avgOrderValue,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      productCount: products.length,
      orderCount: orders.length,
      avgPrice,
      priceRange: { min: minPrice, max: maxPrice }
    };
  }

  async saveKnowledgeBase(data) {
    try {
      const existing = await this.pb.pb.collection('knowledge_base').getList(1, 1, {
        sort: '-created'
      });

      if (existing.items.length > 0) {
        await this.pb.pb.collection('knowledge_base').update(existing.items[0].id, data);
      } else {
        await this.pb.pb.collection('knowledge_base').create(data);
      }
    } catch (error) {
      console.log('Knowledge base collection not configured, skipping save');
    }
  }

  async getKnowledgeBase() {
    // Return cached if recent (< 5 minutes old)
    if (this.cache.lastUpdate) {
      const age = Date.now() - new Date(this.cache.lastUpdate).getTime();
      if (age < 5 * 60 * 1000) {
        return this.cache;
      }
    }

    // Rebuild if stale
    return await this.buildKnowledgeBase();
  }

  // ============================================
  // CONTEXT BUILDER
  // ============================================

  async buildContext() {
    const kb = await this.getKnowledgeBase();
    
    return `
## Current Store Context (Auto-updated)

### Products
- Total: ${kb.insights.productCount}
- Average Price: $${kb.insights.avgPrice.toFixed(2)}
- Price Range: $${kb.insights.priceRange.min} - $${kb.insights.priceRange.max}
- Low Stock: ${kb.insights.lowStock} products
- Out of Stock: ${kb.insights.outOfStock} products

### Sales (Last 90 Days)
- Total Orders: ${kb.insights.orderCount}
- Total Revenue: $${kb.insights.totalRevenue.toFixed(2)}
- Average Order: $${kb.insights.avgOrderValue.toFixed(2)}

### Top Sellers
${kb.insights.topSellers.slice(0, 5).map((p, i) => 
  `${i + 1}. ${p.name} - ${p.quantity} units, $${p.revenue.toFixed(2)}`
).join('\n')}

### Revenue by Category
${Object.entries(kb.insights.categoryRevenue).map(([cat, rev]) => 
  `- ${cat}: $${rev.toFixed(2)}`
).join('\n')}

Last Updated: ${kb.lastUpdate}
`;
  }

  // ============================================
  // CONVERSATION MEMORY
  // ============================================

  async saveConversation(sessionId, messages) {
    try {
      const existing = await this.pb.pb.collection('agent_conversations').getList(1, 1, {
        filter: `sessionId = "${sessionId}"`
      });

      const data = {
        sessionId,
        messages: messages.slice(-50), // Keep last 50 messages
        lastActivity: new Date().toISOString()
      };

      if (existing.items.length > 0) {
        await this.pb.pb.collection('agent_conversations').update(existing.items[0].id, data);
      } else {
        await this.pb.pb.collection('agent_conversations').create(data);
      }
    } catch (error) {
      console.log('Conversations collection not configured');
    }
  }

  async loadConversation(sessionId) {
    try {
      const result = await this.pb.pb.collection('agent_conversations').getList(1, 1, {
        filter: `sessionId = "${sessionId}"`
      });

      if (result.items.length > 0) {
        return result.items[0].messages || [];
      }
    } catch (error) {
      console.log('Could not load conversation');
    }
    
    return [];
  }

  // ============================================
  // LEARNED INSIGHTS
  // ============================================

  async saveInsight(insight) {
    try {
      await this.pb.pb.collection('agent_insights').create({
        type: insight.type,
        content: insight.content,
        confidence: insight.confidence || 0.8,
        source: insight.source || 'agent',
        created: new Date().toISOString()
      });
    } catch (error) {
      console.log('Insights collection not configured');
    }
  }

  async getInsights(type = null) {
    try {
      const filter = type ? `type = "${type}"` : undefined;
      const insights = await this.pb.pb.collection('agent_insights').getList(1, 100, {
        filter,
        sort: '-created'
      });
      return insights.items || [];
    } catch (error) {
      return [];
    }
  }

  // ============================================
  // PRODUCT EMBEDDINGS (for semantic search)
  // ============================================

  async cacheProductSummaries() {
    const products = this.cache.products || await this.pb.getProducts({ limit: 1000 });
    
    const summaries = (products.items || products).map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      price: p.price,
      category: p.category,
      summary: `${p.name} - ${p.shortDescription || ''} - $${p.price} - ${p.category || 'supplements'}`,
      inStock: p.inStock,
      stock: p.stock
    }));

    return summaries;
  }

  // ============================================
  // REFRESH
  // ============================================

  async refresh() {
    console.log('🔄 Refreshing knowledge base...');
    return await this.buildKnowledgeBase();
  }

  // ============================================
  // STATS
  // ============================================

  getStats() {
    return {
      productsLoaded: this.cache.products?.length || 0,
      ordersLoaded: this.cache.orders?.length || 0,
      lastUpdate: this.cache.lastUpdate,
      cacheAge: this.cache.lastUpdate 
        ? Math.floor((Date.now() - new Date(this.cache.lastUpdate).getTime()) / 1000)
        : null
    };
  }
}
