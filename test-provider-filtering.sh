#!/bin/bash

echo "🧪 Testing Provider Filtering"
echo "=============================="
echo ""

# Weather provider
WEATHER_PROVIDER="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"

# Crypto provider
CRYPTO_PROVIDER="ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"

# AI provider
AI_PROVIDER="ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN"

# Consumer (test wallet)
CONSUMER="ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914"

echo "📊 Test 1: All data (no filter)"
echo "Expected: 26 payments, 0.282 STX"
curl -s "http://localhost:3001/api/stats" | jq '{totalRevenue, totalPayments}'
echo ""

echo "🛍️  Test 2: Consumer view"
echo "Expected: 6 payments, 0.043 STX"
curl -s "http://localhost:3001/api/stats?wallet=$CONSUMER&role=consumer" | jq '{totalRevenue, totalPayments, wallet, role}'
echo ""

echo "☀️  Test 3: Weather Provider view"
echo "Expected: Only weather endpoint payments"
curl -s "http://localhost:3001/api/stats?wallet=$WEATHER_PROVIDER&role=provider" | jq '{totalRevenue, totalPayments, wallet, role}'
echo ""

echo "💰 Test 4: Crypto Provider view"
echo "Expected: Only crypto/random-fact payments"
curl -s "http://localhost:3001/api/stats?wallet=$CRYPTO_PROVIDER&role=provider" | jq '{totalRevenue, totalPayments, wallet, role}'
echo ""

echo "🤖 Test 5: AI Provider view"
echo "Expected: Only AI summary payments"
curl -s "http://localhost:3001/api/stats?wallet=$AI_PROVIDER&role=provider" | jq '{totalRevenue, totalPayments, wallet, role}'
echo ""

echo "📋 Test 6: Weather Provider payment list"
echo "Expected: All sender_addresses different, provider_wallet = Weather"
curl -s "http://localhost:3001/api/payments/recent?limit=3&wallet=$WEATHER_PROVIDER&role=provider" | jq '[.[] | {endpoint, provider_wallet, sender: .sender_address[0:10]}]'
echo ""

echo "✅ Tests complete!"
