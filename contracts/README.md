# x402Metrics Smart Contracts

## Provider Registry Contract

**File:** `provider-registry.clar`

### Purpose
Tracks API providers and their payment statistics on the Stacks blockchain.

### Key Features
- ✅ Register API providers with name and endpoint count
- ✅ Record payment events with on-chain verification
- ✅ Track total revenue and payment count per provider
- ✅ Enable/disable providers
- ✅ Query provider stats and payment history

### Functions

**Public Functions:**
- `register-provider` - Register a new API provider
- `record-payment` - Record a successful payment (owner only)
- `set-provider-active` - Enable/disable a provider (owner only)

**Read-Only Functions:**
- `get-provider` - Get provider info by ID
- `get-provider-by-address` - Get provider info by wallet address
- `get-payment-event` - Get payment event details
- `get-provider-count` - Total registered providers
- `get-event-count` - Total payment events

### Deployment Instructions

#### Option 1: Via Hiro Platform (Recommended)
1. Go to https://platform.hiro.so/
2. Create new project
3. Deploy contract → paste `provider-registry.clar` code
4. Deploy to testnet
5. Save contract address

#### Option 2: Via Clarinet CLI
```bash
clarinet contract deploy provider-registry --testnet
```

#### Option 3: Via deployment script
```bash
node deploy-contract.js
```

### Integration with x402Metrics

Once deployed, the backend will:
1. Call `register-provider` when new provider onboards
2. Call `record-payment` after each successful x402 transaction
3. Query `get-provider` for provider analytics
4. Display on-chain stats in dashboard

### Contract Address (Pending Deployment)
```
ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914.x402metrics-provider-registry
```

Verify on: https://explorer.hiro.so/?chain=testnet
