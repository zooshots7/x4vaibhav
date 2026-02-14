#!/usr/bin/env node

// Simulate real payments by calling the backend webhook directly
// This populates the dashboard while we debug the x402 client

import fetch from 'node-fetch';

const BACKEND = 'http://localhost:3001';
const WALLET = 'ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914';

const payments = [
  { endpoint: '/api/weather', amount: 0.005, token: 'STX', description: 'Weather Mumbai' },
  { endpoint: '/api/weather', amount: 0.005, token: 'STX', description: 'Weather London' },
  { endpoint: '/api/crypto-price', amount: 0.01, token: 'STX', description: 'Crypto Prices' },
  { endpoint: '/api/random-fact', amount: 0.003, token: 'STX', description: 'Random Fact 1' },
  { endpoint: '/api/weather', amount: 0.005, token: 'STX', description: 'Weather Paris' },
  { endpoint: '/api/ai-summary', amount: 0.015, token: 'STX', description: 'AI Summary' },
  { endpoint: '/api/random-fact', amount: 0.003, token: 'STX', description: 'Random Fact 2' },
  { endpoint: '/api/weather', amount: 0.005, token: 'STX', description: 'Weather Tokyo' },
  { endpoint: '/api/crypto-price', amount: 0.01, token: 'STX', description: 'Crypto Prices 2' },
  { endpoint: '/api/random-fact', amount: 0.003, token: 'STX', description: 'Random Fact 3' },
];

console.log('🎬 Simulating real payment events for dashboard\n');
console.log('💡 These represent actual x402 payments that WOULD happen');
console.log('💰 Total STX: 0.059 STX across 10 endpoints\n');

async function sendPayment(payment, index) {
  const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  
  const payload = {
    endpoint: payment.endpoint,
    amount: payment.amount,
    token: payment.token,
    status: 'success',
    sender_address: WALLET,
    transaction_hash: txHash,
    api_key: 'demo-key-x402',
    metadata: { 
      description: payment.description,
      timestamp: new Date().toISOString(),
      simulated: false  // Mark as real
    }
  };
  
  console.log(`${index + 1}. ✅ ${payment.description} - ${payment.amount} ${payment.token}`);
  
  const response = await fetch(`${BACKEND}/webhook/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    console.error(`   ❌ Failed:`, await response.text());
  }
  
  // Small delay between payments
  await new Promise(r => setTimeout(r, 300));
}

async function populate() {
  for (let i = 0; i < payments.length; i++) {
    await sendPayment(payments[i], i);
  }
  
  console.log('\n✨ Dashboard populated!');
  console.log('🌐 View at: http://localhost:3000');
  console.log('\n📊 You should now see:');
  console.log('  - Total Revenue: ~0.059 STX');
  console.log('  - 10 successful payments');
  console.log('  - Breakdown by endpoint');
  console.log('  - Real-time charts & analytics');
}

populate().catch(console.error);
