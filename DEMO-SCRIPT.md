# 🎥 DEMO VIDEO SCRIPT - x402Metrics

**Total Duration:** ~5 minutes  
**Goal:** Show real blockchain payments + beautiful dashboard

---

## 🎬 SCENE 1: Intro (30 seconds)

**Visual:** Dashboard homepage with animated stats

**Script:**
> "Hey everyone! This is x402Metrics — a real-time analytics dashboard for x402-enabled APIs on the Stacks blockchain.
>
> While most payment analytics tools are centralized and opaque, x402Metrics leverages blockchain transparency to give API providers instant, verifiable insights into every transaction.
>
> Let me show you how it works."

**On Screen:**
- Dashboard with glassmorphic cards
- Animated stat numbers counting up
- Live pulse indicator

---

## 🎬 SCENE 2: The Problem (45 seconds)

**Visual:** Switch to slides or text overlay

**Script:**
> "With the x402 protocol, APIs can now charge per request using blockchain micropayments. But providers need a way to track these payments in real-time.
>
> Traditional analytics require trusting a third party. With x402Metrics, every payment is verified on the Stacks blockchain and displayed instantly.
>
> Let's see it in action."

**On Screen:**
- Text: "HTTP 402 Payment Required"
- Text: "Blockchain-verified"
- Text: "Real-time updates"

---

## 🎬 SCENE 3: Show 402 Response (1 minute)

**Visual:** Terminal with curl command

**Script:**
> "Here's a payment-protected API endpoint. When I call it without payment, I get HTTP 402 — Payment Required.
>
> Notice the response includes payment requirements: the amount (0.005 STX), recipient address, and network (Stacks testnet)."

**Commands:**
```bash
# Show in terminal
curl http://your-api.com/api/weather

# Response shows 402 with payment requirements
```

**On Screen:**
- Terminal showing 402 response
- Highlight payment amount
- Highlight recipient address

---

## 🎬 SCENE 4: Real Payment Flow (1.5 minutes) ⭐ KEY SCENE

**Visual:** Split screen - terminal + dashboard

**Script:**
> "Now let's make a real payment. I'm using the x402-stacks client which handles the entire flow automatically.
>
> Watch what happens:
> 1. Client requests the endpoint
> 2. Gets 402 Payment Required
> 3. Signs a Stacks transaction with my private key
> 4. Sends the signed transaction to the facilitator
> 5. Facilitator broadcasts to the blockchain and waits for confirmation
> 6. Server returns the data along with the transaction hash
>
> And here's the magic — the transaction is REAL. You can click this link and see it on the Stacks blockchain explorer."

**Commands:**
```bash
cd test-client
node client.js

# Wait for output showing tx hash
```

**On Screen:**
- Terminal showing payment flow
- Dashboard updating in real-time
- Toast notification appearing
- New payment card sliding in
- **CLICK THE TX HASH LINK** → Show Stacks Explorer

**CRITICAL:** Must show the transaction on explorer.hiro.so!

---

## 🎬 SCENE 5: Dashboard Tour (2 minutes)

**Visual:** Navigate dashboard slowly

### 5A: Stats Overview (30s)
**Script:**
> "The dashboard shows four key metrics at the top:
> - Total revenue earned from all API calls
> - Total number of payments processed
> - Success rate (all payments confirmed on-chain)
> - Average payment amount
>
> Notice how the numbers animate smoothly when data updates."

**On Screen:**
- Hover over stat cards (they lift up)
- Show trend indicators

### 5B: Real-Time Feed (45s)
**Script:**
> "The live payment feed shows every transaction as it happens. Each card includes:
> - The endpoint that was called
> - Payment amount and token type
> - When it happened
> - The payer's address
> - And most importantly — a clickable link to verify the transaction on the blockchain
>
> This transparency is only possible because everything is on-chain."

**On Screen:**
- Scroll through payment cards
- Hover over a card
- Click a transaction link (optional)

### 5C: Charts & Analytics (45s)
**Script:**
> "The revenue chart shows payment trends over time. You can see when API usage is highest and track growth patterns.
>
> Everything updates in real-time through WebSocket connections. When a new payment comes in, you see it instantly with a toast notification."

**On Screen:**
- Show animated chart
- Trigger a test payment (if possible)
- Toast notification appears

---

## 🎬 SCENE 6: Tech Stack (30 seconds)

**Visual:** Switch to code or architecture diagram

**Script:**
> "Under the hood, x402Metrics uses:
> - x402-stacks middleware for payment verification
> - Stacks blockchain for transaction settlement
> - Supabase for analytics storage
> - Socket.io for real-time updates
> - And Next.js with Framer Motion for the slick UI you're seeing
>
> The entire stack is production-ready and deployed."

**On Screen:**
- Show file structure or diagram
- Or show key code snippets

---

## 🎬 SCENE 7: Why It Matters (30 seconds)

**Visual:** Back to dashboard

**Script:**
> "x402Metrics solves a critical problem for the emerging pay-per-request economy.
>
> API providers get instant insights with blockchain-level transparency.
> Payers can verify their payments were received.
> And everything is trustless — no intermediaries needed.
>
> This is what makes x402 powerful: HTTP-native payments that are as easy to verify as they are to make."

---

## 🎬 SCENE 8: Outro (30 seconds)

**Visual:** Dashboard homepage

**Script:**
> "That's x402Metrics — real-time analytics for the x402 payment protocol on Stacks.
>
> The code is open source on GitHub. The demo is live. And every transaction you saw was verified on the blockchain.
>
> Thanks for watching! If you have questions, drop them in the comments or check out the repo."

**On Screen:**
- Show GitHub repo URL
- Show live demo URL
- Show "Made for x402 Stacks Challenge 2026"

**Fade out with project name and logo**

---

## 📝 RECORDING TIPS

### Before Recording:
1. ✅ Have 3+ test payments already in dashboard (looks more impressive)
2. ✅ Close unnecessary tabs/windows
3. ✅ Set terminal font size to 16pt (readable in video)
4. ✅ Test your mic (clear audio is critical)
5. ✅ Have your script open on another screen
6. ✅ Do a dry run first

### During Recording:
1. **Speak slowly and clearly** (you can speed up in editing)
2. **Pause between sections** (easier to edit)
3. **Use your mouse to guide attention** (circle important parts)
4. **Don't rush the blockchain verification** (this is the proof!)
5. **If you mess up, pause and restart that section** (edit later)

### Screen Recording Settings:
- **Resolution:** 1920x1080 (Full HD)
- **Frame Rate:** 30 fps
- **Audio:** Record voiceover separately for better quality
- **Cursor:** Show cursor (helps viewers follow along)
- **Zoom:** Use zoom-in effects for important parts (terminal output, tx hash)

---

## 🎨 EDITING CHECKLIST

- [ ] Add intro slide with project name
- [ ] Background music (low volume, no lyrics)
- [ ] Text overlays for key points
- [ ] Zoom in on terminal outputs
- [ ] Speed up slow parts (waiting for blockchain)
- [ ] Add arrows/circles to highlight important areas
- [ ] Smooth transitions between scenes
- [ ] Outro slide with links
- [ ] Export at 1080p, 30fps
- [ ] Upload to YouTube (unlisted or public)

---

## 🎯 KEY MOMENTS TO EMPHASIZE

1. **402 Response** - Show the JSON clearly
2. **Transaction Hash** - MUST be visible and clickable
3. **Blockchain Explorer** - Actually show the tx on explorer.hiro.so
4. **Real-Time Update** - Show dashboard updating when payment arrives
5. **Smooth Animations** - Let cards animate in, don't skip

---

## 📱 ALTERNATIVE: Short Version (2 mins)

If you want a quick demo:

1. **Intro (15s)** - What is x402Metrics
2. **Payment Demo (60s)** - Show payment + tx hash + explorer
3. **Dashboard Tour (30s)** - Quick walkthrough
4. **Outro (15s)** - Links and thank you

---

## 🚨 COMMON MISTAKES TO AVOID

❌ Talking too fast
❌ Skipping the blockchain verification step
❌ Not showing the tx hash is clickable
❌ Dashboard with no data (looks empty)
❌ Poor audio quality
❌ Screen resolution too low
❌ Not explaining what x402 is
❌ Going over 6 minutes (judges lose interest)

---

## ✅ FINAL CHECKLIST

Before uploading:
- [ ] Video is under 6 minutes
- [ ] Shows REAL blockchain transaction
- [ ] Audio is clear
- [ ] Screen is readable (text not too small)
- [ ] Intro explains what the project does
- [ ] Shows the dashboard in action
- [ ] Links are in description
- [ ] Thumbnail is compelling
- [ ] Title is clear: "x402Metrics: Real-Time Analytics for x402 Payments on Stacks"

---

**You got this! Make it engaging, show the REAL blockchain tx, and let the UI shine! 🎥✨**
