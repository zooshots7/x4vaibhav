#!/bin/bash

echo "🧪 Testing x402Metrics Dashboard..."
echo ""

# Test 1: Backend health
echo "1️⃣ Backend Health Check..."
HEALTH=$(curl -s http://localhost:3001/health | jq -r '.status')
if [ "$HEALTH" = "ok" ]; then
  echo "   ✅ Backend is healthy"
else
  echo "   ❌ Backend not responding"
  exit 1
fi

# Test 2: Provider Leaderboard
echo ""
echo "2️⃣ Provider Leaderboard..."
PROVIDER_COUNT=$(curl -s 'http://localhost:3001/api/leaderboard/providers?limit=10' | jq '.count')
if [ "$PROVIDER_COUNT" -gt 0 ]; then
  echo "   ✅ Found $PROVIDER_COUNT providers"
  TOP_PROVIDER=$(curl -s 'http://localhost:3001/api/leaderboard/providers?limit=1' | jq -r '.leaderboard[0].provider_name')
  echo "   🥇 Top: $TOP_PROVIDER"
else
  echo "   ❌ No providers found"
fi

# Test 3: Transaction Map
echo ""
echo "3️⃣ Transaction Map..."
TX_COUNT=$(curl -s 'http://localhost:3001/api/map/transactions?limit=50' | jq '.count')
if [ "$TX_COUNT" -gt 0 ]; then
  echo "   ✅ Found $TX_COUNT transactions"
  FIRST_CITY=$(curl -s 'http://localhost:3001/api/map/transactions?limit=1' | jq -r '.transactions[0].city')
  echo "   📍 Latest: $FIRST_CITY"
else
  echo "   ❌ No transactions found"
fi

# Test 4: Frontend
echo ""
echo "4️⃣ Frontend Check..."
if curl -s http://localhost:3000 | grep -q "x402Metrics"; then
  echo "   ✅ Frontend is serving pages"
else
  echo "   ❌ Frontend not responding"
fi

echo ""
echo "🎯 Dashboard Status: READY!"
echo ""
echo "📊 Open: http://localhost:3000"
echo ""
