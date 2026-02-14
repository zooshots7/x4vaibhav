const axios = require('axios');
const { privateKeyToAccount } = require('x402-stacks');
const { makeSTXTokenTransfer, AnchorMode } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');
require('dotenv').config();

const DEMO_API_URL = 'http://localhost:3002';

async function deepDebug() {
  console.log('🔍 DEEP DEBUG - Step by step\n');
  
  // Step 1: Create account
  console.log('Step 1: Creating account...');
  const account = privateKeyToAccount(process.env.STACKS_PRIVATE_KEY, 'testnet');
  console.log('✅ Account:', account);
  console.log('');
  
  // Step 2: Get 402 response
  console.log('Step 2: Getting 402 response...');
  let paymentRequired;
  try {
    await axios.get(`${DEMO_API_URL}/api/weather?city=Mumbai`);
  } catch (error) {
    if (error.response && error.response.status === 402) {
      console.log('✅ Got 402 Payment Required');
      paymentRequired = error.response.data;
      console.log('Payment data:', JSON.stringify(paymentRequired, null, 2));
      console.log('');
    } else {
      console.error('❌ Unexpected error:', error.message);
      return;
    }
  }
  
  // Step 3: Test transaction creation
  console.log('Step 3: Creating STX transaction...');
  const selectedOption = paymentRequired.accepts[0];
  
  try {
    const amount = BigInt(selectedOption.amount);
    const network = STACKS_TESTNET;
    
    console.log('  Recipient:', selectedOption.payTo);
    console.log('  Amount:', amount.toString(), 'microSTX');
    console.log('  Network:', network);
    console.log('');
    
    const transaction = await makeSTXTokenTransfer({
      recipient: selectedOption.payTo,
      amount,
      senderKey: account.privateKey,
      network,
      memo: 'x402:test',
      anchorMode: AnchorMode.Any,
    });
    
    console.log('✅ Transaction created!');
    console.log('  Transaction object keys:', Object.keys(transaction));
    console.log('');
    
    const serialized = transaction.serialize();
    const hex = Buffer.from(serialized).toString('hex');
    console.log('✅ Transaction serialized!');
    console.log('  Hex length:', hex.length);
    console.log('  First 50 chars:', hex.substring(0, 50));
    console.log('');
    console.log('🎉 SUCCESS! We can create and serialize transactions!');
    console.log('   This means the wallet and Stacks libraries work fine.');
    console.log('   The issue must be in x402-stacks wrapper code.');
    
  } catch (error) {
    console.error('❌ Transaction creation failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

deepDebug();
