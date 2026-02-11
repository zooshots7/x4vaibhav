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
    const { endpoint, amount, token, payer, txHash, timestamp } = req.body;
    
    console.log('💰 Payment webhook received:', {
      endpoint,
      amount,
      token,
      payer: payer?.substring(0, 10) + '...'
    });
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('payment_events')
      .insert({
        endpoint,
        amount: parseFloat(amount),
        token,
        status: 'success',
        sender_address: payer,
        transaction_hash: txHash || 'pending',
        api_key: 'demo-api',
        metadata: { 
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
});

export { io };