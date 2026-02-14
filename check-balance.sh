#!/bin/bash

# Check Stacks testnet balance for your wallet

ADDRESS="ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914"

echo "🔍 Checking balance for: $ADDRESS"
echo ""

RESPONSE=$(curl -s "https://api.hiro.so/extended/v1/address/$ADDRESS/balances")

BALANCE=$(echo $RESPONSE | grep -o '"balance":"[^"]*"' | cut -d'"' -f4)

if [ -z "$BALANCE" ] || [ "$BALANCE" = "0" ]; then
    echo "❌ Balance: 0 STX"
    echo ""
    echo "💡 Get testnet STX:"
    echo "   https://explorer.stacks.co/sandbox/faucet?chain=testnet"
    echo ""
    echo "   Paste this address: $ADDRESS"
else
    # Convert microSTX to STX (divide by 1,000,000)
    STX=$(echo "scale=6; $BALANCE / 1000000" | bc)
    echo "✅ Balance: $STX STX ($BALANCE microSTX)"
    echo ""
    echo "🎉 Ready to test real payments!"
    echo "   Run: cd test-client && node client.js"
fi

echo ""
echo "📊 Full details:"
echo "   https://explorer.hiro.so/address/$ADDRESS?chain=testnet"
