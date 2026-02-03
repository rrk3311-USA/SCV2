import Anthropic from '@anthropic-ai/sdk';
import { AgentMemory } from './memory.js';

export class CommerceAgent {
  constructor(pb, googleAds) {
    this.pb = pb;
    this.googleAds = googleAds;
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = 'claude-3-5-sonnet-20241022';
    this.sessions = new Map(); // Store conversation history by session
    this.memory = new AgentMemory(pb); // Add memory system
    
    // Build knowledge base on startup
    this.memory.buildKnowledgeBase().catch(console.error);
  }

  // ============================================
  // TOOL DEFINITIONS
  // ============================================

  getTools() {
    return [
      {
        name: 'get_products',
        description: 'Get products from PocketBase database with optional filters',
        input_schema: {
          type: 'object',
          properties: {
            filter: { 
              type: 'string', 
              description: 'Filter query e.g. "category = \'bundles\'" or "inStock = true"' 
            },
            limit: { 
              type: 'number', 
              description: 'Maximum number of products to return (default 50)' 
            },
            sort: { 
              type: 'string', 
              description: 'Sort field e.g. "-created" for newest first' 
            }
          }
        }
      },
      {
        name: 'update_product',
        description: 'Update a product in the database',
        input_schema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Product ID' },
            updates: { 
              type: 'object', 
              description: 'Fields to update e.g. { "price": 29.99, "inStock": true }' 
            }
          },
          required: ['id', 'updates']
        }
      },
      {
        name: 'get_orders',
        description: 'Get orders from the database',
        input_schema: {
          type: 'object',
          properties: {
            status: { 
              type: 'string', 
              enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
              description: 'Filter by order status' 
            },
            days: { 
              type: 'number', 
              description: 'Get orders from the last N days' 
            },
            limit: { 
              type: 'number', 
              description: 'Maximum orders to return' 
            }
          }
        }
      },
      {
        name: 'analyze_sales',
        description: 'Analyze sales data and return insights',
        input_schema: {
          type: 'object',
          properties: {
            metric: { 
              type: 'string', 
              enum: ['top_sellers', 'revenue', 'trends', 'by_category', 'customer_stats'],
              description: 'Type of analysis to perform'
            },
            period: {
              type: 'string',
              enum: ['today', 'week', 'month', 'quarter', 'year'],
              description: 'Time period for analysis'
            }
          },
          required: ['metric']
        }
      },
      {
        name: 'get_google_ads_campaigns',
        description: 'Get Google Ads campaign performance data',
        input_schema: {
          type: 'object',
          properties: {
            dateRange: {
              type: 'string',
              enum: ['TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'LAST_30_DAYS', 'THIS_MONTH'],
              description: 'Date range for campaign data'
            }
          }
        }
      },
      {
        name: 'create_google_ads_campaign',
        description: 'Create a new Google Ads Performance Max campaign',
        input_schema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Campaign name' },
            dailyBudget: { type: 'number', description: 'Daily budget in USD' },
            targetRoas: { type: 'number', description: 'Target ROAS (e.g. 4.0 for 400%)' },
            productIds: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Product IDs to include in campaign'
            }
          },
          required: ['name', 'dailyBudget']
        }
      },
      {
        name: 'update_google_ads_campaign',
        description: 'Update an existing Google Ads campaign',
        input_schema: {
          type: 'object',
          properties: {
            campaignId: { type: 'string', description: 'Campaign ID' },
            status: { 
              type: 'string', 
              enum: ['ENABLED', 'PAUSED'],
              description: 'Campaign status'
            },
            dailyBudget: { type: 'number', description: 'New daily budget' },
            targetRoas: { type: 'number', description: 'New target ROAS' }
          },
          required: ['campaignId']
        }
      },
      {
        name: 'generate_content',
        description: 'Generate marketing content for products',
        input_schema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID' },
            contentType: { 
              type: 'string', 
              enum: ['description', 'ad_headlines', 'ad_descriptions', 'social_post', 'email', 'blog_outline'],
              description: 'Type of content to generate'
            },
            tone: {
              type: 'string',
              enum: ['professional', 'friendly', 'urgent', 'educational'],
              description: 'Tone of the content'
            }
          },
          required: ['productId', 'contentType']
        }
      },
      {
        name: 'get_inventory_alerts',
        description: 'Get inventory alerts for low stock products',
        input_schema: {
          type: 'object',
          properties: {
            threshold: { 
              type: 'number', 
              description: 'Stock threshold for alerts (default 10)' 
            }
          }
        }
      },
      {
        name: 'log_activity',
        description: 'Log an activity or action taken by the agent',
        input_schema: {
          type: 'object',
          properties: {
            action: { type: 'string', description: 'Action taken' },
            details: { type: 'object', description: 'Additional details' },
            status: { 
              type: 'string', 
              enum: ['success', 'warning', 'error'],
              description: 'Status of the action'
            }
          },
          required: ['action']
        }
      }
    ];
  }

  // ============================================
  // TOOL EXECUTION
  // ============================================

  async executeTool(name, input) {
    console.log(`🔧 Executing tool: ${name}`, input);

    switch (name) {
      case 'get_products':
        return await this.pb.getProducts(input);

      case 'update_product':
        return await this.pb.updateProduct(input.id, input.updates);

      case 'get_orders':
        return await this.pb.getOrders(input);

      case 'analyze_sales':
        return await this.analyzeSalesData(input);

      case 'get_google_ads_campaigns':
        return await this.googleAds.getCampaigns(input.dateRange);

      case 'create_google_ads_campaign':
        return await this.googleAds.createCampaign(input);

      case 'update_google_ads_campaign':
        return await this.googleAds.updateCampaign(input.campaignId, input);

      case 'generate_content':
        return await this.generateContent(input);

      case 'get_inventory_alerts':
        return await this.getInventoryAlerts(input.threshold || 10);

      case 'log_activity':
        return await this.pb.logActivity(input);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  // ============================================
  // CHAT INTERFACE
  // ============================================

  async chat(message, context = {}, sessionId = 'default') {
    // Load previous conversation from PocketBase
    if (!this.sessions.has(sessionId)) {
      const savedHistory = await this.memory.loadConversation(sessionId);
      this.sessions.set(sessionId, savedHistory);
    }
    const history = this.sessions.get(sessionId);

    // Add user message to history
    history.push({ role: 'user', content: message });

    // Keep last 20 messages for context
    const recentHistory = history.slice(-20);

    // Build dynamic context from knowledge base
    const knowledgeContext = await this.memory.buildContext();

    const systemPrompt = `You are the AI Commerce Manager for Success Chemistry, a health supplements e-commerce store.

Your role is to:
1. **Manage Products**: Monitor inventory, update prices, optimize descriptions
2. **Manage Ads**: Create and optimize Google Ads campaigns, generate ad copy
3. **Analyze Sales**: Provide insights on sales trends, top sellers, revenue
4. **Generate Content**: Create product descriptions, ad headlines, social posts
5. **Automate Tasks**: Help set up and run automated workflows

Current Context:
- Store: Success Chemistry (successchemistry.com)
- Categories: Supplements, Bundles, Health Products
- Platform: PocketBase backend
- Ads: Google Ads with Performance Max campaigns

${knowledgeContext}

Guidelines:
- Be proactive in suggesting optimizations
- Always provide data-driven recommendations
- When making changes, explain what you're doing and why
- Never make medical claims about supplements
- Use phrases like "may support" or "helps maintain" for health benefits
- Remember insights from previous conversations in this session

${context.additionalContext || ''}`;

    try {
      let response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: systemPrompt,
        tools: this.getTools(),
        messages: recentHistory
      });

      // Handle tool use in a loop
      while (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');
        const toolResults = [];

        for (const toolUse of toolUseBlocks) {
          try {
            const result = await this.executeTool(toolUse.name, toolUse.input);
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify(result)
            });
          } catch (error) {
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify({ error: error.message }),
              is_error: true
            });
          }
        }

        // Add assistant response and tool results to history
        history.push({ role: 'assistant', content: response.content });
        history.push({ role: 'user', content: toolResults });

        // Continue conversation
        response = await this.anthropic.messages.create({
          model: this.model,
          max_tokens: 4096,
          system: systemPrompt,
          tools: this.getTools(),
          messages: history.slice(-20)
        });
      }

      // Extract text response
      const textContent = response.content.find(block => block.type === 'text');
      const assistantMessage = textContent?.text || 'Task completed.';

      // Add final response to history
      history.push({ role: 'assistant', content: response.content });

      // Save conversation to PocketBase
      await this.memory.saveConversation(sessionId, history);

      // Log token usage
      if (response.usage) {
        const cost = (response.usage.input_tokens * 0.003 + response.usage.output_tokens * 0.015) / 1000;
        console.log('💰 Token usage:', {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
          cost: `$${cost.toFixed(4)}`
        });
      }

      return {
        message: assistantMessage,
        sessionId,
        toolsUsed: response.content
          .filter(block => block.type === 'tool_use')
          .map(block => block.name),
        usage: response.usage
      };

    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  // ============================================
  // TASK EXECUTION
  // ============================================

  async executeTask(task, params = {}) {
    const taskPrompts = {
      analyze_sales: `Analyze our sales data for the ${params.period || 'last 30 days'}. 
        Provide insights on: top selling products, revenue trends, and recommendations for improvement.`,
      
      optimize_products: `Review our product catalog and suggest optimizations:
        - Products with missing/weak descriptions
        - Pricing opportunities
        - Inventory issues
        - SEO improvements`,
      
      generate_ads: `Generate Google Ads content for ${params.productId ? `product ${params.productId}` : 'our top products'}:
        - 15 headlines (max 30 chars each)
        - 4 descriptions (max 90 chars each)
        - Suggested keywords`,
      
      review_inventory: `Review inventory levels and provide:
        - Low stock alerts
        - Out of stock products
        - Recommendations for reordering`,
      
      create_campaign: `Create a new Google Ads campaign:
        Name: ${params.name || 'New Campaign'}
        Budget: $${params.budget || 50}/day
        Target ROAS: ${params.targetRoas || 4.0}
        Products: ${params.products?.join(', ') || 'All products'}`,
      
      get_recommendations: `Provide strategic recommendations for our store:
        - Marketing opportunities
        - Product optimization
        - Pricing strategies
        - Growth tactics`,
      
      generate_content: `Generate ${params.contentType || 'marketing'} content for ${params.productId ? `product ${params.productId}` : 'our products'}.`,
      
      analyze_competitors: `Based on our product catalog and pricing, suggest competitive positioning strategies.`
    };

    const prompt = taskPrompts[task];
    if (!prompt) {
      throw new Error(`Unknown task: ${task}`);
    }

    return await this.chat(prompt, { task, params });
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  async analyzeSalesData(params) {
    const orders = await this.pb.getOrders({ 
      status: 'shipped',
      days: params.period === 'week' ? 7 : params.period === 'month' ? 30 : 90
    });

    const orderItems = orders.items || [];
    
    switch (params.metric) {
      case 'top_sellers': {
        const skuCounts = {};
        orderItems.forEach(order => {
          (order.items || []).forEach(item => {
            if (!skuCounts[item.sku]) {
              skuCounts[item.sku] = { sku: item.sku, name: item.name, quantity: 0, revenue: 0 };
            }
            skuCounts[item.sku].quantity += item.quantity;
            skuCounts[item.sku].revenue += item.price * item.quantity;
          });
        });
        return Object.values(skuCounts)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 10);
      }

      case 'revenue': {
        const total = orderItems.reduce((sum, o) => sum + (o.total || 0), 0);
        const avgOrder = orderItems.length ? total / orderItems.length : 0;
        return { 
          totalRevenue: total, 
          orderCount: orderItems.length,
          averageOrderValue: avgOrder
        };
      }

      case 'by_category': {
        const categories = {};
        orderItems.forEach(order => {
          (order.items || []).forEach(item => {
            const cat = item.category || 'Other';
            if (!categories[cat]) categories[cat] = { revenue: 0, units: 0 };
            categories[cat].revenue += item.price * item.quantity;
            categories[cat].units += item.quantity;
          });
        });
        return categories;
      }

      case 'customer_stats': {
        const customers = {};
        orderItems.forEach(order => {
          const email = order.customerEmail;
          if (!customers[email]) {
            customers[email] = { email, orders: 0, totalSpent: 0 };
          }
          customers[email].orders++;
          customers[email].totalSpent += order.total || 0;
        });
        return {
          totalCustomers: Object.keys(customers).length,
          repeatCustomers: Object.values(customers).filter(c => c.orders > 1).length,
          topCustomers: Object.values(customers)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 10)
        };
      }

      default:
        return { orders: orderItems.length };
    }
  }

  async generateContent(params) {
    const product = await this.pb.getProduct(params.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const prompt = `Generate ${params.contentType} content for this product:
    Name: ${product.name}
    SKU: ${product.sku}
    Price: $${product.price}
    Description: ${product.shortDescription || product.description?.substring(0, 500)}
    Category: ${product.category}
    
    Tone: ${params.tone || 'professional'}
    
    Remember: No medical claims. Use "may support" or "helps maintain" for health benefits.`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    return {
      product: product.name,
      contentType: params.contentType,
      content: response.content[0].text
    };
  }

  async getInventoryAlerts(threshold) {
    const products = await this.pb.getProducts({
      filter: `stock < ${threshold} || inStock = false`
    });

    return {
      lowStock: products.items?.filter(p => p.stock > 0 && p.stock < threshold) || [],
      outOfStock: products.items?.filter(p => p.stock === 0 || !p.inStock) || [],
      threshold
    };
  }

  async generateAdCopy(productId, style = 'professional') {
    const product = await this.pb.getProduct(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const prompt = `Generate Google Ads copy for this health supplement:
    
    Product: ${product.name}
    Price: $${product.price}
    Benefits: ${product.shortDescription}
    
    Generate in JSON format:
    {
      "headlines": ["15 headlines, max 30 chars each"],
      "descriptions": ["4 descriptions, max 90 chars each"],
      "callouts": ["4 callouts, max 25 chars each"]
    }
    
    Style: ${style}
    Remember: No medical claims.`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    try {
      // Extract JSON from response
      const text = response.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Return raw text if JSON parsing fails
    }

    return { raw: response.content[0].text };
  }

  async getDashboardSummary() {
    const [products, orders, campaigns] = await Promise.all([
      this.pb.getProducts({ limit: 1000 }),
      this.pb.getOrders({ days: 30 }),
      this.googleAds.getCampaigns('LAST_30_DAYS').catch(() => ({ campaigns: [] }))
    ]);

    const revenue = (orders.items || [])
      .filter(o => ['shipped', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      products: {
        total: products.totalItems || 0,
        inStock: products.items?.filter(p => p.inStock).length || 0,
        lowStock: products.items?.filter(p => p.stock > 0 && p.stock < 10).length || 0
      },
      orders: {
        total: orders.totalItems || 0,
        pending: orders.items?.filter(o => o.status === 'pending').length || 0,
        shipped: orders.items?.filter(o => o.status === 'shipped').length || 0
      },
      revenue: {
        last30Days: revenue,
        averageOrder: orders.totalItems ? revenue / orders.totalItems : 0
      },
      ads: {
        activeCampaigns: campaigns.campaigns?.filter(c => c.status === 'ENABLED').length || 0,
        totalSpend: campaigns.campaigns?.reduce((sum, c) => sum + (c.cost || 0), 0) || 0
      }
    };
  }

  async getStatus() {
    return {
      model: this.model,
      status: 'active',
      capabilities: [
        'Product Management',
        'Sales Analysis',
        'Google Ads Management',
        'Content Generation',
        'Inventory Alerts',
        'Automation Tasks'
      ],
      tools: this.getTools().map(t => ({ name: t.name, description: t.description }))
    };
  }

  async runAutomationTask(taskId) {
    const task = await this.pb.getAutomationTask(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const result = await this.executeTask(task.type, task.config);
    
    await this.pb.updateAutomationTask(taskId, {
      lastRun: new Date().toISOString(),
      lastResult: result
    });

    return result;
  }

  async analyzeProducts() {
    return this.executeTask('optimize_products');
  }

  async getProductRecommendations() {
    return this.executeTask('get_recommendations');
  }

  async analyzeSales(period) {
    return this.executeTask('analyze_sales', { period });
  }

  async getOrderInsights() {
    return this.chat('Provide insights on recent orders: fulfillment status, common issues, and recommendations.');
  }
}
