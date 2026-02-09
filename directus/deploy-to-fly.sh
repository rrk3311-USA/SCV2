#!/bin/bash

# Complete Fly.io Deployment Script for SCV2 Directus Backend
# Run this on your local Mac terminal

set -e  # Exit on error

echo "🚀 SCV2 Directus Deployment to Fly.io"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Find or clone the project
echo "📁 Step 1: Locating SCV2 project..."
echo ""

# Try to find existing project
SCV2_PATH=""
for dir in ~/Documents/SCV2 ~/Desktop/SCV2 ~/Projects/SCV2 ~/success007/SCV2 ~/Downloads/SCV2; do
  if [ -d "$dir" ]; then
    SCV2_PATH="$dir"
    echo -e "${GREEN}✓ Found project at: $SCV2_PATH${NC}"
    break
  fi
done

# If not found, clone it
if [ -z "$SCV2_PATH" ]; then
  echo -e "${YELLOW}Project not found. Cloning from GitHub...${NC}"
  cd ~/Documents
  git clone https://github.com/rrk3311-USA/SCV2.git
  SCV2_PATH="$HOME/Documents/SCV2"
  echo -e "${GREEN}✓ Cloned to: $SCV2_PATH${NC}"
fi

cd "$SCV2_PATH"
echo ""

# Step 2: Get latest code
echo "📥 Step 2: Getting latest code..."
git fetch origin
git checkout cursor/scv2-directus-backend-c49e
git pull origin cursor/scv2-directus-backend-c49e
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# Step 3: Delete old Fly.io apps
echo "🗑️  Step 3: Cleaning up old Fly.io apps..."
echo ""
flyctl apps list
echo ""
read -p "Do you want to delete 'bold-wind-1462'? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  flyctl apps destroy bold-wind-1462 --yes || echo "App already deleted or doesn't exist"
  echo -e "${GREEN}✓ Deleted bold-wind-1462${NC}"
fi

read -p "Do you want to delete 'medusa-backend-dark-resonance-4960'? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  flyctl apps destroy medusa-backend-dark-resonance-4960 --yes || echo "App already deleted or doesn't exist"
  echo -e "${GREEN}✓ Deleted medusa-backend-dark-resonance-4960${NC}"
fi
echo ""

# Step 4: Generate secure keys
echo "🔑 Step 4: Generating secure keys..."
KEY=$(node -e "console.log(require('crypto').randomUUID())")
SECRET=$(node -e "console.log(require('crypto').randomUUID())")
echo -e "${GREEN}✓ Keys generated${NC}"
echo ""

# Step 5: Create PostgreSQL database
echo "💾 Step 5: Creating PostgreSQL database..."
cd "$SCV2_PATH/directus"

echo -e "${YELLOW}Creating database 'scv2-directus-db' in ORD region...${NC}"
flyctl postgres create --name scv2-directus-db --region ord --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 1

echo ""
echo -e "${RED}⚠️  IMPORTANT: Copy the database password shown above!${NC}"
read -p "Press Enter after you've copied the password..."
echo ""

read -p "Paste the database password here: " DB_PASSWORD
echo ""

# Step 6: Get admin password
echo "🔐 Step 6: Set admin password for Directus..."
read -sp "Enter a secure admin password for Directus: " ADMIN_PASSWORD
echo ""
echo ""

# Step 7: Launch app
echo "🚀 Step 7: Launching Directus app..."
flyctl launch --name scv2-directus --region ord --no-deploy --copy-config --yes

echo -e "${GREEN}✓ App created${NC}"
echo ""

# Step 8: Set environment variables
echo "⚙️  Step 8: Configuring environment variables..."
flyctl secrets set \
  DB_CLIENT=pg \
  DB_HOST=scv2-directus-db.internal \
  DB_PORT=5432 \
  DB_DATABASE=scv2_directus \
  DB_USER=postgres \
  DB_PASSWORD="$DB_PASSWORD" \
  KEY="$KEY" \
  SECRET="$SECRET" \
  ADMIN_EMAIL=admin@successchemistry.com \
  ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  PUBLIC_URL=https://scv2-directus.fly.dev \
  CORS_ENABLED=true \
  CORS_ORIGIN="https://www.successchemistry.com,https://scv2-success-chemistry.vercel.app"

echo -e "${GREEN}✓ Environment variables set${NC}"
echo ""

# Step 9: Attach database
echo "🔗 Step 9: Attaching database to app..."
flyctl postgres attach scv2-directus-db --app scv2-directus
echo -e "${GREEN}✓ Database attached${NC}"
echo ""

# Step 10: Deploy
echo "🚢 Step 10: Deploying to Fly.io..."
flyctl deploy
echo -e "${GREEN}✓ Deployed successfully!${NC}"
echo ""

# Step 11: Check status
echo "📊 Step 11: Checking deployment status..."
flyctl status
echo ""

# Done!
echo "======================================"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "======================================"
echo ""
echo "Your Directus admin panel is now available at:"
echo -e "${GREEN}https://scv2-directus.fly.dev${NC}"
echo ""
echo "Login credentials:"
echo "  Email: admin@successchemistry.com"
echo "  Password: [the password you entered]"
echo ""
echo "Next steps:"
echo "1. Open your admin panel: flyctl open"
echo "2. Change your password in the admin UI"
echo "3. Update Vercel environment variables:"
echo "   NEXT_PUBLIC_DIRECTUS_URL=https://scv2-directus.fly.dev"
echo ""
echo "View logs: flyctl logs"
echo "SSH into machine: flyctl ssh console"
echo ""
