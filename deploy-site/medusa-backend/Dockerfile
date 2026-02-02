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
RUN echo "=== .medusa/server ===" && ls -la .medusa/server && echo "=== package.json start/main ===" && (node -e "const p=require('./.medusa/server/package.json'); console.log('start:', p.scripts?.start); console.log('main:', p.main);")
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

# Run migrations from /app; then start built server (built output has index.js at root per Medusa docs)
CMD ["sh", "-c", "cd /app && npx medusa db:migrate && cd /opt/medusa-server && exec env HOST=0.0.0.0 PORT=${PORT:-9000} node index.js"]
