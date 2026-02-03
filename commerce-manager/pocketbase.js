import PocketBase from 'pocketbase';

export class PocketBaseClient {
  constructor() {
    this.pb = new PocketBase(process.env.PB_URL || 'http://localhost:8090');
    this.isAuthed = false;
  }

  async auth() {
    if (this.isAuthed) return;
    
    try {
      await this.pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL,
        process.env.PB_ADMIN_PASSWORD
      );
      this.isAuthed = true;
      console.log('✅ PocketBase authenticated');
    } catch (error) {
      console.error('❌ PocketBase auth error:', error.message);
      throw error;
    }
  }

  // ============================================
  // PRODUCTS
  // ============================================

  async getProducts(options = {}) {
    await this.auth();
    
    const { filter, limit = 50, sort = '-created' } = options;
    
    try {
      return await this.pb.collection('products').getList(1, limit, {
        filter,
        sort
      });
    } catch (error) {
      console.error('Get products error:', error);
      return { items: [], totalItems: 0 };
    }
  }

  async getProduct(id) {
    await this.auth();
    
    try {
      return await this.pb.collection('products').getOne(id);
    } catch (error) {
      // Try by SKU if ID fails
      try {
        const result = await this.pb.collection('products').getList(1, 1, {
          filter: `sku = "${id}"`
        });
        return result.items[0] || null;
      } catch (e) {
        return null;
      }
    }
  }

  async updateProduct(id, updates) {
    await this.auth();
    return await this.pb.collection('products').update(id, updates);
  }

  async createProduct(data) {
    await this.auth();
    return await this.pb.collection('products').create(data);
  }

  // ============================================
  // ORDERS
  // ============================================

  async getOrders(options = {}) {
    await this.auth();
    
    const { status, days, limit = 100 } = options;
    const filters = [];
    
    if (status) {
      filters.push(`status = "${status}"`);
    }
    
    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - days);
      filters.push(`created >= "${date.toISOString()}"`);
    }
    
    try {
      return await this.pb.collection('orders').getList(1, limit, {
        filter: filters.length ? filters.join(' && ') : undefined,
        sort: '-created'
      });
    } catch (error) {
      console.error('Get orders error:', error);
      return { items: [], totalItems: 0 };
    }
  }

  async getOrder(id) {
    await this.auth();
    return await this.pb.collection('orders').getOne(id);
  }

  async updateOrder(id, updates) {
    await this.auth();
    return await this.pb.collection('orders').update(id, updates);
  }

  // ============================================
  // CUSTOMERS
  // ============================================

  async getCustomers(options = {}) {
    await this.auth();
    
    const { limit = 100, sort = '-created' } = options;
    
    try {
      return await this.pb.collection('customers').getList(1, limit, { sort });
    } catch (error) {
      console.error('Get customers error:', error);
      return { items: [], totalItems: 0 };
    }
  }

  async getCustomerByEmail(email) {
    await this.auth();
    
    try {
      const result = await this.pb.collection('customers').getList(1, 1, {
        filter: `email = "${email}"`
      });
      return result.items[0] || null;
    } catch (error) {
      return null;
    }
  }

  // ============================================
  // AUTOMATION TASKS
  // ============================================

  async getAutomationTasks() {
    await this.auth();
    
    try {
      return await this.pb.collection('automation_tasks').getFullList({
        sort: '-created'
      });
    } catch (error) {
      // Collection might not exist yet
      console.log('Automation tasks collection not found, returning empty');
      return [];
    }
  }

  async getAutomationTask(id) {
    await this.auth();
    return await this.pb.collection('automation_tasks').getOne(id);
  }

  async createAutomationTask(data) {
    await this.auth();
    return await this.pb.collection('automation_tasks').create({
      ...data,
      status: 'active',
      created: new Date().toISOString()
    });
  }

  async updateAutomationTask(id, updates) {
    await this.auth();
    return await this.pb.collection('automation_tasks').update(id, updates);
  }

  // ============================================
  // ACTIVITY LOG
  // ============================================

  async getActivityLog(limit = 50) {
    await this.auth();
    
    try {
      return await this.pb.collection('activity_log').getList(1, limit, {
        sort: '-created'
      });
    } catch (error) {
      // Collection might not exist
      return { items: [] };
    }
  }

  async logActivity(data) {
    await this.auth();
    
    try {
      return await this.pb.collection('activity_log').create({
        action: data.action,
        details: data.details || {},
        status: data.status || 'success',
        agent: 'commerce-manager',
        created: new Date().toISOString()
      });
    } catch (error) {
      // Log to console if collection doesn't exist
      console.log('Activity:', data.action, data.details);
      return { logged: true, console: true };
    }
  }

  // ============================================
  // AI AGENT CONFIG
  // ============================================

  async getAgentConfig() {
    await this.auth();
    
    try {
      const configs = await this.pb.collection('agent_config').getFullList();
      return configs[0] || null;
    } catch (error) {
      return null;
    }
  }

  async updateAgentConfig(config) {
    await this.auth();
    
    const existing = await this.getAgentConfig();
    
    if (existing) {
      return await this.pb.collection('agent_config').update(existing.id, config);
    } else {
      return await this.pb.collection('agent_config').create(config);
    }
  }

  // ============================================
  // AD CAMPAIGNS CACHE
  // ============================================

  async cacheAdCampaigns(campaigns) {
    await this.auth();
    
    try {
      // Store campaign data in PocketBase for dashboard display
      for (const campaign of campaigns) {
        const existing = await this.pb.collection('ad_campaigns').getList(1, 1, {
          filter: `campaignId = "${campaign.id}"`
        });

        if (existing.items.length > 0) {
          await this.pb.collection('ad_campaigns').update(existing.items[0].id, {
            ...campaign,
            lastSync: new Date().toISOString()
          });
        } else {
          await this.pb.collection('ad_campaigns').create({
            campaignId: campaign.id,
            ...campaign,
            lastSync: new Date().toISOString()
          });
        }
      }
      return { synced: campaigns.length };
    } catch (error) {
      console.log('Ad campaigns collection not configured');
      return { synced: 0, error: error.message };
    }
  }

  async getCachedCampaigns() {
    await this.auth();
    
    try {
      return await this.pb.collection('ad_campaigns').getFullList({
        sort: '-lastSync'
      });
    } catch (error) {
      return [];
    }
  }
}
