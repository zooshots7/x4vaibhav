# x402 Payment Test Client

Test client for making real x402 payments on Stacks testnet.

## Quick Start

1. **Get testnet STX:**
   ```bash
   # Visit https://explorer.hiro.so/sandbox/faucet
   # Request testnet STX to your wallet
   ```

2. **Setup:**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env and add your STACKS_PRIVATE_KEY
   ```

3. **Run:**
   ```bash
   npm test
   ```

## What it does

- Creates a payment-enabled HTTP client using x402-stacks
- Attempts to call all 4 demo API endpoints
- Automatically handles 402 responses
- Signs and sends STX payments
- Logs payment confirmations

## Expected Output

```
🚀 x402 Payment Client Test

📝 Step 1: Setting up wallet...
✅ Using wallet from env: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

📝 Step 2: Creating payment client...
✅ Client ready

📝 Step 3: Testing payment flow on all endpoints...

🧪 Testing Weather API...
✅ Weather API successful!
   Response: {"city":"Mumbai","temp":72,"condition":"Sunny"...
   💰 Payment confirmed via header

...
```

## Troubleshooting

- **"Payment signing failed"**: Wallet needs testnet STX
- **402 responses**: Normal - client should auto-pay (check wallet balance)
- **Connection refused**: Ensure demo API is running on port 3002
