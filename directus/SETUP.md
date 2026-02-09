# Directus Backend Setup Guide

Complete setup guide for the SCV2 Directus backend.

## Prerequisites

- Docker Desktop installed and running
- At least 4GB free RAM
- Port 8055 available

## Initial Setup

### Step 1: Start Directus

```bash
cd directus
make start
```

Or using docker-compose directly:

```bash
docker-compose up -d
```

Wait 30-60 seconds for services to start.

### Step 2: Access Admin Panel

Open http://localhost:8055 in your browser.

**Default credentials:**
- Email: `admin@example.com`
- Password: `admin`

### Step 3: Change Admin Password

⚠️ **CRITICAL: Do this immediately!**

1. Click your user icon (top right)
2. Go to "Account Settings"
3. Change your password
4. Update email address if needed

### Step 4: Import Schema

The schema defines all collections (products, categories, orders, etc.).

**Option A: Using Directus CLI (Recommended)**

```bash
# Install Directus CLI globally
npm install -g @directus/cli

# Apply schema
directus schema apply ./schema/init-schema.json --yes
```

**Option B: Manual Setup via Admin UI**

If you prefer to create collections manually:

1. Go to Settings → Data Model
2. Create collections as defined in `schema/init-schema.json`
3. Add fields to each collection
4. Set up relationships

(This is time-consuming - CLI method is recommended)

### Step 5: Import Sample Data

Get your API token:

1. In Directus admin, click your user icon
2. Go to "Account Settings" → "API Tokens"
3. Click "Create Token"
4. Name it "Import Script" with Admin permissions
5. Copy the token

Import categories and sample products:

```bash
make import TOKEN=your_token_here
```

Or using Node directly:

```bash
DIRECTUS_TOKEN=your_token node scripts/import-products.js
```

### Step 6: Upload Product Images

1. Go to Content → Products
2. Click on a product
3. In the "Image" field, upload the product image
4. Save

For bulk import, see "Advanced: Bulk Image Upload" below.

### Step 7: Configure Frontend Integration

Add to your Next.js `.env.local`:

```bash
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_API_TOKEN=your_api_token_here
```

### Step 8: Test API

Test the REST API:

```bash
# Get all products
curl http://localhost:8055/items/products

# Get published products only
curl "http://localhost:8055/items/products?filter[status][_eq]=published"

# Get categories
curl http://localhost:8055/items/categories
```

Test GraphQL API at http://localhost:8055/graphql/system

## Production Deployment

### Option 1: Railway

1. **Create Railway account**: https://railway.app

2. **Install Railway CLI**:
```bash
npm install -g @railway/cli
railway login
```

3. **Initialize project**:
```bash
railway init
```

4. **Add PostgreSQL**:
```bash
railway add postgres
```

5. **Deploy Directus**:

Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npx directus start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Create `Dockerfile`:
```dockerfile
FROM directus/directus:10.10.4

USER root
RUN corepack enable
USER node

WORKDIR /directus
```

Deploy:
```bash
railway up
```

6. **Set environment variables** in Railway dashboard:

Copy from `.env.example` and update:
- `PUBLIC_URL` → Your Railway domain
- `CORS_ORIGIN` → Your production frontend URL
- Generate new `KEY` and `SECRET`
- Update admin credentials
- Configure database connection (Railway provides this automatically)

### Option 2: Fly.io

1. **Install Fly CLI**: https://fly.io/docs/hands-on/install-flyctl/

2. **Launch app**:
```bash
fly launch
```

3. **Add PostgreSQL**:
```bash
fly postgres create
fly postgres attach <postgres-app-name>
```

4. **Set secrets**:
```bash
fly secrets set KEY=$(node -e "console.log(require('crypto').randomUUID())")
fly secrets set SECRET=$(node -e "console.log(require('crypto').randomUUID())")
fly secrets set ADMIN_EMAIL=admin@successchemistry.com
fly secrets set ADMIN_PASSWORD=secure_password_here
```

5. **Deploy**:
```bash
fly deploy
```

### Option 3: DigitalOcean App Platform

1. Connect your GitHub repository
2. Select Dockerfile deploy
3. Add PostgreSQL database
4. Set environment variables from `.env.example`
5. Deploy

### Storage for Production

Configure S3-compatible storage for production file uploads:

```bash
# AWS S3
STORAGE_LOCATIONS=s3
STORAGE_S3_DRIVER=s3
STORAGE_S3_KEY=your_access_key
STORAGE_S3_SECRET=your_secret_key
STORAGE_S3_BUCKET=successchemistry-assets
STORAGE_S3_REGION=us-east-1

# Or Cloudinary
STORAGE_LOCATIONS=cloudinary
STORAGE_CLOUDINARY_CLOUD_NAME=your_cloud_name
STORAGE_CLOUDINARY_API_KEY=your_api_key
STORAGE_CLOUDINARY_API_SECRET=your_api_secret
```

## Advanced: Bulk Image Upload

For uploading many product images at once:

1. **Prepare images**: Organize in folders by SKU:
   ```
   uploads/
     products/
       10786-807/
         01.png
         02.png
       52274-401/
         01.png
   ```

2. **Upload via API**:

```bash
#!/bin/bash
TOKEN="your_token"
DIRECTUS_URL="http://localhost:8055"

for dir in uploads/products/*; do
  sku=$(basename "$dir")
  
  # Upload main image
  image_id=$(curl -X POST "$DIRECTUS_URL/files" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@$dir/01.png" \
    | jq -r '.data.id')
  
  # Update product
  curl -X PATCH "$DIRECTUS_URL/items/products?filter[sku][_eq]=$sku" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"image\": \"$image_id\"}"
done
```

## Maintenance

### Backup Database

```bash
# Create backup
make backup

# Or manually
docker-compose exec database pg_dump -U directus directus > backup.sql
```

### Restore Database

```bash
# Restore from backup
make restore FILE=backups/backup-20260209-123456.sql

# Or manually
cat backup.sql | docker-compose exec -T database psql -U directus directus
```

### Update Directus

```bash
# Update docker-compose.yml with new version
# image: directus/directus:10.11.0

# Pull new image
docker-compose pull directus

# Restart
make restart
```

### View Logs

```bash
# Directus logs
make logs

# Database logs
make logs-db

# All logs
docker-compose logs -f
```

## Troubleshooting

### "Connection refused" when accessing admin panel

Wait 30-60 seconds after starting. Check logs:
```bash
make logs
```

### Database connection errors

Ensure PostgreSQL is running:
```bash
docker-compose ps database
docker-compose logs database
```

### Port 8055 already in use

Change the port in `docker-compose.yml`:
```yaml
ports:
  - "8056:8055"
```

### Permission errors with volumes

Fix file permissions:
```bash
sudo chown -R $USER:$USER ./data ./uploads
```

### Schema changes not applying

Restart Directus:
```bash
make restart
```

## Common Tasks

### Add a new admin user

Via admin panel:
1. Settings → Access Control → Users
2. Click "+" to create user
3. Set role to "Administrator"

Via CLI:
```bash
docker-compose exec directus npx directus users create \
  --email admin2@example.com \
  --password secure_password \
  --role administrator
```

### Reset admin password

```bash
docker-compose exec directus npx directus users password \
  --email admin@example.com \
  --password new_password
```

### Clear cache

```bash
docker-compose exec directus npx directus cache clear
```

## Next Steps

1. ✅ Complete the setup steps above
2. 📝 Import your full product catalog
3. 🖼️ Upload product images
4. 🔗 Integrate with Next.js frontend
5. 🚀 Deploy to production
6. 📊 Set up monitoring and backups

## Support

- Directus Documentation: https://docs.directus.io
- SCV2 Project: See main README.md
- Issues: Open a GitHub issue
