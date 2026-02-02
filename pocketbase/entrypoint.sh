#!/bin/sh
set -e

# Start PocketBase (CORS defaults to * - configure in Admin UI if needed)
exec ./pocketbase serve --http=0.0.0.0:8090 --dir=/pb_data
