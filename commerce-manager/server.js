import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { CommerceAgent } from './agent.js';
import { GoogleAdsManager } from './google-ads.js';
import { PocketBaseClient } from './pocketbase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8090',
    'https://success-chemistry-pb.fly.dev',
    process.env.ALLOWED_ORIGINS?.split(',') || []
  ].flat()
}));
app.use(express.json());

// Initialize services
const pb = new PocketBaseClient();
const googleAds = new GoogleAdsManager();
const agent = new CommerceAgent(pb, googleAds);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'commerce-manager',
    version: '1.0.0',
    model: 'claude-3-5-sonnet-20241022'
  });
});

// ============================================
// AI AGENT ENDPOINTS
// ============================================

// Chat with the Commerce Manager AI
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { message, context, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await agent.chat(message, context, sessionId);
    res.json(response);
  } catch (error) {
    console.error('Agent chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute a specific agent task
app.post('/api/agent/task', async (req, res) => {
  try {
    const { task, params } = req.body;
    
    const validTasks = [
      'analyze_sales',
      'optimize_products', 
      'generate_ads',
      'review_inventory',
      'create_campaign',
      'get_recommendations',
      'generate_content',
      'analyze_competitors'
    ];

    if (!validTasks.includes(task)) {
      return res.status(400).json({ 
        error: 'Invalid task',
        validTasks 
      });
    }

    const result = await agent.executeTask(task, params);
    res.json(result);
  } catch (error) {
    console.error('Agent task error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get agent status and capabilities
app.get('/api/agent/status', async (req, res) => {
  try {
    const status = await agent.getStatus();
    const memoryStats = agent.memory.getStats();
    res.json({ ...status, memory: memoryStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh knowledge base
app.post('/api/agent/refresh', async (req, res) => {
  try {
    const kb = await agent.memory.refresh();
    res.json({ 
      success: true, 
      products: kb.products?.length || 0,
      orders: kb.orders?.length || 0,
      lastUpdate: kb.lastUpdate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get learned insights
app.get('/api/agent/insights', async (req, res) => {
  try {
    const { type } = req.query;
    const insights = await agent.memory.getInsights(type);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GOOGLE ADS ENDPOINTS
// ============================================

// Get campaign performance
app.get('/api/ads/campaigns', async (req, res) => {
  try {
    const { dateRange } = req.query;
    const campaigns = await googleAds.getCampaigns(dateRange);
    res.json(campaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new campaign
app.post('/api/ads/campaigns', async (req, res) => {
  try {
    const { name, budget, targetRoas, products } = req.body;
    const campaign = await googleAds.createCampaign({ name, budget, targetRoas, products });
    res.json(campaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update campaign
app.patch('/api/ads/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const campaign = await googleAds.updateCampaign(id, updates);
    res.json(campaign);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get ad performance metrics
app.get('/api/ads/metrics', async (req, res) => {
  try {
    const { campaignId, dateRange } = req.query;
    const metrics = await googleAds.getMetrics(campaignId, dateRange);
    res.json(metrics);
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate ad copy with AI
app.post('/api/ads/generate-copy', async (req, res) => {
  try {
    const { productId, style } = req.body;
    const copy = await agent.generateAdCopy(productId, style);
    res.json(copy);
  } catch (error) {
    console.error('Generate ad copy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PRODUCTS & INVENTORY ENDPOINTS
// ============================================

// Get products with AI analysis
app.get('/api/products/analysis', async (req, res) => {
  try {
    const analysis = await agent.analyzeProducts();
    res.json(analysis);
  } catch (error) {
    console.error('Product analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get product recommendations
app.get('/api/products/recommendations', async (req, res) => {
  try {
    const recommendations = await agent.getProductRecommendations();
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ORDERS & SALES ENDPOINTS
// ============================================

// Get sales analysis
app.get('/api/sales/analysis', async (req, res) => {
  try {
    const { period } = req.query;
    const analysis = await agent.analyzeSales(period);
    res.json(analysis);
  } catch (error) {
    console.error('Sales analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order insights
app.get('/api/orders/insights', async (req, res) => {
  try {
    const insights = await agent.getOrderInsights();
    res.json(insights);
  } catch (error) {
    console.error('Order insights error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// AUTOMATION & SCHEDULING
// ============================================

// Get scheduled tasks
app.get('/api/automation/tasks', async (req, res) => {
  try {
    const tasks = await pb.getAutomationTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create automation task
app.post('/api/automation/tasks', async (req, res) => {
  try {
    const { name, type, schedule, config } = req.body;
    const task = await pb.createAutomationTask({ name, type, schedule, config });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run automation task manually
app.post('/api/automation/tasks/:id/run', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await agent.runAutomationTask(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DASHBOARD API (for PocketBase UI)
// ============================================

// Get dashboard summary
app.get('/api/dashboard', async (req, res) => {
  try {
    const summary = await agent.getDashboardSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity log
app.get('/api/activity', async (req, res) => {
  try {
    const { limit } = req.query;
    const activity = await pb.getActivityLog(parseInt(limit) || 50);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🤖 Commerce Manager AI Agent                            ║
║   ─────────────────────────────────────────────────────   ║
║   Model: Claude 3.5 Sonnet                                ║
║   Port: ${PORT}                                              ║
║   Status: Running                                         ║
║                                                           ║
║   Endpoints:                                              ║
║   • POST /api/agent/chat     - Chat with AI               ║
║   • POST /api/agent/task     - Execute tasks              ║
║   • GET  /api/ads/campaigns  - Google Ads campaigns       ║
║   • GET  /api/dashboard      - Dashboard summary          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
