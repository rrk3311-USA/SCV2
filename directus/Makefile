.PHONY: help start stop restart logs status clean backup restore

# Default target
help:
	@echo "SCV2 Directus Backend - Available Commands"
	@echo "==========================================="
	@echo ""
	@echo "  make start       - Start Directus backend"
	@echo "  make stop        - Stop Directus backend"
	@echo "  make restart     - Restart Directus backend"
	@echo "  make logs        - View Directus logs"
	@echo "  make logs-db     - View database logs"
	@echo "  make status      - Check container status"
	@echo "  make shell       - Open shell in Directus container"
	@echo "  make db-shell    - Open PostgreSQL shell"
	@echo "  make clean       - Stop and remove all containers and volumes"
	@echo "  make backup      - Backup database"
	@echo "  make restore     - Restore database from backup"
	@echo "  make import      - Import sample data"
	@echo ""

start:
	@echo "Starting Directus..."
	docker-compose up -d
	@echo ""
	@echo "✓ Directus is starting!"
	@echo "  Admin UI: http://localhost:8055"
	@echo "  API:      http://localhost:8055/items"
	@echo "  GraphQL:  http://localhost:8055/graphql"
	@echo ""
	@echo "Default login:"
	@echo "  Email:    admin@example.com"
	@echo "  Password: admin"
	@echo ""
	@echo "View logs: make logs"

stop:
	@echo "Stopping Directus..."
	docker-compose down

restart:
	@echo "Restarting Directus..."
	docker-compose restart

logs:
	docker-compose logs -f directus

logs-db:
	docker-compose logs -f database

status:
	docker-compose ps

shell:
	docker-compose exec directus sh

db-shell:
	docker-compose exec database psql -U directus directus

clean:
	@echo "⚠️  Warning: This will remove all data!"
	@echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
	@sleep 5
	docker-compose down -v
	@echo "✓ Cleaned up containers and volumes"

backup:
	@echo "Creating database backup..."
	@mkdir -p backups
	docker-compose exec -T database pg_dump -U directus directus > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "✓ Backup created: backups/backup-$$(date +%Y%m%d-%H%M%S).sql"

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make restore FILE=backups/backup-20260209-123456.sql"; \
		exit 1; \
	fi
	@echo "Restoring database from $(FILE)..."
	cat $(FILE) | docker-compose exec -T database psql -U directus directus
	@echo "✓ Database restored"

import:
	@if [ -z "$(TOKEN)" ]; then \
		echo "Usage: make import TOKEN=your_directus_token"; \
		echo ""; \
		echo "Get your token:"; \
		echo "1. Login to Directus admin panel"; \
		echo "2. User Menu → Account Settings → API Tokens"; \
		echo "3. Create a new token with admin permissions"; \
		exit 1; \
	fi
	DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=$(TOKEN) node scripts/import-products.js
