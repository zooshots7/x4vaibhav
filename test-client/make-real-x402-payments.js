#!/usr/bin/env node

import { createPaymentClient, privateKeyToAccount } from 'x402-stacks';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const DEMO_API = 'http://localhost:3002';
const BACKEND = 'http://localhost:3001';
const PRIVATE_KEY = process.env.STACKS_PRIVATE_KEY;
const NETWORK = 'testnet';

console.log('🚀 Making REAL x402 Blockchain Payments\n');
console.log('💰 Using funded wallet with 2,499 STX');
console.log('⛓️  All transactions will be on Stacks testnet');
console.log('🔍 Each transaction viewable on explorer\n');

const account = privateKeyToAccount(PRIVATE_KEY, NETWORK);
console.log('📍 Wallet:', account.address);
console.log('🌐 Explorer: https://explorer.hiro.so/address/' + account.address + '?chain=testnet\n');

const api = createPaymentClient(account, { 
  baseURL: DEMO_API,
  timeout: 60000 // 60s timeout
});

const endpoints = [
  { url: '/api/weather?city=Mumbai', name: 'Weather Mumbai', expectedCost: 0.005 },
  { url: '/api/crypto-price', name: 'Crypto Prices', expectedCost: 0.01 },
  { url: '/api/random-fact', name: 'Random Fact', expectedCost: 0.003 },
];

let successCount = 0;
let totalSpent = 0;

async function makePayment(endpoint, index) {
  console.log(`\n${index + 1}. 📡 ${endpoint.name}`);
  console.log(`   Endpoint: ${endpoint.url}`);
  console.log(`   Expected cost: ${endpoint.expectedCost} STX`);
  
  try {
    console.log('   🔄 Requesting payment info...');
    const startTime = Date.now();
    
    // Make the x402 payment
    const response = await api.get(endpoint.url);
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ✅ Payment successful! (${elapsed}s)`);
    
    // Extract transaction hash from response headers or metadata
    const txHash = response.headers?.get('x-transaction-hash') || 'unknown';
    
    if (txHash !== 'unknown') {
      console.log(`   ⛓️  TX: ${txHash}`);
      console.log(`   🔍 Explorer: https://explorer.hiro.so/txid/${txHash}?chain=testnet`);
    }
    
    successCount++;
    totalSpent += endpoint.expectedCost;
    
    // Give blockchain time to process
    console.log('   ⏳ Waiting for blockchain confirmation...');
    await new Promise(r => setTimeout(r, 5000));
    
    return { success: true, txHash };
    
  } catch (error) {
    console.error(`   ❌ Payment failed: ${error.message}`);
    
    if (error.message.includes('timeout')) {
      console.error('   ⏱️  Timeout - facilitator may be slow');
    }
    
    return { success: false, error: error.message };
  }
}

async function run() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Starting real blockchain payments...\n');
  
  for (let i = 0; i < endpoints.length; i++) {
    await makePayment(endpoints[i], i);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 SUMMARY:');
  console.log(`✅ Successful payments: ${successCount}/${endpoints.length}`);
  console.log(`💸 Total spent: ${totalSpent.toFixed(3)} STX`);
  console.log(`\n🌐 View all transactions:`);
  console.log(`https://explorer.hiro.so/address/${account.address}?chain=testnet`);
  console.log(`\n📈 Dashboard: http://localhost:3000`);
  
  if (successCount === 0) {
    console.log('\n⚠️  NO PAYMENTS SUCCEEDED');
    console.log('Possible issues:');
    console.log('  - Facilitator timeout (slow remote service)');
    console.log('  - x402 protocol issue');
    console.log('  - Network connectivity');
    console.log('\nRecommendation: Check facilitator status or use alternative');
  }
}

run().catch(console.error);
