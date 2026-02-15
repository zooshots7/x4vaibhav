# 🔥 x402Metrics

> **Real-Time Analytics Infrastructure for HTTP Payment Protocol**

The Bloomberg Terminal for x402 payments on Stacks blockchain. While others build payment apps, we built the intelligence layer that makes the entire ecosystem visible, measurable, and trustworthy.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://x4vaibhav-lp1o.vercel.app)
[![Blockchain](https://img.shields.io/badge/blockchain-verified-blue)](https://explorer.hiro.so/address/ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914?chain=testnet)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🎯 What is x402Metrics?

x402Metrics is the **first production-ready analytics dashboard** for the HTTP 402 (Payment Required) protocol on Stacks blockchain. We provide real-time payment intelligence, fraud detection, and marketplace analytics for the emerging x402 ecosystem.

**The Problem:** HTTP 402 has been dormant for 28 years. Now it's waking up with x402, but payments are invisible. You don't know who's paying, how much, or for what.

**Our Solution:** Make every micropayment visible, measurable, and actionable — with real-time analytics, fraud detection, and provider leaderboards.

---

## ✨ Features

### 📊 **Real-Time Analytics**
- Live payment tracking with WebSocket updates
- Multi-role filtering (Provider vs Consumer perspectives)
- Revenue breakdown by endpoint, token, and wallet
- Success rate monitoring
- Export functionality (CSV/JSON)

### 🏆 **Provider Leaderboard**
- Gamified rankings by total revenue
- Top 3 medals (🥇🥈🥉)
- Payment count, unique consumers, endpoints tracked
- Animated progress bars
- Real-time updates every 10s

### 🗺️ **Live Transaction Map**
- Global visualization of x402 payments
- Real-time markers with pulse effects
- Top 5 countries by revenue
- Geographic spread analysis
- Click for transaction details

### 🚨 **Enhanced Fraud Detection**
- **3 Pattern Types:**
  - Rapid-fire attacks (>10 payments/minute)
  - Unusual amounts (>1 STX threshold)
  - Failed payment spikes (>5 consecutive failures)
- Severity levels (high/medium/low)
- Affected wallet lists
- Action buttons (Block, Mark Safe, View Details)
- All patterns backed by real blockchain transactions

### ⛓️ **Blockchain Proof**
- **26 real Stacks testnet transactions**
- Every payment links to Stacks explorer
- Wallet: `ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914`
- Total verified: 0.282 STX

### 🎨 **2026 UI Design**
- Glassmorphism with backdrop blur
- Gradient animations
- Glow effects (green/blue/purple/red)
- Shimmer loading states
- 3D card hover effects
- Neon borders

---

## 🚀 Live Demo

**Dashboard:** [https://x4vaibhav-lp1o.vercel.app](https://x4vaibhav-lp1o.vercel.app)

**Blockchain Explorer:** [View Wallet on Stacks](https://explorer.hiro.so/address/ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914?chain=testnet)

### Demo Flow (60 seconds)

1. **Connect Wallet** → Dashboard loads with glassmorphism UI
2. **Analytics Tab** → See 26 real payments, 0.282 STX revenue
3. **Provider View** → Switch roles, see provider-specific metrics
4. **Leaderboard** → Top providers with medals, revenue rankings
5. **Transaction Map** → Global payment visualization
6. **Security Tab** → Fraud patterns with severity levels
7. **Verify Blockchain** → Click any transaction → Stacks explorer

---

## 🏆 Why x402Metrics Wins

### Infrastructure > Applications
We're not another payment app competing with others — we're the **analytics layer** that makes the entire x402 ecosystem work.

### Real Blockchain Proof
- **26 testnet transactions** (not mocks!)
- All verifiable on Stacks explorer
- Real wallet, real STX, real payments

### Technical Excellence
- Clean TypeScript codebase
- Real-time WebSocket updates
- Multi-role filtering
- Production-ready exports

### Visual Impact
- Glassmorphism UI (2026 design trends)
- Animated leaderboards, maps, fraud dashboards
- Professional polish

### Ecosystem Value
- **Enables other projects** instead of competing
- Provider leaderboards drive gamification
- Fraud detection protects everyone
- Analytics make x402 measurable

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Framer Motion |
| **Backend** | Express.js, Socket.io, TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Blockchain** | Stacks L2 (testnet), x402 protocol |
| **Styling** | TailwindCSS 4, Glassmorphism, Custom animations |
| **Real-time** | WebSocket (Socket.io) |
| **Charts** | Recharts, Custom visualizations |

---

## 📸 Screenshots

### Analytics Dashboard
![Analytics Dashboard](docs/screenshots/analytics.png)
*Real-time payment tracking with multi-role filtering*

### Provider Leaderboard
![Provider Leaderboard](docs/screenshots/leaderboard.png)
*Gamified rankings with medals and animated progress bars*

### Live Transaction Map
![Transaction Map](docs/screenshots/map.png)
*Global payment visualization with pulse effects*

### Fraud Detection
![Fraud Dashboard](docs/screenshots/fraud.png)
*Pattern detection with severity levels and action buttons*

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Stacks wallet (Xverse or Leather)
- Supabase account (free tier)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/x402.git
cd x402

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

**Backend** (`backend/.env`):
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run build
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev

# Open http://localhost:3000
```

### Database Setup

1. Create Supabase project
2. Run SQL migration: `docs/database/schema.sql`
3. Add Supabase credentials to `.env`

---

## 📦 Project Structure

```
x402/
├── frontend/              # Next.js dashboard
│   ├── app/              # Next.js 16 app directory
│   ├── components/       # React components
│   │   ├── ProviderLeaderboard.tsx
│   │   ├── TransactionMap.tsx
│   │   ├── FraudDashboard.tsx
│   │   └── ...
│   └── contexts/         # React context providers
├── backend/              # Express API + WebSocket
│   ├── src/
│   │   ├── server.ts    # Main server with 10+ endpoints
│   │   ├── leaderboard.ts
│   │   └── ...
│   └── dist/            # Compiled JavaScript
├── demo-api/            # x402-enabled test API
└── docs/                # Documentation & guides
    ├── progress/        # Development logs
    └── screenshots/     # UI screenshots
```

---

## 🔌 API Endpoints

### Analytics
- `GET /api/stats` - Summary statistics
- `GET /api/payments` - All payments with filters
- `GET /api/summary/realtime` - Real-time metrics

### Provider Features
- `GET /api/leaderboard/providers` - Provider rankings
- `GET /api/map/transactions` - Geographic payment data

### Security
- `GET /api/fraud/patterns` - Fraud detection results

### WebSocket
- `ws://localhost:3001` - Real-time payment updates

---

## 🎬 Demo Video

**Watch the 60-second demo:**

[![x402Metrics Demo](docs/video-thumbnail.png)](https://youtu.be/your-demo-video)

**Script highlights:**
- 0:00 - Problem statement
- 0:15 - Live dashboard walkthrough
- 0:30 - Unique features (leaderboard, map, fraud)
- 0:45 - Blockchain proof
- 0:55 - Call to action

---

## 📊 Current Metrics

| Metric | Value |
|--------|-------|
| **Real Blockchain Transactions** | 26 |
| **Total Revenue Tracked** | 0.282 STX |
| **Fraud Patterns Detected** | 3 |
| **Provider Wallets** | 3 |
| **Unique Consumers** | 6 |
| **Success Rate** | 100% |
| **Multi-Asset Support** | STX, sBTC, USDCx |

---

## 🎯 Competitive Analysis

While other x402 hackathon projects focus on **payment applications** (subscriptions, paywalls, marketplaces), x402Metrics is the **only analytics infrastructure**:

| Project | Type | Our Advantage |
|---------|------|---------------|
| x402Pay, BitSubs, Stacktreon | Payment apps | We enable their analytics |
| The Wire, Shadow Feed | Content paywalls | We track their revenue |
| TragenX, OphirAI | AI marketplaces | We provide fraud detection |
| SWARM, MoltMarket | Agent platforms | We monitor their transactions |

**We're infrastructure, not competition** — every x402 project benefits from us.

---

## 🗺️ Roadmap

### ✅ Completed (Hackathon)
- Real-time analytics dashboard
- Multi-role filtering (provider/consumer)
- Provider leaderboard with gamification
- Live transaction map
- Enhanced fraud detection (3 pattern types)
- Glassmorphism UI
- 26 real blockchain transactions
- WebSocket real-time updates

### 🚧 Post-Hackathon
- Mainnet deployment
- Smart contract integration
- API provider self-service registration
- Advanced fraud ML models
- Payment dispute resolution
- Provider reputation staking
- Multi-chain support (expand beyond Stacks)

---

## 🤝 Contributing

Contributions welcome! This project is built for the x402 ecosystem.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **x402 Protocol Team** - For building HTTP 402 on Stacks
- **Stacks Foundation** - For blockchain infrastructure
- **Supabase** - For real-time database
- **Vercel** - For deployment platform

---

## 📞 Contact

**Built by:** Aviral  
**For:** x402 Stacks Challenge 2026  
**Prize Pool:** $3,000 USD  
**Submission Date:** February 16, 2026

**GitHub:** [https://github.com/zooshots7/x4vaibhav](https://github.com/zooshots7/x4vaibhav)  
**Live Demo:** [https://x4vaibhav-lp1o.vercel.app](https://x4vaibhav-lp1o.vercel.app)  
**Backend API:** [https://x4vaibhav-production.up.railway.app](https://x4vaibhav-production.up.railway.app)

---

<div align="center">

## 🏆 Built for x402 Stacks Challenge 2026

**The Bloomberg Terminal for HTTP Payments**

🔗 **Real Blockchain** | 📊 **Real-Time Analytics** | 🚨 **Real Fraud Detection**

[Live Demo](https://x4vaibhav-lp1o.vercel.app) • [Documentation](docs/) • [Video](#demo-video)

</div>

---

**Status:** ✅ Production Ready | 🔗 Blockchain Verified | 🏆 Ready to Win
