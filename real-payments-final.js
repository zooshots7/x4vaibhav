/**
 * Make REAL STX blockchain transfers
 * Each transaction is verifiable on Stacks explorer
 */

const { makeSTXTokenTransfer, broadcastTransaction, AnchorMode, PostConditionMode } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');
const fetch = require('node-fetch');

const PRIVATE_KEY = '309ab449d3c21793a280f401bded18674028a9e735b0be27940902163781acf0';
const API_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Demo API
const BACKEND = 'http://localhost:3001';
const network = STACKS_TESTNET;

console.log('⛓️  REAL BLOCKCHAIN PAYMENTS - Stacks Testnet');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('💰 Wallet: ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914');
console.log('🔗 Explorer: https://explorer.hiro.so/address/ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914?chain=testnet\n');

const payments = [
  { endpoint: '/api/weather', amount: 5000, description: 'Weather API' },
  { endpoint: '/api/crypto-price', amount: 10000, description: 'Crypto Prices' },
  { endpoint: '/api/random-fact', amount: 3000, description: 'Random Fact' },
  { endpoint: '/api/ai-summary', amount: 15000, description: 'AI Summary' },
  { endpoint: '/api/weather', amount: 5000, description: 'Weather API #2' },
];

async function makePayment(payment, index) {
  console.log(`\n${index + 1}. 💸 ${payment.description}`);
  console.log(`   Amount: ${payment.amount / 1000000} STX`);
  console.log(`   Endpoint: ${payment.endpoint}`);
  
  try {
    const txOptions = {
      recipient: API_ADDRESS,
      amount: BigInt(payment.amount),
      senderKey: PRIVATE_KEY,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      memo: `x402: ${payment.endpoint}`,
    };

    console.log('   🔨 Building transaction...');
    const transaction = await makeSTXTokenTransfer(txOptions);
    
    console.log('   📡 Broadcasting to blockchain...');
    const broadcastResponse = await broadcastTransaction({ transaction, network });
    
    if (broadcastResponse.error) {
      console.error(`   ❌ Failed: ${broadcastResponse.error}`);
      return { success: false };
    }

    const txId = broadcastResponse.txid || broadcastResponse;
    console.log(`   ✅ SUCCESS!`);
    console.log(`   📋 TX: ${txId}`);
    console.log(`   🔍 https://explorer.hiro.so/txid/${txId}?chain=testnet`);
    
    // Send to backend
    const webhookPayload = {
      endpoint: payment.endpoint,
      amount: payment.amount / 1000000,
      token: 'STX',
      status: 'success',
      sender_address: 'ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914',
      transaction_hash: txId,
      api_key: 'real-blockchain-payment',
      metadata: {
        description: payment.description,
        real_blockchain: true,
        explorer_url: `https://explorer.hiro.so/txid/${txId}?chain=testnet`
      }
    };
    
    await fetch(`${BACKEND}/webhook/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });
    
    console.log('   📨 Dashboard updated');
    console.log('   ⏳ Waiting 2s...');
    await new Promise(r => setTimeout(r, 2000));
    
    return { success: true, txId };
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false };
  }
}

async function run() {
  let successCount = 0;
  let totalSpent = 0;
  const txIds = [];
  
  console.log('Starting payments...\n');
  
  for (let i = 0; i < payments.length; i++) {
    const result = await makePayment(payments[i], i);
    if (result.success) {
      successCount++;
      totalSpent += payments[i].amount;
      txIds.push(result.txId);
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 SUMMARY:');
  console.log(`✅ Success: ${successCount}/${payments.length}`);
  console.log(`💸 Total: ${(totalSpent / 1000000).toFixed(6)} STX`);
  
  if (txIds.length > 0) {
    console.log(`\n🔗 Transaction IDs:`);
    txIds.forEach((txId, i) => {
      console.log(`   ${i + 1}. https://explorer.hiro.so/txid/${txId}?chain=testnet`);
    });
  }
  
  console.log(`\n📈 Dashboard: http://localhost:3000`);
  console.log('   (Refresh to see data)\n');
}

run().catch(console.error);
