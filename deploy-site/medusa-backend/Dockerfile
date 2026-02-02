# Production Dockerfile for Medusa v2 backend.
# Stage 1: build. Stage 2: runtime with explicit COPY of .medusa/server so Render cannot lose it.
FROM node:20-alpine AS builder

WORKDIR /server

COPY package.json package-lock.json* ./
COPY .npmrc* ./
RUN npm ci

COPY medusa-config.ts tsconfig.json instrumentation.ts ./
COPY src ./src

ARG CACHEBUST=20240203
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

# Run migrations from /app; then start built server using ENTRY file written at build time
CMD ["sh", "-c", "cd /app && npx medusa db:migrate && cd /opt/medusa-server && ENTRY=$(cat ENTRY 2>/dev/null || echo 'dist/index.js'); exec env HOST=0.0.0.0 PORT=${PORT:-9000} node $ENTRY"]
