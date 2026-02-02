# Success Chemistry

E-commerce platform for Success Chemistry supplements.

## 🚀 Quick Start

### Backend (PocketBase)

```bash
# Start PocketBase backend
npm run pocketbase

# Or manually
cd pocketbase
./start.sh
```

**Admin UI**: http://localhost:8090/_/

See [pocketbase/QUICKSTART.md](./pocketbase/QUICKSTART.md) for full setup.

### Frontend (Static Site)

```bash
# Start local development server
npm start

# Or
npm run local
```

**Site**: http://localhost:8080

## 📁 Project Structure

```
success007/
├── pocketbase/              # PocketBase backend (replaces Medusa)
│   ├── QUICKSTART.md       # 5-minute setup guide
│   ├── README.md           # Full documentation
│   ├── start.sh            # Start script (downloads PocketBase)
│   ├── migrate-products.js # Import products from old data
│   ├── Dockerfile          # For Railway/Fly deployment
│   └── fly.toml            # Fly.io config
│
├── deploy-site/            # Main static site
│   ├── index.html         # Homepage
│   ├── shop/              # Product catalog
│   ├── cart/              # Shopping cart
│   ├── contact/           # Contact page
│   ├── life-jet/          # Life OS app (Next.js)
│   └── includes/          # Shared components
│
├── trading-bot-concept/   # Trading bot experiments
│   ├── crypto-momentum-bot/
│   └── workflow-builder/
│
├── vision-board/          # Vision board app
├── cursor-theme-hud-net/  # Cursor theme
└── docs/                  # Documentation
```

## 🛠️ Tech Stack

### Backend
- **[PocketBase](https://pocketbase.io)** - All-in-one backend (DB, auth, files, admin UI)
  - SQLite database
  - Built-in auth & file storage
  - Auto-generated REST API
  - Real-time subscriptions
  - No infrastructure needed!

### Frontend
- **Static HTML/CSS/JS** - Main site
- **Next.js** - Life Jet app
- **React** - Interactive components

### Deployment
- **Vercel** - Static site hosting (free)
- **Fly.io / Railway** - PocketBase hosting (free tier)

## 📦 Available Scripts

```bash
# Backend
npm run pocketbase          # Start PocketBase
npm run pb:migrate          # Import products to PocketBase

# Frontend
npm start                   # Start local dev server
npm run local               # Same as above

# Life Jet
npm run life-jet            # Dev server
npm run life-jet:build      # Build for production

# Build
npm run build               # Build all projects
npm run build:all           # Same as above

# Testing
npm run test:zia            # Test Zia API
npm run test:telegram       # Test Telegram bot
```

## 🚢 Deployment

### Deploy PocketBase Backend

**Option 1: Fly.io (Recommended)**

```bash
cd pocketbase
fly launch
fly deploy
```

**Option 2: Railway**

1. Connect GitHub repo
2. Select `pocketbase` folder
3. Deploy!

See [pocketbase/README.md](./pocketbase/README.md) for details.

### Deploy Static Site

**Vercel (Recommended)**

```bash
vercel deploy
```

Or connect your GitHub repo to Vercel dashboard.

## 🔧 Configuration

### Environment Variables

Create `.env` in root:

```bash
# PocketBase
PB_URL=http://localhost:8090
PB_ADMIN_EMAIL=admin@successchemistry.com
PB_ADMIN_PASSWORD=your-password

# Zoho (optional)
ZOHO_CLIENT_ID=your-client-id
ZOHO_CLIENT_SECRET=your-secret

# PayPal (optional)
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-secret
```

## 📚 Documentation

- **[PocketBase Setup](./pocketbase/QUICKSTART.md)** - Get started in 5 minutes
- **[PocketBase Full Docs](./pocketbase/README.md)** - Complete guide
- **[Deployment Guide](./docs/)** - Deploy to production

## 🎯 What Changed from Medusa

### Before (Medusa)
- ❌ Needed Postgres database
- ❌ Needed Redis cache
- ❌ Complex deployment
- ❌ Multiple services to manage
- ❌ Higher hosting costs

### Now (PocketBase)
- ✅ Single binary (no external DB)
- ✅ Built-in SQLite
- ✅ Simple deployment
- ✅ One service to manage
- ✅ Free tier available

## 🔗 Links

- **Production**: https://successchemistry.com
- **PocketBase Docs**: https://pocketbase.io/docs
- **GitHub**: https://github.com/pocketbase/pocketbase

## 📄 License

MIT

---

Made with ❤️ by Success Chemistry
