#!/bin/bash

# Check Kratos health
if [ -z "$1" ]; then
    echo "Usage: bash check-health.sh <kratos-url>"
    echo "Example: bash check-health.sh https://kratos-production.railway.app"
    exit 1
fi

KRATOS_URL=$1

echo "Checking Kratos health at $KRATOS_URL..."
echo ""

# Check public API health
echo "Public API Health:"
curl -s "$KRATOS_URL/health/ready" | jq . || echo "Failed to connect"
echo ""

# Check admin API health (if accessible)
echo "Admin API Health:"
curl -s "$KRATOS_URL/health/alive" | jq . || echo "Failed to connect"
echo ""
