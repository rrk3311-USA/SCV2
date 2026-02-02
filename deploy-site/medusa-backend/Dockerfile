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
RUN cd .medusa/server && npm ci --omit=dev

# Stage 2: runtime – explicitly copy built server so it is always present
FROM node:20-alpine

WORKDIR /server

# Root project (for npx medusa db:migrate)
COPY --from=builder /server/package.json /server/package-lock.json* ./
COPY --from=builder /server/node_modules ./node_modules
COPY --from=builder /server/medusa-config.ts /server/tsconfig.json /server/instrumentation.ts ./

# Built server – explicit copy so final image definitely has it
COPY --from=builder /server/.medusa/server ./.medusa/server

EXPOSE 9000

CMD ["sh", "-c", "cd /server && npx medusa db:migrate && cd /server/.medusa/server && exec env HOST=0.0.0.0 npm start"]
