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
ARG CACHEBUST=20240201
RUN echo "Docker cache bust: $CACHEBUST"

# Build (outputs to .medusa/server)
RUN npm run build

# Install production deps for the built server
RUN cd .medusa/server && npm ci --omit=dev

EXPOSE 9000

# Migrations need DATABASE_URL at runtime; then start from built server.
# Railway sets PORT; Medusa reads it. HOST=0.0.0.0 so the server is reachable (default localhost would cause "Application failed to respond").
# Echo markers so deploy logs show where startup fails (migrations vs server start).
# #region agent log – runtime evidence for Render deploy (H2: .medusa/server exists? H5: PORT/HOST)
CMD ["sh", "-c", "echo '[DEBUG H5] PORT='$PORT' HOST='$HOST' && echo '[DEBUG H2] PWD='$(pwd)' && echo '[DEBUG H2] .medusa contents:' && ls -la .medusa 2>&1 || true && echo '[DEBUG H2] .medusa/server exists?' && (test -d .medusa/server && echo yes || echo no) && echo '[MEDUSA] Starting migrations' && npx medusa db:migrate && echo '[MEDUSA] Migrations done, starting server (PORT='$PORT')' && cd .medusa/server && HOST=0.0.0.0 npm start"]
# #endregion
