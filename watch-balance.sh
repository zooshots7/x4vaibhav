#!/bin/bash

ADDRESS="ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914"

echo "🔍 Watching balance for: $ADDRESS"
echo "Press Ctrl+C to stop"
echo ""

while true; do
  BALANCE=$(curl -s "https://api.hiro.so/extended/v1/address/$ADDRESS/balances" | python3 -c "import sys, json; data = json.load(sys.stdin); print(int(data['stx']['balance'])/1000000)")
  
  TIMESTAMP=$(date '+%H:%M:%S')
  
  if [ "$BALANCE" != "0.0" ]; then
    echo "[$TIMESTAMP] 🎉 BALANCE: $BALANCE STX - STX HAS ARRIVED!"
    echo ""
    echo "✅ Ready to test payments!"
    break
  else
    echo "[$TIMESTAMP] ⏳ Balance: $BALANCE STX (waiting...)"
  fi
  
  sleep 10
done
