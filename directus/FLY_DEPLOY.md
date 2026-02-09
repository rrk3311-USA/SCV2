# Deploy Directus to Fly.io

Step-by-step guide to deploy your SCV2 Directus backend to Fly.io.

## Prerequisites

1. **Fly.io Account** - Sign up at https://fly.io/app/sign-up (free tier available)
2. **Fly CLI** - Install flyctl

## Step 1: Install Fly CLI

### macOS
```bash
brew install flyctl
```

### Linux
```bash
curl -L https://fly.io/install.sh | sh
```

### Windows
```powershell
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

Or download from: https://fly.io/docs/hands-on/install-flyctl/

## Step 2: Login to Fly.io

```bash
flyctl auth login
```

This will open your browser for authentication.

## Step 3: Create PostgreSQL Database

```bash
cd directus

# Create a Postgres cluster
flyctl postgres create --name scv2-directus-db --region iad

# Note the connection details shown - you'll need them!
# Example output will show:
# Username: postgres
# Password: <random-password>
# Hostname: scv2-directus-db.internal
# Database: scv2_directus
```

**Save these credentials!** You'll need them in the next step.

## Step 4: Create Redis Instance (Optional but Recommended)

```bash
# Create Upstash Redis via Fly.io
flyctl redis create --name scv2-directus-redis --region iad

# Or use Fly.io's Redis addon
flyctl redis create
```

Note the Redis URL provided.

## Step 5: Launch Directus App

```bash
cd /path/to/SCV2/directus

# Initialize the app (this uses the fly.toml config)
flyctl launch --no-deploy

# When prompted:
# - App name: scv2-directus (or your preferred name)
# - Region: iad (or your preferred region)
# - Database: N (we already created it)
```

## Step 6: Set Environment Variables

Generate secure keys:
```bash
# Generate KEY
node -e "console.log(require('crypto').randomUUID())"

# Generate SECRET
node -e "console.log(require('crypto').randomUUID())"
```

Set the secrets on Fly.io:
```bash
# Database credentials (from Step 3)
flyctl secrets set DB_CLIENT=pg
flyctl secrets set DB_HOST=scv2-directus-db.internal
flyctl secrets set DB_PORT=5432
flyctl secrets set DB_DATABASE=scv2_directus
flyctl secrets set DB_USER=postgres
flyctl secrets set DB_PASSWORD=<password-from-step-3>

# Security keys (generate new ones!)
flyctl secrets set KEY=<generated-uuid>
flyctl secrets set SECRET=<generated-uuid>

# Admin credentials (CHANGE THESE!)
flyctl secrets set ADMIN_EMAIL=admin@successchemistry.com
flyctl secrets set ADMIN_PASSWORD=<your-secure-password>

# Redis (if created in Step 4)
flyctl secrets set REDIS=<redis-url-from-step-4>

# Public URL (will be available after first deploy)
flyctl secrets set PUBLIC_URL=https://scv2-directus.fly.dev

# CORS for your frontend
flyctl secrets set CORS_ENABLED=true
flyctl secrets set CORS_ORIGIN=https://www.successchemistry.com,https://scv2-success-chemistry.vercel.app
```

## Step 7: Attach Database to App

```bash
flyctl postgres attach scv2-directus-db --app scv2-directus
```

## Step 8: Deploy!

```bash
flyctl deploy
```

This will:
1. Build the Docker image
2. Push to Fly.io registry
3. Deploy to your app
4. Run health checks

## Step 9: Check Deployment

```bash
# Check app status
flyctl status

# View logs
flyctl logs

# Open in browser
flyctl open
```

Your Directus admin should now be available at:
**https://scv2-directus.fly.dev**

## Step 10: Initial Login

1. Go to https://scv2-directus.fly.dev
2. Login with the credentials you set in Step 6
3. Change your password immediately!

## Step 11: Update Frontend Environment

Update your Next.js `.env.local` and Vercel environment variables:

```bash
NEXT_PUBLIC_DIRECTUS_URL=https://scv2-directus.fly.dev
```

Redeploy your frontend to pick up the new backend URL.

## Troubleshooting

### Check logs
```bash
flyctl logs --app scv2-directus
```

### SSH into the machine
```bash
flyctl ssh console --app scv2-directus
```

### Check database connection
```bash
flyctl postgres connect -a scv2-directus-db
```

### Restart the app
```bash
flyctl apps restart scv2-directus
```

### Check health
```bash
curl https://scv2-directus.fly.dev/server/health
```

## Scaling

### Upgrade machine size
```bash
# Edit fly.toml and increase memory_mb or cpus, then:
flyctl deploy
```

### Scale horizontally (multiple instances)
```bash
flyctl scale count 2 --app scv2-directus
```

## Costs

**Fly.io Free Tier includes:**
- 3 shared-cpu-1x VMs with 256MB RAM
- 3GB persistent volume storage
- 160GB outbound data transfer

Your current configuration uses:
- 1 VM with 512MB RAM (within free tier if you have no other apps)
- PostgreSQL (free tier available)
- Redis (paid, but can skip for development)

**Estimated monthly cost:** $0-5 depending on usage

## Monitoring

View metrics in the Fly.io dashboard:
https://fly.io/dashboard/scv2-directus

Or via CLI:
```bash
flyctl dashboard scv2-directus
```

## Database Backups

```bash
# Create a backup
flyctl postgres backup create -a scv2-directus-db

# List backups
flyctl postgres backup list -a scv2-directus-db
```

## Custom Domain (Optional)

```bash
# Add your custom domain
flyctl certs create api.successchemistry.com --app scv2-directus

# Add DNS records as instructed
# Then verify
flyctl certs show api.successchemistry.com --app scv2-directus
```

## Import Sample Data

After deployment, import sample data:

```bash
# Get your Directus token from the admin UI:
# User Menu → Account Settings → API Tokens → Create Token

# Then run locally:
DIRECTUS_URL=https://scv2-directus.fly.dev \
DIRECTUS_TOKEN=your_token \
node scripts/import-products.js
```

## Quick Commands Reference

```bash
# Deploy
flyctl deploy

# View logs
flyctl logs

# Open app
flyctl open

# Check status
flyctl status

# SSH into machine
flyctl ssh console

# Restart app
flyctl apps restart scv2-directus

# Scale
flyctl scale count 2
flyctl scale memory 1024

# Secrets
flyctl secrets list
flyctl secrets set KEY=value
```

## Support

- Fly.io Docs: https://fly.io/docs/
- Fly.io Community: https://community.fly.io/
- Directus Docs: https://docs.directus.io/
- SCV2 Issues: Open a GitHub issue

---

**Your Directus backend is now live! 🚀**

Access your admin panel at: https://scv2-directus.fly.dev
