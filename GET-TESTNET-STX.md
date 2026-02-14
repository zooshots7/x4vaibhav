# 🪙 Get Testnet STX - Quick Guide

## Your Wallet Info
**Address:** `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`

## Step-by-Step

### 1. Request Testnet STX
🌐 **Go to:** https://explorer.stacks.co/sandbox/faucet?chain=testnet

1. Paste your address: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`
2. Click "Request STX"
3. You should get **500 testnet STX** (enough for ~100,000 API calls at 0.005 STX each!)

### 2. Check Balance
🔍 **Check your balance here:**
https://explorer.hiro.so/address/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM?chain=testnet

**Wait time:** Usually instant, max 10 minutes

### 3. Once You Have STX
```bash
# Check if you have a private key
cat /Users/vaibu/x402/demo-api/.env | grep STACKS_PRIVATE_KEY

# If not, you need to add it to .env
# (I can help generate one if needed)
```

### 4. Test Real Payment
```bash
cd /Users/vaibu/x402/test-client
node client.js
```

**Expected Output:**
```
✅ Weather API successful!
   💰 Transaction: 0xabc123... [Clickable link to explorer]
```

## Troubleshooting

### "Faucet not working"
- Try different browser
- Clear cache
- Wait 5 minutes and try again
- Alternative: https://explorer.hiro.so/sandbox/faucet (same faucet, different UI)

### "No private key"
If you don't have the private key for ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM:
1. Generate a new wallet
2. Get new testnet STX
3. Update .env files

## Next Steps After Getting STX
1. ✅ Test with real transactions (client.js)
2. ✅ Verify tx hash on blockchain explorer
3. ✅ Update dashboard to show real tx links
4. ✅ Deploy + record demo
5. ✅ Submit to DoraHacks

---

**Time Estimate:** 10-15 minutes total (mostly waiting for faucet)
