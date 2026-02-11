# x402Metrics - Hackathon Action Plan

**Deadline:** Feb 16, 2026 (5 days!)  
**Prize:** $3,000 USD  

---

## ✅ What's Done

- [x] Database schema (payment_events, api_keys)
- [x] Basic frontend structure (Next.js + Socket.io)
- [x] Basic backend structure (Express + Socket.io)
- [x] Supabase integration
- [x] Research completed

---

## 🎯 What We Need to Build

### Phase 1: Core x402 Integration (Days 1-2)

#### Task 1.1: Install Dependencies
```bash
cd /Users/vaibu/x402

# Backend
cd backend
npm install @x402/core @x402/express @stacks/transactions @stacks/network

# Demo API
cd ../demo-api
npm install @x402/core @x402/express @stacks/transactions @stacks/network
```

#### Task 1.2: Create Demo API with x402 Middleware
**File:** `/Users/vaibu/x402/demo-api/server.js`

Create 3-4 endpoints:
- `GET /api/weather` - Weather data (1 STX)
- `GET /api/crypto-price` - Crypto prices (0.5 STX)
- `POST /api/ai-summary` - AI text summary (2 STX)
- `GET /api/random-fact` - Random fact (0.1 STX)

Each endpoint should:
1. Use `@x402/express` paymentMiddleware
2. Accept STX/sBTC/USDCx on Stacks testnet
3. Return useful data

#### Task 1.3: Implement Payment Capture
**File:** `/Users/vaibu/x402/backend/src/server.ts`

1. Create POST `/webhook/payment` endpoint
2. Parse x402 payment data
3. Insert into Supabase `payment_events` table
4. Emit Socket.io event `'new-payment'`

#### Task 1.4: Test Payment Flow
1. Get Stacks testnet tokens (faucet: https://explorer.hiro.so/sandbox/faucet)
2. Create test wallet
3. Make payment to demo API
4. Verify it appears in database

---

### Phase 2: Real-Time Analytics (Days 2-3)

#### Task 2.1: Backend Analytics Endpoints
**File:** `/Users/vaibu/x402/backend/src/server.ts`

Create endpoints:
- `GET /api/stats` - Overall stats (total revenue, payment count, success rate)
- `GET /api/payments/recent` - Last 50 payments
- `GET /api/analytics/by-token` - Revenue by token (STX/sBTC/USDCx)
- `GET /api/analytics/by-endpoint` - Revenue by endpoint
- `GET /api/analytics/timeline` - Hourly/daily payment timeline

Use Supabase queries:
```javascript
// Total revenue by token
const { data } = await supabase
  .from('payment_events')
  .select('token, amount')
  .eq('status', 'success');

// Group and sum
const revenue = data.reduce((acc, p) => {
  acc[p.token] = (acc[p.token] || 0) + parseFloat(p.amount);
  return acc;
}, {});
```

#### Task 2.2: Frontend Dashboard Components
**File:** `/Users/vaibu/x402/frontend/app/page.tsx`

Create components:
1. **Stats Cards** (replace placeholders)
   - Total Revenue (sum all payments)
   - Total Payments (count)
   - Success Rate (%)
   - Average Payment

2. **Live Payment Feed**
   - Real-time list of payments
   - Show: time, endpoint, amount, token, status
   - Auto-scroll to top on new payment

3. **Revenue Chart** (Recharts)
   - Line chart: payments over time
   - Bar chart: revenue by token
   - Pie chart: endpoint distribution

4. **Token Distribution**
   - Donut chart showing STX vs sBTC vs USDCx

#### Task 2.3: Socket.io Real-Time Updates
**Backend:**
```javascript
// Emit when payment received
io.emit('new-payment', {
  id: payment.id,
  endpoint: payment.endpoint,
  amount: payment.amount,
  token: payment.token,
  status: payment.status,
  timestamp: payment.created_at
});
```

**Frontend:**
```javascript
socket.on('new-payment', (payment) => {
  setPayments(prev => [payment, ...prev]);
  // Update stats
  // Trigger animation
  // Optional: play sound
});
```

---

### Phase 3: Polish & Deploy (Days 4-5)

#### Task 3.1: UI Polish
- [ ] Add loading states
- [ ] Add error handling
- [ ] Smooth animations (framer-motion?)
- [ ] Mobile responsive
- [ ] Dark mode perfection
- [ ] Add logo/branding

#### Task 3.2: Demo Experience
**Create:** `/Users/vaibu/x402/frontend/app/demo/page.tsx`

- One-click "Make Test Payment" button
- Pre-funded wallet integration
- Shows payment flow step-by-step
- Dashboard updates in real-time

#### Task 3.3: Documentation
**Create:** `/Users/vaibu/x402/HACKATHON.md`

Include:
- Project description
- Architecture diagram
- Setup instructions
- Demo video embed
- Technical details
- Team info

#### Task 3.4: Deploy
1. **Frontend → Vercel**
   ```bash
   cd frontend
   vercel --prod
   ```

2. **Backend → Railway/Render**
   - Connect GitHub repo
   - Set environment variables
   - Deploy

3. **Test deployed version**
   - Make test payment
   - Verify dashboard updates
   - Check all features work

#### Task 3.5: Video Demo (3-5 minutes)
Record showing:
1. **Intro** (15s) - What is x402Metrics?
2. **Problem** (30s) - Why developers need this
3. **Demo** (2-3min)
   - Show demo API endpoints
   - Make x402 payment (live!)
   - Dashboard updates in real-time
   - Show analytics features
4. **Tech Stack** (30s) - How it's built
5. **Future** (30s) - What's next?

Tools: Loom, QuickTime, or OBS

#### Task 3.6: Submit to DoraHacks
Go to: https://dorahacks.io/hackathon/x402-stacks/buidl

Fill out:
- Project name: x402Metrics
- Description
- GitHub repo
- Live demo URL
- Video URL
- Category tags

---

## 🛠️ Technical Details

### Environment Setup
**Backend `.env`:**
```bash
SUPABASE_URL=https://unwpwnxdvqviqbojtafa.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STACKS_NETWORK=testnet
STACKS_API_URL=https://api.testnet.hiro.so
X402_FACILITATOR_URL=https://facilitator.stacksx402.com
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local`:**
```bash
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Stacks Testnet Setup
1. **Get testnet STX:**
   - https://explorer.hiro.so/sandbox/faucet
   - Paste your Stacks address
   - Receive test STX

2. **Wallet options:**
   - Hiro Wallet (browser extension)
   - Xverse Wallet
   - Or programmatic wallet with @stacks/connect

### x402 Payment Flow
```
Client → GET /api/weather
Server → 402 Payment Required + payment details
Client → Creates signed Stacks transaction
Client → GET /api/weather + PAYMENT-SIGNATURE header
Server → Verifies with facilitator
Server → Settles on Stacks blockchain
Server → 200 OK + weather data
Server → Logs to database + emits Socket.io event
Dashboard → Updates in real-time
```

---

## 📊 Success Metrics

### Must-Have (MVP)
- [ ] x402 payments work on Stacks testnet
- [ ] Payments logged to database
- [ ] Dashboard shows real-time payments
- [ ] Basic analytics (revenue, count, success rate)
- [ ] Deployed and accessible
- [ ] Video demo recorded

### Nice-to-Have (If Time)
- [ ] API key management UI
- [ ] Advanced filtering (date range, token, endpoint)
- [ ] Export CSV/JSON
- [ ] Webhook notifications
- [ ] Multi-currency display (USD conversion)
- [ ] Historical charts (7-day, 30-day)

---

## 🚀 Daily Schedule

### Day 1 (Feb 11 - Today)
**Goal:** Get x402 payments working
- Morning: Install deps, create demo API
- Afternoon: Implement x402 middleware, test payments
- Evening: Payment capture + database logging

### Day 2 (Feb 12)
**Goal:** Build analytics
- Morning: Backend analytics endpoints
- Afternoon: Frontend dashboard components
- Evening: Socket.io real-time updates

### Day 3 (Feb 13)
**Goal:** Polish and deploy
- Morning: UI polish, animations
- Afternoon: Deploy to production
- Evening: Test deployed version

### Day 4 (Feb 14)
**Goal:** Documentation and demo
- Morning: Write docs, create demo page
- Afternoon: Record video
- Evening: Prepare submission

### Day 5 (Feb 15)
**Goal:** Submit and buffer
- Morning: Final testing
- Afternoon: Submit to DoraHacks
- Evening: Buffer for fixes

---

## 💡 Pro Tips

1. **Start simple** - Get payment flow working first, then add features
2. **Test early, test often** - Don't wait until deployment
3. **Use testnet** - Stacks testnet is free and fast
4. **Keep video short** - 3-5 minutes max, judges watch many
5. **Show, don't tell** - Live demo > screenshots
6. **Deploy early** - Don't deploy on last day
7. **Document as you go** - Don't wait until end

---

## 🆘 If Stuck

### x402 Issues
- Check examples: https://github.com/coinbase/x402/tree/main/examples
- x402 Discord: https://discord.gg/cdp
- Docs: https://docs.cdp.coinbase.com/x402/welcome

### Stacks Issues
- Hiro docs: https://docs.hiro.so/
- Stacks Discord: https://discord.gg/stacks
- API explorer: https://explorer.hiro.so/

### General
- Ask in DoraHacks Discord
- Check past hackathon winners for inspiration
- Simplify scope if running out of time

---

## 🎯 Remember

**Working demo > Perfect code**

Better to have a simple, working project than a complex, broken one.

Let's win this! 🔥
