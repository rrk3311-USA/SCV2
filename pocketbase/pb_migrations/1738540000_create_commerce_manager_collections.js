// Commerce Manager Collections Migration
// Creates collections for AI agent, automation, and ad campaigns

migrate((db) => {
  // ============================================
  // AUTOMATION TASKS
  // ============================================
  const automationTasks = new Collection({
    name: 'automation_tasks',
    type: 'base',
    schema: [
      { name: 'name', type: 'text', required: true },
      { 
        name: 'type', 
        type: 'select',
        required: true,
        options: {
          values: [
            'analyze_sales',
            'optimize_products',
            'generate_ads',
            'review_inventory',
            'sync_campaigns',
            'generate_content',
            'send_alerts'
          ]
        }
      },
      { name: 'schedule', type: 'text' }, // cron format
      { name: 'config', type: 'json' },
      { 
        name: 'status', 
        type: 'select',
        options: { values: ['active', 'paused', 'error'] }
      },
      { name: 'lastRun', type: 'date' },
      { name: 'lastResult', type: 'json' },
      { name: 'nextRun', type: 'date' }
    ]
  });

  // ============================================
  // ACTIVITY LOG
  // ============================================
  const activityLog = new Collection({
    name: 'activity_log',
    type: 'base',
    schema: [
      { name: 'action', type: 'text', required: true },
      { name: 'details', type: 'json' },
      { 
        name: 'status', 
        type: 'select',
        options: { values: ['success', 'warning', 'error', 'info'] }
      },
      { name: 'agent', type: 'text' },
      { name: 'userId', type: 'text' },
      { name: 'duration', type: 'number' }
    ]
  });

  // ============================================
  // AGENT CONFIG
  // ============================================
  const agentConfig = new Collection({
    name: 'agent_config',
    type: 'base',
    schema: [
      { name: 'settings', type: 'json' },
      { name: 'googleAdsEnabled', type: 'bool' },
      { name: 'automationEnabled', type: 'bool' },
      { name: 'model', type: 'text' }, // claude-3-5-sonnet-20241022
      { name: 'maxTokens', type: 'number' },
      { name: 'temperature', type: 'number' }
    ]
  });

  // ============================================
  // AD CAMPAIGNS (cached from Google Ads)
  // ============================================
  const adCampaigns = new Collection({
    name: 'ad_campaigns',
    type: 'base',
    schema: [
      { name: 'campaignId', type: 'text', required: true },
      { name: 'name', type: 'text', required: true },
      { 
        name: 'status', 
        type: 'select',
        options: { values: ['ENABLED', 'PAUSED', 'REMOVED'] }
      },
      { name: 'type', type: 'text' },
      { name: 'dailyBudget', type: 'number' },
      { name: 'targetRoas', type: 'number' },
      { name: 'impressions', type: 'number' },
      { name: 'clicks', type: 'number' },
      { name: 'cost', type: 'number' },
      { name: 'conversions', type: 'number' },
      { name: 'revenue', type: 'number' },
      { name: 'roas', type: 'number' },
      { name: 'lastSync', type: 'date' }
    ]
  });

  // ============================================
  // AI CHAT SESSIONS
  // ============================================
  const chatSessions = new Collection({
    name: 'chat_sessions',
    type: 'base',
    schema: [
      { name: 'sessionId', type: 'text', required: true },
      { name: 'userId', type: 'text' },
      { name: 'messages', type: 'json' },
      { name: 'context', type: 'json' },
      { name: 'lastActivity', type: 'date' }
    ]
  });

  // ============================================
  // GENERATED CONTENT
  // ============================================
  const generatedContent = new Collection({
    name: 'generated_content',
    type: 'base',
    schema: [
      { name: 'productId', type: 'text' },
      { 
        name: 'contentType', 
        type: 'select',
        options: { 
          values: ['description', 'ad_headlines', 'ad_descriptions', 'social_post', 'email', 'blog'] 
        }
      },
      { name: 'content', type: 'text' },
      { name: 'approved', type: 'bool' },
      { name: 'appliedAt', type: 'date' }
    ]
  });

  // Create collections
  return [
    automationTasks,
    activityLog,
    agentConfig,
    adCampaigns,
    chatSessions,
    generatedContent
  ].map(collection => db.save(collection));

}, (db) => {
  // Rollback
  const collections = [
    'automation_tasks',
    'activity_log', 
    'agent_config',
    'ad_campaigns',
    'chat_sessions',
    'generated_content'
  ];
  
  collections.forEach(name => {
    const collection = db.findCollectionByNameOrId(name);
    if (collection) {
      db.delete(collection);
    }
  });
});
