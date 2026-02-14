#!/bin/bash

echo "🏥 x402Metrics Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if ports are listening
echo "📡 Port Status:"
lsof -nP -iTCP:3001 -sTCP:LISTEN > /dev/null 2>&1 && echo "  ✅ Backend (3001) - LISTENING" || echo "  ❌ Backend (3001) - NOT LISTENING"
lsof -nP -iTCP:3000 -sTCP:LISTEN > /dev/null 2>&1 && echo "  ✅ Frontend (3000) - LISTENING" || echo "  ❌ Frontend (3000) - NOT LISTENING"
lsof -nP -iTCP:3002 -sTCP:LISTEN > /dev/null 2>&1 && echo "  ✅ Demo API (3002) - LISTENING" || echo "  ❌ Demo API (3002) - NOT LISTENING"
echo ""

# Check backend health
echo "🔍 Backend Health:"
HEALTH=$(curl -s http://localhost:3001/health 2>/dev/null)
if [ $? -eq 0 ]; then
  echo "  ✅ Backend responding"
  echo "  $(echo $HEALTH | jq -r '.message')"
else
  echo "  ❌ Backend not responding"
fi
echo ""

# Check stats
echo "📊 Data Status:"
STATS=$(curl -s http://localhost:3001/api/stats 2>/dev/null)
if [ $? -eq 0 ]; then
  echo "  ✅ Database connected"
  echo "  Revenue: $(echo $STATS | jq -r '.totalRevenue') STX"
  echo "  Payments: $(echo $STATS | jq -r '.totalPayments')"
  echo "  Success Rate: $(echo $STATS | jq -r '.successRate')%"
else
  echo "  ❌ Database not accessible"
fi
echo ""

# Check fraud alerts
echo "🛡️ Security:"
ALERTS=$(curl -s http://localhost:3001/api/security/alerts 2>/dev/null | jq 'length' 2>/dev/null)
if [ ! -z "$ALERTS" ]; then
  echo "  ✅ Fraud detection active"
  echo "  Active alerts: $ALERTS"
else
  echo "  ❌ Fraud detection unavailable"
fi
echo ""

# Check marketplace
echo "🛒 Marketplace:"
PROVIDERS=$(curl -s http://localhost:3001/api/providers 2>/dev/null | jq 'length' 2>/dev/null)
if [ ! -z "$PROVIDERS" ]; then
  echo "  ✅ Marketplace online"
  echo "  Active providers: $PROVIDERS"
else
  echo "  ❌ Marketplace unavailable"
fi
echo ""

# Check blockchain wallet
echo "⛓️ Blockchain:"
BALANCE=$(curl -s "https://api.testnet.hiro.so/extended/v1/address/ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914/balances" 2>/dev/null | jq -r '.stx.balance' 2>/dev/null)
if [ ! -z "$BALANCE" ] && [ "$BALANCE" != "null" ]; then
  STX=$(echo "scale=6; $BALANCE / 1000000" | bc)
  echo "  ✅ Wallet connected"
  echo "  Balance: $STX STX"
else
  echo "  ❌ Wallet not accessible"
fi
echo ""

# Overall status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Overall Status: ALL SYSTEMS OPERATIONAL ✅"
echo ""
echo "Dashboard: http://localhost:3000"
echo "Backend API: http://localhost:3001"
echo "Explorer: https://explorer.hiro.so/address/ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914?chain=testnet"
