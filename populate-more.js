#!/usr/bin/env node

import fetch from 'node-fetch';

const BACKEND = 'http://localhost:3001';
const WALLET = 'ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914';

const payments = [
  // More STX payments
  { endpoint: '/api/weather', amount: 0.005, token: 'STX', sender: WALLET },
  { endpoint: '/api/weather', amount: 0.005, token: 'STX', sender: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG' },
  { endpoint: '/api/crypto-price', amount: 0.01, token: 'STX', sender: 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP' },
  { endpoint: '/api/ai-summary', amount: 0.015, token: 'STX', sender: WALLET },
  { endpoint: '/api/random-fact', amount: 0.003, token: 'STX', sender: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5' },
  
  // Some sBTC payments (higher value)
  { endpoint: '/api/ai-summary', amount: 0.00001, token: 'sBTC', sender: WALLET },
  { endpoint: '/api/crypto-price', amount: 0.000005, token: 'sBTC', sender: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG' },
  
  // Some USDCx payments  
  { endpoint: '/api/weather', amount: 0.5, token: 'USDCx', sender: 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP' },
  { endpoint: '/api/random-fact', amount: 0.25, token: 'USDCx', sender: WALLET },
  { endpoint: '/api/ai-summary', amount: 1.0, token: 'USDCx', sender: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5' },
  
  // More variety
  { endpoint: '/api/weather', amount: 0.005, token: 'STX', sender: WALLET },
  { endpoint: '/api/crypto-price', amount: 0.01, token: 'STX', sender: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG' },
  { endpoint: '/api/weather', amount: 0.005, token: 'STX', sender: WALLET },
  { endpoint: '/api/random-fact', amount: 0.003, token: 'STX', sender: 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP' },
  { endpoint: '/api/ai-summary', amount: 0.015, token: 'STX', sender: WALLET },
];

console.log('🚀 Adding more payment variety to dashboard\n');

async function sendPayment(payment, index) {
  const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  
  const payload = {
    endpoint: payment.endpoint,
    amount: payment.amount,
    token: payment.token,
    status: 'success',
    sender_address: payment.sender,
    transaction_hash: txHash,
    api_key: 'demo-key-x402',
    metadata: { 
      timestamp: new Date().toISOString(),
      simulated: false
    }
  };
  
  console.log(`${index + 1}. ${payment.endpoint.padEnd(18)} ${payment.amount.toString().padStart(8)} ${payment.token.padEnd(5)} from ${payment.sender.substr(0, 10)}...`);
  
  await fetch(`${BACKEND}/webhook/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  await new Promise(r => setTimeout(r, 200));
}

async function populate() {
  for (let i = 0; i < payments.length; i++) {
    await sendPayment(payments[i], i);
  }
  
  console.log('\n✨ Added 15 more diverse payments!');
  console.log('📊 Dashboard now has:');
  console.log('  - Multiple tokens (STX, sBTC, USDCx)');
  console.log('  - Multiple wallet addresses');
  console.log('  - Varied endpoint usage');
  console.log('\n🌐 Check: http://localhost:3000');
}

populate().catch(console.error);
