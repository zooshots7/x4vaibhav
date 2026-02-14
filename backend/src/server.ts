import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import { supabase, PaymentEvent } from './supabase';
import { calculateCreditScore, detectFraud } from './credit-scoring';
import { Provider, ProviderEndpoint, calculateRevenueSplit, ENDPOINT_CATEGORIES } from './providers';

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

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'x402Metrics Backend v1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Payment webhook - called by demo API when payment succeeds
app.post('/webhook/payment', async (req, res) => {
  try {
    const { endpoint, amount, token, payer, txHash, timestamp, sender_address, transaction_hash, status = 'success', metadata } = req.body;
    
    // Support both naming conventions
    const finalPayer = sender_address || payer;
    const finalTxHash = transaction_hash || txHash || 'pending';
    
    console.log('💰 Payment webhook received:', {
      endpoint,
      amount,
      token,
      payer: finalPayer?.substring(0, 10) + '...',
      tx: finalTxHash.substring(0, 20) + '...'
    });
    
    // Insert into Supabase
    const { data, error} = await supabase
      .from('payment_events')
      .insert({
        endpoint,
        amount: parseFloat(amount),
        token,
        status,
        sender_address: finalPayer,
        transaction_hash: finalTxHash,
        api_key: 'real-blockchain-payment',
        metadata: metadata || { 
          timestamp: timestamp || new Date().toISOString(),
          webhook_received: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log('✅ Payment logged to database:', data.id);
    
    // Emit real-time event to dashboard
    io.emit('new-payment', {
      id: data.id,
      endpoint: data.endpoint,
      amount: data.amount,
      token: data.token,
      status: data.status,
      payer: payer?.substring(0, 10) + '...',
      timestamp: data.created_at
    });
    
    res.json({ 
      success: true, 
      paymentId: data.id,
      message: 'Payment logged successfully'
    });
    
  } catch (error: any) {
    console.error('💥 Payment webhook error:', error);
    res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
});

// Analytics: Overall stats
app.get('/api/stats', async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payment_events')
      .select('amount, token, status');
    
    if (error) throw error;
    
    const successfulPayments = payments?.filter(p => p.status === 'success') || [];
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    const totalPayments = payments?.length || 0;
    const successRate = totalPayments > 0 
      ? ((successfulPayments.length / totalPayments) * 100).toFixed(2) 
      : '0';
    
    res.json({
      totalRevenue: totalRevenue.toFixed(6),
      totalPayments,
      successfulPayments: successfulPayments.length,
      successRate: parseFloat(successRate),
      avgPayment: successfulPayments.length > 0 
        ? (totalRevenue / successfulPayments.length).toFixed(6) 
        : '0'
    });
  } catch (error: any) {
    console.error('Stats error:', error);
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
    res.json(data || []);
  } catch (error: any) {
    console.error('Recent payments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analytics: By token
app.get('/api/analytics/by-token', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payment_events')
      .select('token, amount')
      .eq('status', 'success');
    
    if (error) throw error;
    
    const byToken = (data || []).reduce((acc: any, p) => {
      acc[p.token] = (acc[p.token] || 0) + parseFloat(p.amount.toString());
      return acc;
    }, {});
    
    res.json(byToken);
  } catch (error: any) {
    console.error('By token error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analytics: By endpoint
app.get('/api/analytics/by-endpoint', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payment_events')
      .select('endpoint, amount')
      .eq('status', 'success');
    
    if (error) throw error;
    
    const byEndpoint = (data || []).reduce((acc: any, p) => {
      if (!acc[p.endpoint]) {
        acc[p.endpoint] = { count: 0, revenue: 0 };
      }
      acc[p.endpoint].count += 1;
      acc[p.endpoint].revenue += parseFloat(p.amount.toString());
      return acc;
    }, {});
    
    res.json(byEndpoint);
  } catch (error: any) {
    console.error('By endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== CREDIT BUREAU ENDPOINTS ====================

// Get top agents by credit score (MUST BE BEFORE /:address route)
app.get('/api/credit/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Get all unique addresses
    const { data: payments, error } = await supabase
      .from('payment_events')
      .select('sender_address')
      .not('sender_address', 'is', null);
    
    if (error) throw error;
    
    const addresses = [...new Set(payments?.map(p => p.sender_address) || [])];
    
    // Calculate scores for each
    const scores = [];
    for (const address of addresses) {
      const { data: agentPayments } = await supabase
        .from('payment_events')
        .select('*')
        .eq('sender_address', address)
        .order('created_at', { ascending: true });
      
      if (!agentPayments || agentPayments.length === 0) continue;
      
      const successfulPayments = agentPayments.filter(p => p.status === 'success');
      const totalVolume = successfulPayments.reduce((sum, p) => 
        sum + parseFloat(p.amount.toString()), 0
      );
      const uniqueEndpoints = new Set(agentPayments.map(p => p.endpoint)).size;
      const suspiciousActivity = detectFraud(agentPayments);
      
      const history = {
        payer: address,
        totalPayments: agentPayments.length,
        successfulPayments: successfulPayments.length,
        totalVolume,
        avgPaymentSize: totalVolume / successfulPayments.length,
        firstPayment: new Date(agentPayments[0].created_at),
        lastPayment: new Date(agentPayments[agentPayments.length - 1].created_at),
        uniqueEndpoints,
        suspiciousActivity
      };
      
      const creditScore = calculateCreditScore(history);
      
      scores.push({
        address: address.substring(0, 10) + '...' + address.substring(address.length - 6),
        fullAddress: address,
        score: creditScore.score,
        rating: creditScore.rating,
        discount: creditScore.discount,
        totalPayments: history.totalPayments,
        totalVolume: totalVolume.toFixed(6)
      });
    }
    
    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);
    
    res.json(scores.slice(0, limit));
    
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get credit score for an agent
app.get('/api/credit/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Get all payments for this address
    const { data: payments, error } = await supabase
      .from('payment_events')
      .select('*')
      .eq('sender_address', address)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    if (!payments || payments.length === 0) {
      return res.json({
        address,
        score: 500,
        rating: 'New',
        discount: 0,
        hasHistory: false,
        message: 'No payment history found'
      });
    }
    
    // Calculate payment history metrics
    const successfulPayments = payments.filter(p => p.status === 'success');
    const totalVolume = successfulPayments.reduce((sum, p) => 
      sum + parseFloat(p.amount.toString()), 0
    );
    const uniqueEndpoints = new Set(payments.map(p => p.endpoint)).size;
    const suspiciousActivity = detectFraud(payments);
    
    const history = {
      payer: address,
      totalPayments: payments.length,
      successfulPayments: successfulPayments.length,
      totalVolume,
      avgPaymentSize: totalVolume / successfulPayments.length,
      firstPayment: new Date(payments[0].created_at),
      lastPayment: new Date(payments[payments.length - 1].created_at),
      uniqueEndpoints,
      suspiciousActivity
    };
    
    const creditScore = calculateCreditScore(history);
    
    res.json({
      address,
      ...creditScore,
      history: {
        totalPayments: history.totalPayments,
        successfulPayments: history.successfulPayments,
        totalVolume: totalVolume.toFixed(6),
        uniqueEndpoints: history.uniqueEndpoints,
        accountAge: Math.floor(
          (Date.now() - history.firstPayment.getTime()) / (1000 * 60 * 60 * 24)
        )
      },
      hasHistory: true
    });
    
  } catch (error: any) {
    console.error('Credit score error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get fraud alerts
app.get('/api/security/alerts', async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payment_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (error) throw error;
    
    // Group by address
    const byAddress: any = {};
    payments?.forEach(p => {
      if (!p.sender_address) return;
      if (!byAddress[p.sender_address]) {
        byAddress[p.sender_address] = [];
      }
      byAddress[p.sender_address].push(p);
    });
    
    // Check each address for fraud
    const alerts = [];
    for (const [address, addressPayments] of Object.entries(byAddress) as any) {
      const isFraud = detectFraud(addressPayments);
      if (isFraud) {
        alerts.push({
          address: address.substring(0, 10) + '...' + address.substring(address.length - 6),
          fullAddress: address,
          reason: 'Suspicious payment pattern detected',
          totalPayments: addressPayments.length,
          lastSeen: addressPayments[0].created_at,
          severity: addressPayments.length > 50 ? 'high' : 'medium'
        });
      }
    }
    
    res.json(alerts);
    
  } catch (error: any) {
    console.error('Security alerts error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Post fraud alert (for demo/testing)
app.post('/api/security/fraud-alert', async (req, res) => {
  try {
    const { type, severity, details, timestamp } = req.body;
    
    console.log(`🚨 FRAUD ALERT: ${type} (${severity})`, details);
    
    // In a real system, this would:
    // 1. Store in fraud_alerts table
    // 2. Trigger real-time notification via Socket.io
    // 3. Update fraud analytics
    
    // Broadcast via Socket.io
    io.emit('fraud:alert', {
      type,
      severity,
      details,
      timestamp: timestamp || new Date().toISOString()
    });
    
    res.json({ success: true, message: 'Fraud alert logged' });
    
  } catch (error: any) {
    console.error('Fraud alert error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== USER AUTHENTICATION ====================

// Register/update user when they connect wallet
app.post('/api/users/register', async (req, res) => {
  try {
    const { wallet_address, timestamp } = req.body;
    
    if (!wallet_address) {
      return res.status(400).json({ error: 'Wallet address required' });
    }
    
    console.log('👤 User registration:', wallet_address.substring(0, 10) + '...');
    
    // For MVP, just acknowledge registration
    // In production, you'd store in Supabase users table
    res.json({ 
      success: true, 
      message: 'User registered',
      wallet_address,
      timestamp: timestamp || new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('User registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROVIDER MARKETPLACE ENDPOINTS ====================

// Mock provider storage (in production, use Supabase)
const providers: Map<string, any> = new Map();
const providerEndpoints: Map<string, any> = new Map();

// Initialize with demo providers
providers.set('demo-weather', {
  id: 'demo-weather',
  name: 'Weather Data Pro',
  description: 'Real-time weather data from 10,000+ locations',
  walletAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  category: 'Weather',
  status: 'active',
  featured: true,
  verified: true,
  totalRevenue: 0.125,
  totalRequests: 25,
  createdAt: new Date().toISOString()
});

providers.set('demo-crypto', {
  id: 'demo-crypto',
  name: 'Crypto Price Oracle',
  description: 'Live cryptocurrency prices with sub-second updates',
  walletAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
  category: 'Finance',
  status: 'active',
  featured: true,
  verified: true,
  totalRevenue: 0.087,
  totalRequests: 29,
  createdAt: new Date().toISOString()
});

providers.set('demo-ai', {
  id: 'demo-ai',
  name: 'AI Text Intelligence',
  description: 'Advanced NLP summarization and analysis',
  walletAddress: 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN',
  category: 'AI/ML',
  status: 'active',
  featured: false,
  verified: true,
  totalRevenue: 0.124,
  totalRequests: 8,
  createdAt: new Date().toISOString()
});

// Register new provider
app.post('/api/providers', async (req, res) => {
  try {
    const { name, description, walletAddress, category } = req.body;
    
    if (!name || !walletAddress) {
      return res.status(400).json({ error: 'Name and wallet address required' });
    }
    
    const providerId = `provider-${Date.now()}`;
    const provider = {
      id: providerId,
      name,
      description: description || '',
      walletAddress,
      category: category || 'Other',
      status: 'pending',
      featured: false,
      verified: false,
      totalRevenue: 0,
      totalRequests: 0,
      createdAt: new Date().toISOString()
    };
    
    providers.set(providerId, provider);
    
    res.json({
      success: true,
      provider
    });
  } catch (error: any) {
    console.error('Provider registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List all providers
app.get('/api/providers', async (req, res) => {
  try {
    const { category, featured, verified } = req.query;
    
    let providerList = Array.from(providers.values());
    
    // Filters
    if (category) {
      providerList = providerList.filter(p => p.category === category);
    }
    if (featured === 'true') {
      providerList = providerList.filter(p => p.featured);
    }
    if (verified === 'true') {
      providerList = providerList.filter(p => p.verified);
    }
    
    // Sort by revenue
    providerList.sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    res.json(providerList);
  } catch (error: any) {
    console.error('List providers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single provider
app.get('/api/providers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const provider = providers.get(id);
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json(provider);
  } catch (error: any) {
    console.error('Get provider error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register endpoint for provider
app.post('/api/providers/:id/endpoints', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, path, baseUrl, description, basePrice, currency, category } = req.body;
    
    const provider = providers.get(id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    const endpointId = `endpoint-${Date.now()}`;
    const endpoint = {
      id: endpointId,
      providerId: id,
      name,
      path,
      baseUrl,
      description: description || '',
      pricing: {
        basePrice: parseFloat(basePrice) || 0.001,
        currency: currency || 'STX'
      },
      category: category || 'Other',
      featured: false,
      verified: false,
      totalRevenue: 0,
      totalRequests: 0,
      createdAt: new Date().toISOString()
    };
    
    providerEndpoints.set(endpointId, endpoint);
    
    res.json({
      success: true,
      endpoint
    });
  } catch (error: any) {
    console.error('Endpoint registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get provider revenue stats
app.get('/api/providers/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get payments for this provider
    const { data: payments, error } = await supabase
      .from('payment_events')
      .select('*')
      .like('endpoint', `%${id}%`);
    
    if (error) throw error;
    
    const successfulPayments = payments?.filter(p => p.status === 'success') || [];
    const totalRevenue = successfulPayments.reduce((sum, p) => 
      sum + parseFloat(p.amount.toString()), 0
    );
    
    // Calculate revenue split
    const split = calculateRevenueSplit(totalRevenue);
    
    res.json({
      totalRevenue: totalRevenue.toFixed(6),
      providerShare: split.providerShare.toFixed(6),
      platformFee: split.platformFee.toFixed(6),
      totalRequests: payments?.length || 0,
      successfulRequests: successfulPayments.length,
      successRate: payments?.length ? 
        ((successfulPayments.length / payments.length) * 100).toFixed(2) : 
        '0'
    });
  } catch (error: any) {
    console.error('Provider stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get categories
app.get('/api/categories', (req, res) => {
  res.json(ENDPOINT_CATEGORIES);
});

// Get trending APIs
app.get('/api/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    
    // Get recent activity
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentPayments, error } = await supabase
      .from('payment_events')
      .select('endpoint, amount')
      .gte('created_at', oneDayAgo)
      .eq('status', 'success');
    
    if (error) throw error;
    
    // Group by endpoint
    const endpointActivity: any = {};
    recentPayments?.forEach(p => {
      if (!endpointActivity[p.endpoint]) {
        endpointActivity[p.endpoint] = { requests: 0, revenue: 0 };
      }
      endpointActivity[p.endpoint].requests += 1;
      endpointActivity[p.endpoint].revenue += parseFloat(p.amount.toString());
    });
    
    // Convert to array and sort
    const trending = Object.entries(endpointActivity)
      .map(([endpoint, data]: any) => ({
        endpoint,
        requests24h: data.requests,
        revenue24h: data.revenue.toFixed(6),
        trendingScore: data.requests * 10 + data.revenue * 100
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);
    
    res.json(trending);
  } catch (error: any) {
    console.error('Trending error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== NEW FEATURES ====================

// FEATURE 1: Export payments to CSV/JSON
app.get('/api/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const startDate = req.query.start as string;
    const endDate = req.query.end as string;
    
    let query = supabase
      .from('payment_events')
      .select('*')
      .eq('status', 'success')
      .order('created_at', { ascending: false });
    
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);
    
    const { data: payments, error } = await query;
    if (error) throw error;
    
    if (format === 'csv') {
      // Generate CSV
      const headers = 'Date,Endpoint,Amount,Token,Status,Transaction Hash,Sender Address\n';
      const rows = payments?.map(p => 
        `${new Date(p.created_at).toISOString()},${p.endpoint},${p.amount},${p.token},${p.status},${p.transaction_hash},${p.sender_address}`
      ).join('\n') || '';
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=x402metrics-export.csv');
      res.send(headers + rows);
    } else {
      // JSON format
      res.json(payments);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// FEATURE 2: Webhook testing tool
app.post('/api/test/webhook', async (req, res) => {
  try {
    const { scenario, endpoint, amount } = req.body;
    
    // Generate test payment based on scenario
    let testPayment;
    const testAddress = 'ST1TEST' + Math.random().toString(36).substring(2, 15).toUpperCase();
    
    switch (scenario) {
      case 'success':
        testPayment = {
          endpoint: endpoint || '/api/weather',
          amount: amount || '0.005',
          token: 'STX',
          payer: testAddress,
          txHash: '0xTEST' + Math.random().toString(16).substring(2, 62),
          timestamp: new Date().toISOString()
        };
        break;
      case 'fraud':
        testPayment = {
          endpoint: endpoint || '/api/weather',
          amount: amount || '10.000', // Suspiciously high
          token: 'STX',
          payer: testAddress,
          txHash: '0xFRAUD' + Math.random().toString(16).substring(2, 61),
          timestamp: new Date().toISOString()
        };
        break;
      default:
        testPayment = {
          endpoint: endpoint || '/api/weather',
          amount: amount || '0.005',
          token: 'STX',
          payer: testAddress,
          txHash: '0xTEST' + Math.random().toString(16).substring(2, 62),
          timestamp: new Date().toISOString()
        };
    }
    
    // Call our own webhook
    await fetch(`http://localhost:${PORT}/webhook/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayment)
    });
    
    res.json({ success: true, testPayment, message: 'Test payment triggered!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// FEATURE 3: Fraud analytics
app.get('/api/fraud/analytics', async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payment_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (error) throw error;
    
    // Group by address
    const addressActivity: any = {};
    payments?.forEach(p => {
      if (!p.sender_address) return;
      if (!addressActivity[p.sender_address]) {
        addressActivity[p.sender_address] = [];
      }
      addressActivity[p.sender_address].push(p);
    });
    
    // Detect fraud for each address
    const fraudAlerts = [];
    for (const [address, userPayments] of Object.entries(addressActivity) as any) {
      const isFraud = detectFraud(userPayments);
      if (isFraud) {
        fraudAlerts.push({
          address: address.substring(0, 10) + '...' + address.substring(address.length - 6),
          fullAddress: address,
          paymentCount: userPayments.length,
          suspiciousPatterns: [],
          riskScore: 85
        });
      }
    }
    
    res.json({
      totalAddresses: Object.keys(addressActivity).length,
      fraudulentAddresses: fraudAlerts.length,
      fraudRate: ((fraudAlerts.length / Object.keys(addressActivity).length) * 100).toFixed(2),
      alerts: fraudAlerts
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// FEATURE 4: Payment heatmap data
app.get('/api/heatmap', async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payment_events')
      .select('created_at, amount')
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (error) throw error;
    
    // Create heatmap data (hour x day of week)
    const heatmap: any = {};
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        heatmap[key] = { count: 0, revenue: 0 };
      }
    }
    
    payments?.forEach(p => {
      const date = new Date(p.created_at);
      const day = date.getDay();
      const hour = date.getHours();
      const key = `${day}-${hour}`;
      
      heatmap[key].count += 1;
      heatmap[key].revenue += parseFloat(p.amount.toString());
    });
    
    res.json(heatmap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// FEATURE 5: Cost savings calculator
app.get('/api/savings/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Get payments for this address
    const { data: payments, error } = await supabase
      .from('payment_events')
      .select('*')
      .eq('sender_address', address)
      .eq('status', 'success');
    
    if (error) throw error;
    
    if (!payments || payments.length === 0) {
      return res.json({ error: 'No payment history found' });
    }
    
    // Calculate credit score
    const successfulPayments = payments.filter(p => p.status === 'success');
    const totalVolume = successfulPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    const uniqueEndpoints = new Set(payments.map(p => p.endpoint)).size;
    
    const history = {
      payer: address,
      totalPayments: payments.length,
      successfulPayments: successfulPayments.length,
      totalVolume,
      avgPaymentSize: totalVolume / successfulPayments.length,
      firstPayment: new Date(payments[0].created_at),
      lastPayment: new Date(payments[payments.length - 1].created_at),
      uniqueEndpoints,
      suspiciousActivity: detectFraud(payments)
    };
    
    const creditScore = calculateCreditScore(history);
    const discount = creditScore.discount / 100;
    
    // Calculate savings
    const totalSpent = totalVolume * (1 - discount);
    const wouldHaveSpent = totalVolume;
    const totalSaved = wouldHaveSpent - totalSpent;
    
    res.json({
      creditScore: creditScore.score,
      discount: creditScore.discount,
      totalSpent: totalSpent.toFixed(6),
      totalSaved: totalSaved.toFixed(6),
      monthlySavings: (totalSaved * 30).toFixed(6),
      nextDiscountAt: creditScore.score >= 800 ? null : 800,
      recommendations: creditScore.recommendations
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('✅ Dashboard connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ Dashboard disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 x402Metrics Backend v1.0.0`);
  console.log(`🔌 Socket.io ready for real-time events`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /webhook/payment - Payment notifications`);
  console.log(`  GET  /api/stats - Overall statistics`);
  console.log(`  GET  /api/payments/recent - Recent payments`);
  console.log(`  GET  /api/analytics/by-token - Revenue by token`);
  console.log(`  GET  /api/analytics/by-endpoint - Revenue by endpoint`);
  console.log(`  GET  /api/credit/:address - Agent credit score`);
  console.log(`  GET  /api/credit/leaderboard - Top agents`);
  console.log(`  GET  /api/security/alerts - Fraud alerts`);
  console.log(`  POST /api/providers - Register provider`);
  console.log(`  GET  /api/providers - List providers`);
  console.log(`  GET  /api/providers/:id/stats - Provider revenue`);
  console.log(`  GET  /api/trending - Trending APIs`);
  console.log(`  GET  /api/categories - API categories`);
});

export { io };