#!/bin/bash

# Start script for PocketBase
# Downloads PocketBase if not present and starts it

set -e

PB_VERSION="0.36.2"
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Map architecture names
case "$ARCH" in
    x86_64)
        ARCH="amd64"
        ;;
    aarch64|arm64)
        ARCH="arm64"
        ;;
esac

PB_FILE="pocketbase_${PB_VERSION}_${OS}_${ARCH}.zip"
PB_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/${PB_FILE}"

# Download PocketBase if not present
if [ ! -f "./pocketbase" ]; then
    echo "📦 Downloading PocketBase ${PB_VERSION} for ${OS}_${ARCH}..."
    curl -L "$PB_URL" -o pocketbase.zip
    unzip -q pocketbase.zip
    chmod +x pocketbase
    rm pocketbase.zip
    echo "✅ PocketBase downloaded successfully!"
fi

# Start PocketBase
echo "🚀 Starting PocketBase..."
echo ""
echo "   Admin UI: http://localhost:8090/_/"
echo "   API:      http://localhost:8090/api/"
echo ""
./pocketbase serve
