# 🔧 TROUBLESHOOTING GUIDE - x402Metrics

**Common issues and how to fix them**

---

## ❌ Issue: "node client.js" fails with payment error

### Symptoms:
```
❌ Payment failed: Invalid signature
OR
❌ Payment failed: Insufficient funds
OR
❌ Payment failed: Transaction not confirmed
```

### Solution:

**Step 1: Check wallet balance**
```bash
./check-balance.sh
```
Expected: Balance > 0 STX

**Step 2: Verify private key in .env**
```bash
cd test-client
cat .env
```
Should show:
```
STACKS_PRIVATE_KEY=your_hex_private_key_here
```

**Step 3: Test wallet address derivation**
```bash
node -e "const {privateKeyToAccount} = require('x402-stacks'); console.log(privateKeyToAccount('YOUR_KEY_HERE', 'testnet'));"
```

**Step 4: Check network**
Make sure STACKS_NETWORK=testnet in all .env files

---

## ❌ Issue: 402 response but payment doesn't go through

### Symptoms:
- Gets 402 Payment Required ✅
- Client tries to sign transaction ✅
- But payment never confirms ❌

### Solution:

**Check facilitator URL:**
```bash
# In demo-api/.env
echo $X402_FACILITATOR_URL
```
Should be: `https://facilitator.stacksx402.com` or `https://x402-backend-7eby.onrender.com`

**Test facilitator is reachable:**
```bash
curl https://facilitator.stacksx402.com/supported
```
Should return JSON with supported networks.

**Check demo API logs:**
Look for:
```
✅ Payment received from: ST1...
💰 Transaction: 0xabc...
```

If you see "Payment signing failed", check private key permissions.

---

## ❌ Issue: Dashboard shows no payments

### Symptoms:
- Servers are running ✅
- Made test payment ✅
- But dashboard is empty ❌

### Solution:

**Step 1: Check backend is running**
```bash
curl http://localhost:3001/api/analytics/stats
```
Should return: `{ totalRevenue: X, ... }`

**Step 2: Check Supabase connection**
```bash
cd backend
cat .env | grep SUPABASE
```
Should have SUPABASE_URL and SUPABASE_KEY

**Step 3: Check database has data**
Go to: https://supabase.com → Your project → Table Editor → payment_events

Should show rows.

**Step 4: Check Socket.io connection**
Open browser console on http://localhost:3000
Should see: `Socket.io connected`

**Step 5: Force refresh**
In dashboard, check Network tab → WebSocket → Should show active connection

---

## ❌ Issue: Socket.io not connecting

### Symptoms:
```
Console: Socket.io connection failed
OR
Dashboard doesn't update in real-time
```

### Solution:

**Check CORS settings in backend:**
```javascript
// backend/src/server.ts
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Must match frontend URL
    methods: ["GET", "POST"]
  }
});
```

**Check frontend backend URL:**
```javascript
// frontend/app/page.tsx
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
```

**Check ports:**
- Backend should be on port 3001
- Frontend should be on port 3000
- Demo API should be on port 3002

---

## ❌ Issue: Animations not working

### Symptoms:
- Cards don't fade in
- Numbers don't count up
- No smooth transitions

### Solution:

**Check Framer Motion installed:**
```bash
cd frontend
npm list framer-motion
```
Should show version.

**Check component imports:**
```tsx
import { motion } from 'framer-motion';
```

**Check 'use client' directive:**
All animated components need `'use client';` at the top.

**Check browser console:**
Look for React hydration errors or motion-related warnings.

---

## ❌ Issue: Tailwind classes not working

### Symptoms:
- Glassmorphism not showing
- Colors are wrong
- Layout is broken

### Solution:

**Rebuild Tailwind:**
```bash
cd frontend
npm run dev
```

**Check tailwind.config.js:**
```javascript
content: [
  "./app/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
]
```

**Check colors are defined:**
Look for `primary`, `success`, `dark` in extend.colors

**Force clear cache:**
```bash
rm -rf .next
npm run dev
```

---

## ❌ Issue: Toast notifications not appearing

### Symptoms:
- Payment goes through ✅
- Dashboard updates ✅
- But no toast notification ❌

### Solution:

**Check react-hot-toast installed:**
```bash
npm list react-hot-toast
```

**Check Toaster component in layout:**
```tsx
// app/layout.tsx
import { Toaster } from 'react-hot-toast';

// In JSX
<Toaster position="top-right" {...} />
```

**Check toast is called in Socket.io listener:**
```tsx
socket.on('payment', (payment) => {
  toast.success(`Payment received: ...`);
});
```

**Test manually:**
```tsx
import toast from 'react-hot-toast';

// In component
<button onClick={() => toast.success('Test')}>
  Test Toast
</button>
```

---

## ❌ Issue: Charts not rendering

### Symptoms:
- Chart area is blank
- Console shows Recharts error

### Solution:

**Check Recharts installed:**
```bash
npm list recharts
```

**Check data format:**
```tsx
// Must be array of objects
const data = [
  { time: '0h', amount: 0.005 },
  { time: '2h', amount: 0.012 },
  // ...
];
```

**Check ResponsiveContainer:**
```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    {/* ... */}
  </AreaChart>
</ResponsiveContainer>
```

**Force height on container:**
```tsx
<div className="h-[300px]">
  <RevenueChart data={data} />
</div>
```

---

## ❌ Issue: Deployment fails

### Symptoms:
- Local works ✅
- Deploy fails on Vercel/Railway ❌

### Solution:

**Vercel (Frontend):**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node Version: 20.x

**Check environment variables:**
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
```

**Railway (Backend):**
- Start Command: `npm run dev` or `node dist/server.js`
- Check environment variables are set
- Check port is dynamic: `process.env.PORT || 3001`

**Common fix:**
```javascript
// backend/src/server.ts
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## ❌ Issue: "Cannot find module" errors

### Symptoms:
```
Error: Cannot find module 'framer-motion'
OR
Error: Cannot find module './components/GlassCard'
```

### Solution:

**Reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Check import paths:**
```tsx
// Relative imports need correct path
import GlassCard from '../components/GlassCard';

// Not './GlassCard' unless in same folder
```

**Check file extensions:**
TypeScript files must be `.tsx` for JSX components

**Restart dev server:**
```bash
# Kill all processes
pkill -f "next dev"

# Restart
npm run dev
```

---

## ❌ Issue: Payments work but not tracked in dashboard

### Symptoms:
- Payment succeeds on blockchain ✅
- Demo API receives payment ✅
- Backend webhook never called ❌

### Solution:

**Check demo-api/server.js notifyBackend function:**
```javascript
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function notifyBackend(endpoint, amount, payment) {
  const response = await fetch(`${BACKEND_URL}/webhook/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ... })
  });
}
```

**Check it's being called:**
Add console.log before fetch:
```javascript
console.log('💰 Notifying backend:', endpoint, amount);
```

**Check backend receives webhook:**
In backend logs, should see:
```
💰 Payment webhook received
```

**Test webhook manually:**
```bash
curl -X POST http://localhost:3001/webhook/payment \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"/api/test","amount":"0.005","token":"STX","payer":"ST1...","txHash":"0xabc","timestamp":"2026-02-12T00:00:00Z"}'
```

---

## 🆘 Still Stuck?

### Debug Checklist:
1. [ ] All 3 servers running (demo-api, backend, frontend)
2. [ ] Wallet has testnet STX
3. [ ] Private key in test-client/.env
4. [ ] Supabase credentials in backend/.env
5. [ ] No console errors in browser
6. [ ] No errors in terminal logs
7. [ ] Tried restarting everything
8. [ ] Cleared cache and rebuilt

### Get Help:
- Check GitHub Issues
- Review x402-stacks package docs
- Test with `simulate-payments.js` first
- Check Stacks Explorer for tx status

---

## 🔍 Debug Commands Reference

**Check wallet balance:**
```bash
./check-balance.sh
```

**Test 402 response:**
```bash
curl http://localhost:3002/api/weather
```

**Check backend health:**
```bash
curl http://localhost:3001/health
```

**Check Supabase data:**
```bash
curl http://localhost:3001/api/analytics/stats
```

**Test Socket.io:**
Open browser console → Network → WS → Should show connection

**View logs:**
```bash
# Backend
tail -f backend/logs/app.log

# Demo API
# Check terminal where it's running

# Frontend
# Check browser console
```

---

**Most issues are environment variables or wallet configuration. Double-check those first! 🔧**
