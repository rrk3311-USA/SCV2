FROM alpine:latest

# Install dependencies
RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget

# Download and install PocketBase
ARG PB_VERSION=0.36.2
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip \
    && chmod +x pocketbase \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip

# Add redirect: / -> /_/ (admin UI)
COPY pb_hooks ./pb_hooks

# Add migrations (products, orders, customers with SKU/GTIN/UPC)
COPY pb_migrations ./pb_migrations

# Expose port
EXPOSE 8090

# Start PocketBase (entrypoint for future CORS/options)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
