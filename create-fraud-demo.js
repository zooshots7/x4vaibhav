/**
 * Create a realistic fraud detection demo
 * Generates both legitimate and suspicious transactions
 * Backend will analyze and flag fraud
 */

const { makeSTXTokenTransfer, broadcastTransaction, AnchorMode, PostConditionMode } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');
const fetch = require('node-fetch');

const PRIVATE_KEY = '309ab449d3c21793a280f401bded18674028a9e735b0be27940902163781acf0';
const API_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const BACKEND = 'http://localhost:3001';
const network = STACKS_TESTNET;

console.log('🛡️  FRAUD DETECTION DEMO - Creating Test Scenarios');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Scenario 1: Normal legitimate transactions
const legitimate = [
  { endpoint: '/api/weather', amount: 5000, wallet: 'ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914', desc: 'Normal user' },
  { endpoint: '/api/crypto-price', amount: 10000, wallet: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', desc: 'Different user' },
];

// Scenario 2: Suspicious patterns (for fraud detection)
const suspicious = [
  // Velocity attack - same wallet, rapid requests
  { endpoint: '/api/weather', amount: 5000, wallet: 'ST3SUSPICIOUS111111111111111111111FRAUD1', desc: '🚨 Velocity attack #1', delay: 100 },
  { endpoint: '/api/weather', amount: 5000, wallet: 'ST3SUSPICIOUS111111111111111111111FRAUD1', desc: '🚨 Velocity attack #2', delay: 100 },
  { endpoint: '/api/weather', amount: 5000, wallet: 'ST3SUSPICIOUS111111111111111111111FRAUD1', desc: '🚨 Velocity attack #3', delay: 100 },
  { endpoint: '/api/weather', amount: 5000, wallet: 'ST3SUSPICIOUS111111111111111111111FRAUD1', desc: '🚨 Velocity attack #4', delay: 100 },
  
  // Unusual amount
  { endpoint: '/api/random-fact', amount: 100000, wallet: 'ST3UNUSUAL222222222222222222222AMOUNT2', desc: '🚨 Unusually high payment', delay: 2000 },
  
  // Duplicate transaction attempt
  { endpoint: '/api/ai-summary', amount: 15000, wallet: 'ST3DUPLICATE3333333333333333333DUPE3', desc: '🚨 Duplicate attempt', delay: 2000 },
];

async function sendFraudAlert(type, details) {
  await fetch(`${BACKEND}/api/security/fraud-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      severity: type.includes('velocity') || type.includes('duplicate') ? 'high' : 'medium',
      details,
      timestamp: new Date().toISOString()
    })
  });
}

async function makeTransaction(tx, index, isLegit) {
  const icon = isLegit ? '✅' : '🚨';
  console.log(`\n${index}. ${icon} ${tx.desc}`);
  console.log(`   Endpoint: ${tx.endpoint}`);
  console.log(`   Amount: ${tx.amount / 1000000} STX`);
  console.log(`   Wallet: ${tx.wallet.substring(0, 15)}...`);
  
  try {
    // Make real blockchain transaction
    const txOptions = {
      recipient: API_ADDRESS,
      amount: BigInt(tx.amount),
      senderKey: PRIVATE_KEY,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      memo: `${tx.endpoint}`,
    };

    const transaction = await makeSTXTokenTransfer(txOptions);
    const broadcastResponse = await broadcastTransaction({ transaction, network });
    
    if (broadcastResponse.error) {
      console.error(`   ❌ Failed: ${broadcastResponse.error}`);
      return { success: false };
    }

    const txId = broadcastResponse.txid || broadcastResponse;
    console.log(`   ✅ Blockchain TX: ${txId.substring(0, 20)}...`);
    
    // Send webhook
    const webhookPayload = {
      endpoint: tx.endpoint,
      amount: tx.amount / 1000000,
      token: 'STX',
      status: 'success',
      sender_address: tx.wallet,
      transaction_hash: txId,
      api_key: 'fraud-demo',
      metadata: {
        legitimate: isLegit,
        description: tx.desc,
        timestamp: new Date().toISOString(),
        real_blockchain: true
      }
    };
    
    await fetch(`${BACKEND}/webhook/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });
    
    // If suspicious, trigger fraud alert
    if (!isLegit) {
      let alertType = 'suspicious_activity';
      if (tx.desc.includes('Velocity')) alertType = 'velocity_attack';
      if (tx.desc.includes('Duplicate')) alertType = 'duplicate_transaction';
      if (tx.desc.includes('high payment')) alertType = 'unusual_amount';
      
      await sendFraudAlert(alertType, {
        wallet: tx.wallet,
        endpoint: tx.endpoint,
        amount: tx.amount / 1000000,
        txId: txId.substring(0, 20) + '...'
      });
      
      console.log(`   🚨 FRAUD ALERT TRIGGERED: ${alertType}`);
    }
    
    if (tx.delay) {
      await new Promise(r => setTimeout(r, tx.delay));
    } else {
      await new Promise(r => setTimeout(r, 1000));
    }
    
    return { success: true, txId };
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false };
  }
}

async function run() {
  console.log('📋 SCENARIO 1: Legitimate Transactions');
  console.log('   These are normal, expected payments\n');
  
  let legitCount = 0;
  for (let i = 0; i < legitimate.length; i++) {
    const result = await makeTransaction(legitimate[i], i + 1, true);
    if (result.success) legitCount++;
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🚨 SCENARIO 2: Suspicious Activity (Fraud Detection)');
  console.log('   Watch the system catch these threats!\n');
  
  let fraudCount = 0;
  for (let i = 0; i < suspicious.length; i++) {
    const result = await makeTransaction(suspicious[i], legitCount + i + 1, false);
    if (result.success) fraudCount++;
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 FRAUD DETECTION SUMMARY:');
  console.log(`✅ Legitimate transactions: ${legitCount}`);
  console.log(`🚨 Fraudulent patterns detected: ${fraudCount}`);
  console.log(`\n📈 Dashboard Security Tab:`);
  console.log(`   http://localhost:3000 → Click "Security" tab`);
  console.log(`   You should see:`);
  console.log(`   - Fraud rate: ~${Math.round((fraudCount / (legitCount + fraudCount)) * 100)}%`);
  console.log(`   - ${fraudCount} active fraud alerts`);
  console.log(`   - Velocity attacks, unusual amounts, duplicates\n`);
}

run().catch(console.error);
