# x402Metrics - Code Snippets

Quick copy-paste snippets to accelerate development.

---

## Demo API with x402 Middleware

**File:** `/Users/vaibu/x402/demo-api/server.js`

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { paymentMiddleware } from '@x402/express';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Your Stacks testnet address (replace with yours)
const RECIPIENT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

// x402 Payment Configuration
const paymentConfig = {
  "GET /api/weather": {
    accepts: [
      {
        network: "stacks:testnet",
        scheme: "exact",
        token: "STX",
        amount: "1000000", // 1 STX (in micro-STX)
        recipient: RECIPIENT_ADDRESS,
      }
    ],
    description: "Weather data for any city",
  },
  "GET /api/crypto-price": {
    accepts: [
      {
        network: "stacks:testnet",
        scheme: "exact",
        token: "STX",
        amount: "500000", // 0.5 STX
        recipient: RECIPIENT_ADDRESS,
      }
    ],
    description: "Real-time crypto price data",
  },
  "POST /api/ai-summary": {
    accepts: [
      {
        network: "stacks:testnet",
        scheme: "exact",
        token: "STX",
        amount: "2000000", // 2 STX
        recipient: RECIPIENT_ADDRESS,
      }
    ],
    description: "AI-powered text summarization",
  },
};

// Apply x402 middleware
app.use(paymentMiddleware(paymentConfig, {
  facilitatorUrl: process.env.X402_FACILITATOR_URL,
  onPaymentVerified: async (payment) => {
    // Log payment to backend
    await fetch(`${process.env.BACKEND_URL}/webhook/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: payment.endpoint,
        amount: payment.amount,
        token: payment.token,
        sender: payment.sender,
        txHash: payment.transactionHash,
        timestamp: new Date().toISOString(),
      })
    });
  }
}));

// API Endpoints (protected by x402)
app.get('/api/weather', (req, res) => {
  res.json({
    city: req.query.city || 'San Francisco',
    temp: 68,
    condition: 'Sunny',
    humidity: 65,
  });
});

app.get('/api/crypto-price', (req, res) => {
  res.json({
    BTC: 45000,
    STX: 2.5,
    ETH: 3200,
  });
});

app.post('/api/ai-summary', (req, res) => {
  const { text } = req.body;
  res.json({
    summary: `Summary: ${text.substring(0, 50)}...`,
    wordCount: text.split(' ').length,
  });
});

// Health check (no payment required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.DEMO_API_PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Demo API running on http://localhost:${PORT}`);
  console.log(`💰 x402 payments enabled on Stacks testnet`);
});
```

---

## Backend Payment Webhook

**File:** `/Users/vaibu/x402/backend/src/server.ts`

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import { supabase, PaymentEvent } from './supabase';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'x402Metrics API is running' });
});

// Payment webhook (called by demo API)
app.post('/webhook/payment', async (req, res) => {
  try {
    const { endpoint, amount, token, sender, txHash, timestamp } = req.body;
    
    // Insert into database
    const { data, error } = await supabase
      .from('payment_events')
      .insert({
        endpoint,
        amount: parseFloat(amount),
        token,
        status: 'success',
        sender_address: sender,
        transaction_hash: txHash,
        api_key: req.headers['x-api-key'] || 'demo-api',
        metadata: { timestamp }
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Emit real-time event
    io.emit('new-payment', {
      id: data.id,
      endpoint: data.endpoint,
      amount: data.amount,
      token: data.token,
      status: data.status,
      timestamp: data.created_at
    });
    
    console.log('💰 Payment logged:', data.id);
    res.json({ success: true, paymentId: data.id });
    
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analytics: Overall stats
app.get('/api/stats', async (req, res) => {
  try {
    const { data: payments } = await supabase
      .from('payment_events')
      .select('amount, token, status');
    
    const totalRevenue = payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    const totalPayments = payments.length;
    const successfulPayments = payments.filter(p => p.status === 'success').length;
    const successRate = totalPayments > 0 
      ? (successfulPayments / totalPayments * 100).toFixed(2) 
      : 0;
    
    res.json({
      totalRevenue,
      totalPayments,
      successfulPayments,
      successRate: parseFloat(successRate),
      avgPayment: totalPayments > 0 ? (totalRevenue / successfulPayments).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics: Recent payments
app.get('/api/payments/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    
    const { data, error } = await supabase
      .from('payment_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics: By token
app.get('/api/analytics/by-token', async (req, res) => {
  try {
    const { data } = await supabase
      .from('payment_events')
      .select('token, amount')
      .eq('status', 'success');
    
    const byToken = data.reduce((acc, p) => {
      acc[p.token] = (acc[p.token] || 0) + parseFloat(p.amount);
      return acc;
    }, {});
    
    res.json(byToken);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics: By endpoint
app.get('/api/analytics/by-endpoint', async (req, res) => {
  try {
    const { data } = await supabase
      .from('payment_events')
      .select('endpoint, amount')
      .eq('status', 'success');
    
    const byEndpoint = data.reduce((acc, p) => {
      if (!acc[p.endpoint]) {
        acc[p.endpoint] = { count: 0, revenue: 0 };
      }
      acc[p.endpoint].count += 1;
      acc[p.endpoint].revenue += parseFloat(p.amount);
      return acc;
    }, {});
    
    res.json(byEndpoint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 x402Metrics Backend v1.0.0`);
});

export { io };
```

---

## Frontend Dashboard

**File:** `/Users/vaibu/x402/frontend/app/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Payment {
  id: string;
  endpoint: string;
  amount: number;
  token: string;
  status: string;
  timestamp: string;
}

interface Stats {
  totalRevenue: number;
  totalPayments: number;
  successRate: number;
  avgPayment: number;
}

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalPayments: 0,
    successRate: 0,
    avgPayment: 0
  });

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001');
    
    newSocket.on('connect', () => {
      console.log('✅ Connected to backend');
      setConnected(true);
      fetchInitialData();
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from backend');
      setConnected(false);
    });

    newSocket.on('new-payment', (payment: Payment) => {
      console.log('💰 New payment:', payment);
      setPayments(prev => [payment, ...prev]);
      fetchStats();
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const [statsRes, paymentsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/recent?limit=20`)
      ]);
      
      const statsData = await statsRes.json();
      const paymentsData = await paymentsRes.json();
      
      setStats(statsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            x402Metrics
          </h1>
          <p className="text-slate-400 mt-2">
            Real-time analytics for x402 payments on Stacks
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-slate-400">
              {connected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-slate-400 text-sm mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold">{stats.totalRevenue.toFixed(2)} STX</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-slate-400 text-sm mb-2">Total Payments</h3>
            <p className="text-3xl font-bold">{stats.totalPayments}</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-slate-400 text-sm mb-2">Success Rate</h3>
            <p className="text-3xl font-bold">{stats.successRate}%</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-slate-400 text-sm mb-2">Avg Payment</h3>
            <p className="text-3xl font-bold">{stats.avgPayment} STX</p>
          </div>
        </div>

        {/* Live Payment Feed */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Live Payment Feed
            {connected && <span className="text-xs text-green-400">(Live)</span>}
          </h2>
          
          {payments.length === 0 ? (
            <p className="text-slate-500">No payments yet... Make a test payment to see it here!</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-500 transition-colors">
                  <div className="flex-1">
                    <p className="font-mono text-sm text-purple-400">{payment.endpoint}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(payment.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{payment.amount} {payment.token}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Stacks Testnet Wallet Setup

```typescript
// utils/wallet.ts
import { 
  makeContractCall, 
  broadcastTransaction,
  AnchorMode,
  PostConditionMode
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

const network = new StacksTestnet();

export async function makePayment(
  recipientAddress: string,
  amount: number, // in micro-STX
  senderKey: string
) {
  const txOptions = {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'stx-transfer',
    functionName: 'transfer',
    functionArgs: [/* ... */],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  return broadcastResponse.txid;
}
```

---

## Quick Test Script

```bash
#!/bin/bash
# test-payment.sh

echo "Making test payment to x402 demo API..."

curl -X GET http://localhost:3002/api/weather?city=London \
  -H "Content-Type: application/json" \
  -H "PAYMENT-SIGNATURE: <base64-encoded-payment-signature>"

echo "\nCheck dashboard at http://localhost:3000"
```

---

## Docker Compose (Optional)

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - STACKS_NETWORK=testnet
    depends_on:
      - demo-api

  demo-api:
    build: ./demo-api
    ports:
      - "3002:3002"
    environment:
      - X402_FACILITATOR_URL=${X402_FACILITATOR_URL}
      - BACKEND_URL=http://backend:3001

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_WS_URL=http://localhost:3001
      - NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

Use these snippets as starting points. Adjust as needed!
