# Production Dockerfile for Medusa v2 backend.
# Stage 1: build. Stage 2: runtime with explicit COPY of .medusa/server so Render cannot lose it.
FROM node:20-alpine AS builder

WORKDIR /server

COPY package.json package-lock.json* ./
COPY .npmrc* ./
RUN npm ci

COPY medusa-config.ts tsconfig.json instrumentation.ts ./
COPY src ./src

ARG CACHEBUST=20240204
RUN echo "Docker cache bust: $CACHEBUST"

RUN npm run build
RUN test -d .medusa/server || (echo "ERROR: .medusa/server missing after build" && exit 1)
# Write entry point for runtime: use package.json "start" (e.g. "node dist/index.js") or "main" or "dist/index.js"
RUN node -e "const p=require('./.medusa/server/package.json'); const s=p.scripts?.start; const m=p.main||'dist/index.js'; const entry=(s&&s.startsWith('node ')?s.replace(/^node\\s+/,'').trim():m); require('fs').writeFileSync('.medusa/server/ENTRY', entry); console.log('ENTRY:', entry);"
RUN cd .medusa/server && npm ci --omit=dev

# Stage 2: runtime – built server in /opt/medusa-server so Render mount cannot overwrite it
FROM node:20-alpine

WORKDIR /app

# Root project (for npx medusa db:migrate)
COPY --from=builder /server/package.json /server/package-lock.json* ./
COPY --from=builder /server/node_modules ./node_modules
COPY --from=builder /server/medusa-config.ts /server/tsconfig.json /server/instrumentation.ts ./

# Built server – /opt/medusa-server is outside Render's typical mount paths
COPY --from=builder /server/.medusa/server /opt/medusa-server

EXPOSE 9000

# Run migrations from /app; then start built server with debug output
CMD ["sh", "-c", "\
echo '[DEBUG H1] === ENTRY file contents ===' && cat /opt/medusa-server/ENTRY 2>&1 || echo 'ENTRY file not found'; \
echo '[DEBUG H2/H4] === /opt/medusa-server root listing ===' && ls -la /opt/medusa-server; \
echo '[DEBUG H2/H4] === /opt/medusa-server/dist listing ===' && ls -la /opt/medusa-server/dist 2>&1 || echo 'dist/ does not exist'; \
echo '[DEBUG H3/H5] === package.json scripts/main ===' && node -e \"const p=require('/opt/medusa-server/package.json'); console.log('main:', p.main); console.log('scripts:', JSON.stringify(p.scripts, null, 2));\"; \
echo '[DEBUG] === Starting server ===' && \
cd /app && npx medusa db:migrate && \
cd /opt/medusa-server && npm start \
"]
