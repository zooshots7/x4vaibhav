import axios from 'axios';
import { privateKeyToAccount } from 'x402-stacks';
import { makeSTXTokenTransfer, AnchorMode } from '@stacks/transactions';
import networkPkg from '@stacks/network';
import dotenv from 'dotenv';

const { StacksTestnet } = networkPkg;
dotenv.config();

const DEMO_API_URL = 'http://localhost:3002';

async function deepDebug() {
  console.log('🔍 DEEP DEBUG - Step by step\n');
  
  // Step 1: Create account
  console.log('Step 1: Creating account...');
  const account = privateKeyToAccount(process.env.STACKS_PRIVATE_KEY, 'testnet');
  console.log('✅ Account:', account);
  console.log('   Address:', account.address);
  console.log('   Network:', account.network);
  console.log('   PrivateKey length:', account.privateKey.length);
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
  
  // Step 3: Parse payment requirements
  console.log('Step 3: Parsing payment requirements...');
  const selectedOption = paymentRequired.accepts[0];
  console.log('Selected payment option:', JSON.stringify(selectedOption, null, 2));
  console.log('');
  
  // Step 4: Test transaction creation directly
  console.log('Step 4: Creating STX transaction directly...');
  try {
    const amount = BigInt(selectedOption.amount);
    const network = new StacksTestnet();
    
    console.log('  Recipient:', selectedOption.payTo);
    console.log('  Amount:', amount.toString(), 'microSTX');
    console.log('  SenderKey:', account.privateKey.substring(0, 10) + '...');
    console.log('  Network:', network.constructor.name);
    console.log('');
    
    console.log('  Calling makeSTXTokenTransfer...');
    const transaction = await makeSTXTokenTransfer({
      recipient: selectedOption.payTo,
      amount,
      senderKey: account.privateKey,
      network,
      memo: `x402:test`,
      anchorMode: AnchorMode.Any,
    });
    
    console.log('✅ Transaction created!');
    console.log('   Type:', transaction.constructor.name);
    console.log('   Payload type:', transaction.payload?.payloadType);
    console.log('');
    
    const serialized = transaction.serialize();
    const hex = Buffer.from(serialized).toString('hex');
    console.log('✅ Transaction serialized!');
    console.log('   Hex length:', hex.length);
    console.log('   First 100 chars:', hex.substring(0, 100));
    console.log('');
    
    console.log('🎉 SUCCESS! Transaction creation works!');
    
  } catch (error) {
    console.error('❌ Transaction creation failed:', error.message);
    console.error('Error stack:', error.stack);
  }
}

deepDebug();
