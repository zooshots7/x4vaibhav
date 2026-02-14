#!/bin/bash

echo "🔥 Testing Real x402 Payment Flow"
echo ""
echo "1. Testing 402 response..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3002/api/weather)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "402" ]; then
  echo "✅ Got 402 Payment Required"
else
  echo "❌ Expected 402, got $HTTP_CODE"
  exit 1
fi

echo ""
echo "2. Making payment with test client..."
cd /Users/vaibu/x402/test-client
timeout 120 node client.js

echo ""
echo "3. Checking backend for recent payments..."
curl -s http://localhost:3001/api/payments/recent?limit=5 | jq '.[0]'
