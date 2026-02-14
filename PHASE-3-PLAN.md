# 🚀 PHASE 3: Provider Endpoint Ownership

**Status:** 🟡 IN PROGRESS  
**Goal:** Providers see only THEIR endpoint revenue  
**Time Estimate:** 45 minutes

---

## 🎯 Problem:

Currently:
- Consumers ✅ see only their spending (works!)
- Providers ❌ see ALL revenue (needs fixing)

**Why?** We don't track which wallet owns which endpoint.

---

## 🛠️ Solution:

### Approach A: Add `provider_wallet` to payments table
**Pros:**
- Simple query filtering
- Works immediately with existing data

**Cons:**
- Need to update all webhook calls
- Requires database migration

### Approach B: Create `endpoints` mapping table
**Pros:**
- Cleaner data model
- Easier to manage multiple providers per endpoint

**Cons:**
- More complex queries (JOIN)
- Takes longer to implement

**Decision: Approach A** (faster for hackathon deadline!)

---

## 📋 Implementation Steps:

### 1. Database Update (Supabase)
```sql
-- Add provider_wallet column to payment_events
ALTER TABLE payment_events 
ADD COLUMN provider_wallet TEXT;

-- Backfill existing data with demo providers
UPDATE payment_events 
SET provider_wallet = CASE 
  WHEN endpoint LIKE '%weather%' THEN 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
  WHEN endpoint LIKE '%crypto%' THEN 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG'
  WHEN endpoint LIKE '%ai%' THEN 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN'
  ELSE 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
END;
```

### 2. Backend API Updates
**Files to modify:**
- `backend/src/server.ts`
  - `/api/stats` - Add provider filter
  - `/api/payments/recent` - Add provider filter
  - `/api/analytics/by-endpoint` - Add provider filter

**Changes:**
```typescript
if (wallet && role === 'provider') {
  query = query.eq('provider_wallet', wallet);
}
```

### 3. Demo API Updates
**File:** `demo-api/server.js`

Add provider_wallet to webhook payload:
```javascript
await fetch('http://localhost:3001/webhook/payment', {
  method: 'POST',
  body: JSON.stringify({
    endpoint: req.path,
    amount,
    token,
    sender_address,
    transaction_hash,
    provider_wallet: process.env.PROVIDER_WALLET, // NEW!
    metadata: { ... }
  })
});
```

### 4. Frontend Updates
**File:** `frontend/contexts/AuthContext.tsx`

Improve role detection:
```typescript
// Check if wallet is PROVIDER (receives payments)
const receivedPayments = payments.filter(p => 
  p.provider_wallet === walletAddress
);

// Check if wallet is CONSUMER (sends payments)
const sentPayments = payments.filter(p => 
  p.sender_address === walletAddress
);
```

---

## 🧪 Testing Plan:

### Test 1: Provider sees only THEIR revenue
```bash
curl "http://localhost:3001/api/stats?wallet=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM&role=provider"
# Expected: Only payments to weather endpoints
```

### Test 2: Consumer still works
```bash
curl "http://localhost:3001/api/stats?wallet=ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914&role=consumer"
# Expected: Same as before (6 payments, 0.043 STX)
```

### Test 3: Frontend role detection
1. Connect wallet that's a provider
2. Should show "Viewing as: Provider"
3. Analytics shows only their endpoint revenue

---

## ⚙️ Execution Order:

1. ✅ Create plan (this file)
2. ⏳ Update Supabase schema
3. ⏳ Backfill existing data
4. ⏳ Update backend filters
5. ⏳ Test backend endpoints
6. ⏳ Update role detection (frontend)
7. ⏳ Test full flow
8. ⏳ Document completion

---

## 📊 Demo Providers (for testing):

**Weather Data Pro:**
- Wallet: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`
- Endpoints: `/api/weather`

**Crypto Price Oracle:**
- Wallet: `ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG`
- Endpoints: `/api/crypto-price`, `/api/random-fact`

**AI Text Intelligence:**
- Wallet: `ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN`
- Endpoints: `/api/ai-summary`

---

## ⏱️ Time Allocation:

- Database update: 5 min
- Backend changes: 15 min
- Testing: 10 min
- Role detection: 10 min
- Documentation: 5 min

**Total: ~45 minutes**

---

**Let's go! 🚀**
