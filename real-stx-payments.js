#!/usr/bin/env node

/**
 * Make REAL STX transfers that simulate x402 payments
 * Each transaction will be visible on Stacks explorer
 * Backend will receive webhook notifications with transaction hashes
 */

import transactions from '@stacks/transactions';
import networkLib from '@stacks/network';
import fetch from 'node-fetch';

const { makeSTXTokenTransfer, broadcastTransaction, AnchorMode, PostConditionMode } = transactions;
const { StacksTestnet } = networkLib;

const PRIVATE_KEY = '309ab449d3c21793a280f401bded18674028a9e735b0be27940902163781acf0';
const API_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Demo API address
const BACKEND = 'http://localhost:3001';
const network = new StacksTestnet();

console.log('⛓️  Making REAL Blockchain STX Transfers');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const payments = [
  { endpoint: '/api/weather', amount: 5000, token: 'STX', description: 'Weather API' },
  { endpoint: '/api/crypto-price', amount: 10000, token: 'STX', description: 'Crypto Prices' },
  { endpoint: '/api/random-fact', amount: 3000, token: 'STX', description: 'Random Fact' },
  { endpoint: '/api/ai-summary', amount: 15000, token: 'STX', description: 'AI Summary' },
  { endpoint: '/api/weather', amount: 5000, token: 'STX', description: 'Weather API #2' },
];

async function makeRealPayment(payment, index) {
  console.log(`\n${index + 1}. 💸 ${payment.description}`);
  console.log(`   Amount: ${payment.amount / 1000000} STX (${payment.amount} microSTX)`);
  console.log(`   To: ${API_ADDRESS}`);
  
  try {
    // Create the transaction
    console.log('   🔨 Building transaction...');
    const txOptions = {
      recipient: API_ADDRESS,
      amount: BigInt(payment.amount),
      senderKey: PRIVATE_KEY,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      memo: `x402: ${payment.endpoint}`,
    };

    const transaction = await makeSTXTokenTransfer(txOptions);
    
    // Broadcast to blockchain
    console.log('   📡 Broadcasting to Stacks testnet...');
    const broadcastResponse = await broadcastTransaction({ transaction, network });
    
    if (broadcastResponse.error) {
      console.error(`   ❌ Broadcast failed: ${broadcastResponse.error}`);
      console.error(`   Reason: ${broadcastResponse.reason}`);
      return { success: false };
    }

    const txId = broadcastResponse.txid;
    console.log(`   ✅ Transaction broadcast successful!`);
    console.log(`   📋 TX ID: ${txId}`);
    console.log(`   🔍 Explorer: https://explorer.hiro.so/txid/${txId}?chain=testnet`);
    
    // Send webhook to backend
    console.log('   📨 Sending webhook to backend...');
    const webhookPayload = {
      endpoint: payment.endpoint,
      amount: payment.amount / 1000000,
      token: payment.token,
      status: 'success',
      sender_address: 'ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914',
      transaction_hash: txId,
      api_key: 'real-stx-payment',
      metadata: {
        description: payment.description,
        memo: `x402: ${payment.endpoint}`,
        timestamp: new Date().toISOString(),
        real_blockchain_tx: true
      }
    };
    
    await fetch(`${BACKEND}/webhook/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });
    
    console.log('   ✅ Webhook sent to dashboard');
    
    // Wait before next transaction
    console.log('   ⏳ Waiting 3s before next transaction...');
    await new Promise(r => setTimeout(r, 3000));
    
    return { success: true, txId };
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function run() {
  let successCount = 0;
  let totalSpent = 0;
  const txIds = [];
  
  for (let i = 0; i < payments.length; i++) {
    const result = await makeRealPayment(payments[i], i);
    if (result.success) {
      successCount++;
      totalSpent += payments[i].amount;
      txIds.push(result.txId);
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 FINAL SUMMARY:');
  console.log(`✅ Successful: ${successCount}/${payments.length}`);
  console.log(`💸 Total spent: ${(totalSpent / 1000000).toFixed(6)} STX`);
  console.log(`\n🔗 Transaction IDs:`);
  txIds.forEach((txId, i) => {
    console.log(`   ${i + 1}. ${txId}`);
    console.log(`      https://explorer.hiro.so/txid/${txId}?chain=testnet`);
  });
  console.log(`\n🌐 Your wallet:`);
  console.log(`   https://explorer.hiro.so/address/ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914?chain=testnet`);
  console.log(`\n📈 Dashboard (refresh to see data):`);
  console.log(`   http://localhost:3000`);
}

run().catch(console.error);
