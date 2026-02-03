# PocketBase Collections for Commerce Manager

Create these collections in PocketBase Admin UI for full agent memory functionality.

## 1. `knowledge_base`

Stores cached product/order insights for fast context building.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `products` | Number | No | Product count |
| `orders` | Number | No | Order count |
| `insights` | JSON | No | Calculated insights object |
| `lastUpdate` | Date | No | Last refresh timestamp |

**API Rules:**
- List: Allow all (agent needs read access)
- View: Allow all
- Create: Admins only
- Update: Admins only
- Delete: Admins only

---

## 2. `agent_conversations`

Stores conversation history by session for continuity.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `sessionId` | Text | Yes | Unique session identifier |
| `messages` | JSON | Yes | Array of Claude messages |
| `lastActivity` | Date | No | Last message timestamp |

**Indexes:**
- `sessionId` (unique)

**API Rules:**
- List: Admins only
- View: Admins only
- Create: Admins only
- Update: Admins only
- Delete: Admins only

---

## 3. `agent_insights`

Stores learned insights and patterns discovered by the agent.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | Select | Yes | Options: product, sales, customer, marketing, inventory |
| `content` | Text | Yes | The insight text |
| `confidence` | Number | No | 0.0 - 1.0 confidence score |
| `source` | Text | No | Where insight came from |

**API Rules:**
- List: Allow all
- View: Allow all
- Create: Admins only
- Update: Admins only
- Delete: Admins only

---

## 4. `automation_tasks`

Scheduled tasks for the agent to run automatically.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | Text | Yes | Task name |
| `type` | Select | Yes | Options: analyze_sales, optimize_products, generate_ads, review_inventory, sync_campaigns |
| `schedule` | Text | No | Cron format (e.g., "0 9 * * *") |
| `config` | JSON | No | Task-specific configuration |
| `status` | Select | Yes | Options: active, paused, completed, failed |
| `lastRun` | Date | No | Last execution time |
| `lastResult` | JSON | No | Result from last run |

**API Rules:**
- List: Allow all
- View: Allow all
- Create: Admins only
- Update: Admins only
- Delete: Admins only

---

## 5. `activity_log`

Logs all actions taken by the agent.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | Text | Yes | Action description |
| `details` | JSON | No | Additional details |
| `status` | Select | Yes | Options: success, warning, error |
| `agent` | Text | No | Which agent (default: commerce-manager) |

**API Rules:**
- List: Allow all
- View: Allow all
- Create: Admins only
- Update: Admins only
- Delete: Admins only

---

## 6. `ad_campaigns` (cache)

Cached Google Ads campaign data for dashboard display.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `campaignId` | Text | Yes | Google Ads campaign ID |
| `name` | Text | Yes | Campaign name |
| `status` | Select | Yes | Options: ENABLED, PAUSED, REMOVED |
| `type` | Text | No | Campaign type |
| `dailyBudget` | Number | No | Daily budget in USD |
| `impressions` | Number | No | Total impressions |
| `clicks` | Number | No | Total clicks |
| `cost` | Number | No | Total cost |
| `conversions` | Number | No | Total conversions |
| `revenue` | Number | No | Total revenue |
| `roas` | Number | No | Return on ad spend |
| `lastSync` | Date | No | Last sync timestamp |

**Indexes:**
- `campaignId` (unique)

**API Rules:**
- List: Allow all
- View: Allow all
- Create: Admins only
- Update: Admins only
- Delete: Admins only

---

## 7. `agent_config`

Agent configuration and settings.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `settings` | JSON | No | General settings |
| `googleAdsEnabled` | Bool | No | Enable Google Ads integration |
| `automationEnabled` | Bool | No | Enable automation tasks |
| `refreshInterval` | Number | No | Knowledge base refresh interval (minutes) |
| `maxTokensPerDay` | Number | No | Daily token limit |
| `allowedTools` | JSON | No | Array of enabled tools |

**API Rules:**
- List: Allow all
- View: Allow all
- Create: Admins only
- Update: Admins only
- Delete: Admins only

---

## Quick Setup Script

Run this in PocketBase Admin UI Console (or via API):

```javascript
// Create collections programmatically
const collections = [
  {
    name: 'knowledge_base',
    type: 'base',
    schema: [
      { name: 'products', type: 'number' },
      { name: 'orders', type: 'number' },
      { name: 'insights', type: 'json' },
      { name: 'lastUpdate', type: 'date' }
    ]
  },
  {
    name: 'agent_conversations',
    type: 'base',
    schema: [
      { name: 'sessionId', type: 'text', required: true, unique: true },
      { name: 'messages', type: 'json', required: true },
      { name: 'lastActivity', type: 'date' }
    ]
  },
  {
    name: 'agent_insights',
    type: 'base',
    schema: [
      { name: 'type', type: 'select', required: true, options: ['product', 'sales', 'customer', 'marketing', 'inventory'] },
      { name: 'content', type: 'text', required: true },
      { name: 'confidence', type: 'number' },
      { name: 'source', type: 'text' }
    ]
  },
  {
    name: 'automation_tasks',
    type: 'base',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'type', type: 'select', required: true, options: ['analyze_sales', 'optimize_products', 'generate_ads', 'review_inventory', 'sync_campaigns'] },
      { name: 'schedule', type: 'text' },
      { name: 'config', type: 'json' },
      { name: 'status', type: 'select', required: true, options: ['active', 'paused', 'completed', 'failed'] },
      { name: 'lastRun', type: 'date' },
      { name: 'lastResult', type: 'json' }
    ]
  },
  {
    name: 'activity_log',
    type: 'base',
    schema: [
      { name: 'action', type: 'text', required: true },
      { name: 'details', type: 'json' },
      { name: 'status', type: 'select', required: true, options: ['success', 'warning', 'error'] },
      { name: 'agent', type: 'text' }
    ]
  },
  {
    name: 'ad_campaigns',
    type: 'base',
    schema: [
      { name: 'campaignId', type: 'text', required: true, unique: true },
      { name: 'name', type: 'text', required: true },
      { name: 'status', type: 'select', required: true, options: ['ENABLED', 'PAUSED', 'REMOVED'] },
      { name: 'type', type: 'text' },
      { name: 'dailyBudget', type: 'number' },
      { name: 'impressions', type: 'number' },
      { name: 'clicks', type: 'number' },
      { name: 'cost', type: 'number' },
      { name: 'conversions', type: 'number' },
      { name: 'revenue', type: 'number' },
      { name: 'roas', type: 'number' },
      { name: 'lastSync', type: 'date' }
    ]
  },
  {
    name: 'agent_config',
    type: 'base',
    schema: [
      { name: 'settings', type: 'json' },
      { name: 'googleAdsEnabled', type: 'bool' },
      { name: 'automationEnabled', type: 'bool' },
      { name: 'refreshInterval', type: 'number' },
      { name: 'maxTokensPerDay', type: 'number' },
      { name: 'allowedTools', type: 'json' }
    ]
  }
];

// Note: Create these manually in Admin UI for now
// PocketBase doesn't support programmatic collection creation via JS SDK
```

---

## Manual Setup Steps

1. **Login to PocketBase Admin**: http://localhost:8090/_/
2. **Go to Collections** (left sidebar)
3. **For each collection above**:
   - Click "New collection"
   - Enter name
   - Add fields as specified
   - Set API rules
   - Save

---

## Verification

After creating collections, test with:

```bash
# Start Commerce Manager
cd commerce-manager
npm run dev

# Test knowledge base
curl http://localhost:3002/api/agent/status

# Should show:
# {
#   "memory": {
#     "productsLoaded": 50,
#     "ordersLoaded": 120,
#     "lastUpdate": "2026-02-03T...",
#     "cacheAge": 30
#   }
# }
```
