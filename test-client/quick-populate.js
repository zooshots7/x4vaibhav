#!/usr/bin/env node

import { createPaymentClient, privateKeyToAccount } from 'x402-stacks';
import dotenv from 'dotenv';

dotenv.config();

const DEMO_API = 'http://localhost:3002';
const PRIVATE_KEY = process.env.STACKS_PRIVATE_KEY;

console.log('🚀 Quick Dashboard Populator\n');

async function populate() {
  const account = privateKeyToAccount(PRIVATE_KEY, 'testnet');
  console.log('💰 Wallet:', account.address);
  console.log('🎯 Making 10 rapid payments to populate dashboard...\n');
  
  const api = createPaymentClient(account, { baseURL: DEMO_API });
  
  const calls = [
    { name: 'Weather Mumbai', fn: () => api.get('/api/weather?city=Mumbai') },
    { name: 'Weather London', fn: () => api.get('/api/weather?city=London') },
    { name: 'Crypto Price', fn: () => api.get('/api/crypto-price') },
    { name: 'Random Fact 1', fn: () => api.get('/api/random-fact') },
    { name: 'Weather Paris', fn: () => api.get('/api/weather?city=Paris') },
    { name: 'Random Fact 2', fn: () => api.get('/api/random-fact') },
    { name: 'Weather Tokyo', fn: () => api.get('/api/weather?city=Tokyo') },
    { name: 'AI Summary', fn: () => api.post('/api/ai-summary', { text: 'x402 enables HTTP-native blockchain payments for APIs on Stacks network.' }) },
    { name: 'Weather NYC', fn: () => api.get('/api/weather?city=New%20York') },
    { name: 'Random Fact 3', fn: () => api.get('/api/random-fact') },
  ];
  
  let success = 0;
  let failed = 0;
  
  for (const call of calls) {
    try {
      console.log(`⏳ ${call.name}...`);
      const response = await call.fn();
      console.log(`✅ ${call.name} - Payment successful!`);
      success++;
      
      // Small delay to avoid overwhelming the system
      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.error(`❌ ${call.name} failed:`, error.message);
      failed++;
    }
  }
  
  console.log(`\n✨ Complete! ${success} successful, ${failed} failed`);
  console.log(`🌐 Check dashboard: http://localhost:3000`);
}

populate().catch(console.error);
