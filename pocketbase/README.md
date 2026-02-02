# PocketBase Backend

This is the PocketBase backend for Success Chemistry.

## What is PocketBase?

[PocketBase](https://pocketbase.io) is an open-source backend in a single file:
- **Embedded SQLite database** with realtime subscriptions
- **Built-in auth** (email/password, OAuth2)
- **File storage** (images, documents)
- **Admin UI** at `/admin`
- **REST API** automatically generated
- **No infrastructure needed** - just one binary

## Quick Start

### 1. Download PocketBase

**macOS (Apple Silicon):**
```bash
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.36.2/pocketbase_0.36.2_darwin_arm64.zip -o pocketbase.zip
unzip pocketbase.zip
chmod +x pocketbase
```

**macOS (Intel):**
```bash
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.36.2/pocketbase_0.36.2_darwin_amd64.zip -o pocketbase.zip
unzip pocketbase.zip
chmod +x pocketbase
```

**Linux:**
```bash
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.36.2/pocketbase_0.36.2_linux_amd64.zip -o pocketbase.zip
unzip pocketbase.zip
chmod +x pocketbase
```

### 2. Start PocketBase

```bash
./pocketbase serve
```

This starts:
- **API**: http://localhost:8090
- **Admin UI**: http://localhost:8090/_/

### 3. Create Admin Account

1. Open http://localhost:8090/_/
2. Create your first admin account
3. You're ready to go!

## Collections (Database Tables)

PocketBase uses "collections" (like database tables). You'll create these in the Admin UI:

### Products Collection

Fields:
- `name` (text)
- `slug` (text, unique)
- `sku` (text, unique)
- `price` (number)
- `description` (text, rich editor)
- `images` (file, multiple)
- `category` (text)
- `inStock` (boolean)

### Orders Collection

Fields:
- `orderNumber` (text, unique)
- `customer` (relation to users)
- `items` (JSON)
- `total` (number)
- `status` (select: pending, paid, shipped, delivered)
- `shippingAddress` (JSON)

### Cart Collection (optional)

Fields:
- `user` (relation to users)
- `items` (JSON)
- `updatedAt` (date)

## API Usage

PocketBase auto-generates REST API:

### Get all products
```
GET http://localhost:8090/api/collections/products/records
```

### Get single product
```
GET http://localhost:8090/api/collections/products/records/:id
```

### Create order
```
POST http://localhost:8090/api/collections/orders/records
Content-Type: application/json

{
  "orderNumber": "SC-001",
  "items": [...],
  "total": 99.99,
  "status": "pending"
}
```

## JavaScript SDK

Install in your frontend:

```bash
npm install pocketbase
```

Use in your code:

```javascript
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

// Get products
const products = await pb.collection('products').getFullList();

// Create order
const order = await pb.collection('orders').create({
  orderNumber: 'SC-001',
  items: cartItems,
  total: 99.99,
  status: 'pending'
});

// Auth
await pb.collection('users').authWithPassword('user@example.com', 'password');
```

## Deployment

### Option 1: Fly.io (Free tier)

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Create `fly.toml`:

```toml
app = "success-chemistry-pb"

[build]
  image = "ghcr.io/pocketbase/pocketbase:latest"

[http_service]
  internal_port = 8090
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true

[[mounts]]
  source = "pb_data"
  destination = "/pb/pb_data"
```

3. Deploy: `fly launch` then `fly deploy`

### Option 2: Railway (Free tier)

1. Create new project on Railway
2. Add "Deploy from GitHub repo"
3. Add Dockerfile:

```dockerfile
FROM alpine:latest
RUN apk add --no-cache ca-certificates unzip wget
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.36.2/pocketbase_0.36.2_linux_amd64.zip \
    && unzip pocketbase_0.36.2_linux_amd64.zip \
    && chmod +x pocketbase
EXPOSE 8090
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]
```

4. Deploy!

### Option 3: VPS (DigitalOcean, Linode, etc.)

1. Upload `pocketbase` binary
2. Create systemd service:

```ini
[Unit]
Description=PocketBase

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/pocketbase
ExecStart=/var/www/pocketbase/pocketbase serve --http=0.0.0.0:8090
Restart=always

[Install]
WantedBy=multi-user.target
```

3. Start: `sudo systemctl start pocketbase`

## Production Setup (Fly.io)

After deploying, set these in **Admin UI** at https://success-chemistry-pb.fly.dev/_/:

1. **Admin > Settings > Application**
   - **Site URL**: `https://success-chemistry-pb.fly.dev` (for email links, password reset, etc.)
   - **Rate limiter**: Enable to prevent abuse

2. **Admin > Settings > Mail** (optional)
   - Configure SMTP for password reset emails

3. **CORS** defaults to `*` (allows all). Your frontend (successchemistry.com) can call the API. To restrict later, configure in Admin UI if available.

## Environment Variables

Create `.env` file for local:

```bash
# Admin email (optional, for automated setup)
PB_ADMIN_EMAIL=admin@successchemistry.com
PB_ADMIN_PASSWORD=your-secure-password

# CORS origins (comma-separated) - for local dev
PB_ORIGINS="http://localhost:3000,http://localhost:8080"
```

## Backup

PocketBase stores everything in `pb_data/` folder:

```bash
# Backup
tar -czf backup-$(date +%Y%m%d).tar.gz pb_data/

# Restore
tar -xzf backup-20260202.tar.gz
```

## Next Steps

1. **Download PocketBase** (see Quick Start above)
2. **Start it**: `./pocketbase serve`
3. **Open Admin UI**: http://localhost:8090/_/
4. **Create collections** (products, orders)
5. **Import your product data** (via Admin UI or API)
6. **Update frontend** to use PocketBase API

## Resources

- **Official docs**: https://pocketbase.io/docs/
- **JavaScript SDK**: https://github.com/pocketbase/js-sdk
- **GitHub**: https://github.com/pocketbase/pocketbase
- **Community**: https://github.com/pocketbase/pocketbase/discussions
