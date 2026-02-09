FROM directus/directus:10.10.4

USER root
RUN corepack enable
USER node

WORKDIR /directus

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8055/server/health || exit 1

EXPOSE 8055
