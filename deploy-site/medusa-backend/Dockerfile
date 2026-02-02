# Production Dockerfile for Medusa v2 backend.
# Build creates .medusa/server inside the image so it exists at runtime (fixes Render native build).
# Railway: free tier has ~5 min build timeout; Pro ($5/mo) gives 60 min. Use cache mounts to speed builds.
FROM node:20-alpine

# Medusa docs recommend /server to avoid admin path conflicts
WORKDIR /server

# Dependencies (Railway cache requires hardcoded service ID; omitted to avoid "not prefixed with cache key". Pro gives 60 min build.)
COPY package.json package-lock.json* ./
COPY .npmrc* ./
RUN npm ci

# App source and config
COPY medusa-config.ts tsconfig.json instrumentation.ts ./
COPY src ./src

# Cache bust: change this to force full rebuild (Render may not clear Docker layer cache)
ARG CACHEBUST=20240202
RUN echo "Docker cache bust: $CACHEBUST"

# Build (outputs to .medusa/server)
RUN npm run build

# Verify .medusa/server exists (fail build if missing)
RUN test -d .medusa/server || (echo "ERROR: .medusa/server missing after build" && exit 1)

# Install production deps for the built server
RUN cd .medusa/server && npm ci --omit=dev

EXPOSE 9000

# Migrations need DATABASE_URL at runtime; then start from built server.
# Render sets PORT; Medusa reads it. HOST=0.0.0.0 so the server binds to all interfaces.
# Debug: dump pwd and .medusa at runtime (remove after fix verified)
CMD ["sh", "-c", "echo [DEBUG] PWD=$(pwd) && echo [DEBUG] .medusa: && ls -la .medusa 2>&1 || true && npx medusa db:migrate && cd .medusa/server && exec env HOST=0.0.0.0 npm start"]
