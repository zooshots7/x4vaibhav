#!/bin/bash

ADDRESS="ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914"
CHECK_INTERVAL=5  # Check every 5 seconds

echo "🔄 Auto-populate script started"
echo "📍 Watching address: $ADDRESS"
echo "⏰ Checking every ${CHECK_INTERVAL}s for incoming STX..."
echo ""

while true; do
  # Get balance
  BALANCE=$(curl -s "https://api.hiro.so/extended/v1/address/$ADDRESS/balances" | jq -r '.stx.balance')
  
  if [ "$BALANCE" != "0" ] && [ "$BALANCE" != "null" ] && [ -n "$BALANCE" ]; then
    STX=$(echo "scale=6; $BALANCE / 1000000" | bc)
    echo ""
    echo "💰 STX DETECTED! Balance: $STX STX"
    echo "🚀 Starting real transaction tests..."
    echo ""
    
    # Run test client to populate dashboard
    cd /Users/vaibu/x402/test-client
    node client.js
    
    echo ""
    echo "✅ Dashboard populated with real blockchain transactions!"
    echo "🌐 View at: http://localhost:3000"
    echo ""
    exit 0
  else
    echo -ne "\r⏳ Still waiting for STX... (checked $(date '+%H:%M:%S'))"
  fi
  
  sleep $CHECK_INTERVAL
done
