const express = require('express');
const cors = require('cors');
const { paymentMiddleware, STXtoMicroSTX, getPayment } = require('x402-stacks');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.DEMO_API_PORT || 3002;

// Your Stacks address (replace with yours or use env var)
const SERVER_ADDRESS = process.env.STACKS_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://x402-backend-7eby.onrender.com';
const NETWORK = process.env.STACKS_NETWORK || 'testnet';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

console.log('🔥 x402-stacks Configuration:');
console.log('  Server Address:', SERVER_ADDRESS);
console.log('  Network:', NETWORK);
console.log('  Facilitator:', FACILITATOR_URL);
console.log('  Backend:', BACKEND_URL);

// Helper function to send payment notification to backend
async function notifyBackend(endpoint, amount, payment) {
  try {
    const response = await fetch(`${BACKEND_URL}/webhook/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint,
        amount: amount.toString(),
        token: 'STX',
        payer: payment?.payer || 'unknown',
        txHash: payment?.transaction || 'pending',
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      console.log(`✅ Webhook sent for ${endpoint}`);
    } else {
      console.error(`❌ Webhook failed for ${endpoint}:`, await response.text());
    }
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
  }
}

// Health check (no payment required)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'x402 Demo API is running',
    timestamp: new Date().toISOString(),
    network: NETWORK,
    facilitator: FACILITATOR_URL
  });
});

// Demo endpoints WITH x402 payment protection
app.get('/api/weather', 
  paymentMiddleware({
    amount: STXtoMicroSTX(0.005), // 0.005 STX per request
    payTo: SERVER_ADDRESS,
    network: NETWORK,
    facilitatorUrl: FACILITATOR_URL,
    description: 'Weather data API access',
  }),
  async (req, res) => {
    const payment = getPayment(req);
    console.log('💰 Payment received from:', payment?.payer);
    
    // Notify backend analytics
    await notifyBackend('/api/weather', 0.005, payment);
    
    const city = req.query.city || 'San Francisco';
    res.json({
      city: city,
      temp: Math.floor(Math.random() * 20) + 60, // Random 60-80°F
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Windy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      timestamp: new Date().toISOString(),
      paidBy: payment?.payer
    });
  }
);

app.get('/api/crypto-price',
  paymentMiddleware({
    amount: STXtoMicroSTX(0.003), // 0.003 STX per request
    payTo: SERVER_ADDRESS,
    network: NETWORK,
    facilitatorUrl: FACILITATOR_URL,
    description: 'Crypto price feed API',
  }),
  async (req, res) => {
    const payment = getPayment(req);
    
    await notifyBackend('/api/crypto-price', 0.003, payment);
    
    res.json({
      BTC: 45000 + Math.random() * 5000,
      STX: 2.5 + Math.random() * 0.5,
      ETH: 3200 + Math.random() * 300,
      timestamp: new Date().toISOString(),
      paidBy: payment?.payer
    });
  }
);

app.post('/api/ai-summary',
  paymentMiddleware({
    amount: STXtoMicroSTX(0.01), // 0.01 STX per summary
    payTo: SERVER_ADDRESS,
    network: NETWORK,
    facilitatorUrl: FACILITATOR_URL,
    description: 'AI text summarization',
  }),
  async (req, res) => {
    const payment = getPayment(req);
    
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    await notifyBackend('/api/ai-summary', 0.01, payment);
    
    const words = text.split(' ').length;
    const summary = text.substring(0, 100) + (text.length > 100 ? '...' : '');
    
    res.json({
      summary: summary,
      wordCount: words,
      originalLength: text.length,
      summaryLength: summary.length,
      timestamp: new Date().toISOString(),
      paidBy: payment?.payer
    });
  }
);

app.get('/api/random-fact',
  paymentMiddleware({
    amount: STXtoMicroSTX(0.001), // 0.001 STX per fact
    payTo: SERVER_ADDRESS,
    network: NETWORK,
    facilitatorUrl: FACILITATOR_URL,
    description: 'Random fact API',
  }),
  async (req, res) => {
    const payment = getPayment(req);
    
    await notifyBackend('/api/random-fact', 0.001, payment);
    
    const facts = [
      'The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes.',
      'Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible.',
      'A day on Venus is longer than a year on Venus.',
      'Octopuses have three hearts and blue blood.',
      'Bananas are berries, but strawberries are not.'
    ];
    
    res.json({
      fact: facts[Math.floor(Math.random() * facts.length)],
      category: 'Science',
      timestamp: new Date().toISOString(),
      paidBy: payment?.payer
    });
  }
);

// Webhook endpoint to log payments (called by x402 middleware later)
app.post('/webhook/payment', async (req, res) => {
  console.log('💰 Payment received:', req.body);
  
  try {
    const { endpoint, amount, token, sender, txHash } = req.body;
    
    // TODO: Later we'll forward this to the backend
    // For now, just log it
    console.log(`Payment: ${amount} ${token} for ${endpoint}`);
    
    res.json({ 
      success: true, 
      message: 'Payment logged',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Demo API running on http://localhost:${PORT}`);
  console.log(`📊 x402 Demo API v1.0.0`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /health - Health check`);
  console.log(`  GET  /api/weather?city=London - Weather data`);
  console.log(`  GET  /api/crypto-price - Crypto prices`);
  console.log(`  POST /api/ai-summary - AI text summary`);
  console.log(`  GET  /api/random-fact - Random fact`);
});
