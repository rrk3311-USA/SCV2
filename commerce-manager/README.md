# 🤖 Commerce Manager AI Agent

AI-powered commerce management agent for Success Chemistry, built with Claude 3.5 Sonnet.

## Features

- **Product Management**: Monitor inventory, update prices, optimize descriptions
- **Sales Analysis**: Revenue trends, top sellers, customer insights
- **Google Ads**: Create campaigns, generate ad copy, track performance
- **Content Generation**: Product descriptions, ad headlines, social posts
- **Automation**: Scheduled tasks, automated workflows

## Quick Start

### 1. Install Dependencies

```bash
cd commerce-manager
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

Required keys:
- `ANTHROPIC_API_KEY` - Claude API key from [Anthropic Console](https://console.anthropic.com/)
- `PB_URL`, `PB_ADMIN_EMAIL`, `PB_ADMIN_PASSWORD` - PocketBase credentials
- Google Ads credentials (optional, will use mock data if not provided)

### 3. Run Locally

```bash
npm run dev
# Server starts at http://localhost:3002
```

### 4. Deploy to Fly.io

```bash
# First time
fly launch

# Set secrets
fly secrets set ANTHROPIC_API_KEY=sk-ant-...
fly secrets set PB_URL=https://success-chemistry-pb.fly.dev
fly secrets set PB_ADMIN_EMAIL=admin@example.com
fly secrets set PB_ADMIN_PASSWORD=your-password
fly secrets set GOOGLE_ADS_CLIENT_ID=...
fly secrets set GOOGLE_ADS_CLIENT_SECRET=...
fly secrets set GOOGLE_ADS_DEVELOPER_TOKEN=...
fly secrets set GOOGLE_ADS_CUSTOMER_ID=...
fly secrets set GOOGLE_ADS_REFRESH_TOKEN=...

# Deploy
fly deploy
```

## API Endpoints

### Chat with AI Agent

```bash
POST /api/agent/chat
{
  "message": "What are our top selling products?",
  "sessionId": "optional-session-id"
}
```

### Execute Specific Tasks

```bash
POST /api/agent/task
{
  "task": "analyze_sales",
  "params": { "period": "month" }
}
```

Available tasks:
- `analyze_sales` - Sales trends and insights
- `optimize_products` - Product optimization suggestions
- `generate_ads` - Generate Google Ads content
- `review_inventory` - Inventory alerts
- `create_campaign` - Create Google Ads campaign
- `get_recommendations` - Strategic recommendations
- `generate_content` - Marketing content
- `analyze_competitors` - Competitive analysis

### Google Ads

```bash
# Get campaigns
GET /api/ads/campaigns?dateRange=LAST_30_DAYS

# Create campaign
POST /api/ads/campaigns
{
  "name": "Summer Sale",
  "budget": 50,
  "targetRoas": 4.0
}

# Generate ad copy
POST /api/ads/generate-copy
{
  "productId": "abc123",
  "style": "professional"
}
```

### Dashboard

```bash
# Get summary
GET /api/dashboard

# Get activity log
GET /api/activity?limit=50
```

## Architecture

```
commerce-manager/
├── server.js        # Express API server
├── agent.js         # Claude AI agent with tools
├── google-ads.js    # Google Ads API integration
├── pocketbase.js    # PocketBase client
├── fly.toml         # Fly.io deployment config
├── Dockerfile       # Container config
└── .env.example     # Environment template
```

## AI Agent Tools

The agent has access to these tools:

| Tool | Description |
|------|-------------|
| `get_products` | Fetch products from database |
| `update_product` | Update product details |
| `get_orders` | Fetch orders with filters |
| `analyze_sales` | Analyze sales metrics |
| `get_google_ads_campaigns` | Get campaign performance |
| `create_google_ads_campaign` | Create new campaign |
| `update_google_ads_campaign` | Update campaign settings |
| `generate_content` | Generate marketing content |
| `get_inventory_alerts` | Check low stock items |
| `log_activity` | Log actions taken |

## PocketBase Collections

For full functionality, create these collections in PocketBase:

### `automation_tasks`
- `name` (text)
- `type` (select: analyze_sales, optimize_products, etc.)
- `schedule` (text, cron format)
- `config` (json)
- `status` (select: active, paused)
- `lastRun` (date)
- `lastResult` (json)

### `activity_log`
- `action` (text)
- `details` (json)
- `status` (select: success, warning, error)
- `agent` (text)

### `agent_config`
- `settings` (json)
- `googleAdsEnabled` (bool)
- `automationEnabled` (bool)

### `ad_campaigns` (cache)
- `campaignId` (text)
- `name` (text)
- `status` (text)
- `dailyBudget` (number)
- `impressions` (number)
- `clicks` (number)
- `cost` (number)
- `conversions` (number)
- `revenue` (number)
- `roas` (number)
- `lastSync` (date)

## Example Conversations

### Analyze Sales
```
User: "How are sales this month?"
Agent: Uses analyze_sales tool, returns:
- Total revenue: $12,450
- Orders: 156
- Top seller: Liver Cleanse (45 units)
- Recommendation: Bundle promotions performing well
```

### Generate Ads
```
User: "Create ad copy for our Liver Cleanse product"
Agent: Uses generate_content tool, returns:
- 15 headlines (max 30 chars)
- 4 descriptions (max 90 chars)
- Suggested keywords
```

### Create Campaign
```
User: "Create a new Google Ads campaign for summer with $75/day budget"
Agent: Uses create_google_ads_campaign tool, creates:
- Performance Max campaign
- $75/day budget
- Target ROAS: 4.0
- Status: PAUSED (for review)
```

## Security

- **API Keys**: Store in environment variables, never commit
- **Admin Auth**: Uses PocketBase admin authentication
- **CORS**: Configured for specific origins only
- **HTTPS**: Enforced in production (Fly.io)

## Monitoring

```bash
# View logs
fly logs

# Check status
fly status

# Scale up
fly scale count 2
```

## Related Documentation

- [PocketBase README](../pocketbase/README.md)
- [Scripts Library](../pocketbase/SCRIPTS_LIBRARY.md)
- [Google Ads Setup](../GOOGLE_ADS_SETUP.md)
