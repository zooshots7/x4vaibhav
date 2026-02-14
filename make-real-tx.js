// Make a real STX transfer on testnet to prove blockchain capability
const { makeSTXTokenTransfer, broadcastTransaction, AnchorMode } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');
const dotenv = require('dotenv');

dotenv.config({ path: './test-client/.env' });

const PRIVATE_KEY = process.env.STACKS_PRIVATE_KEY;
const DEMO_API_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Demo API wallet

async function makeRealTransaction() {
  console.log('🔥 Making REAL STX Transfer on Stacks Testnet\n');
  console.log('This proves we can transact on-chain!\n');
  
  const network = STACKS_TESTNET;
  
  // Transfer 0.005 STX (5000 microSTX) - same as weather API price
  const txOptions = {
    recipient: DEMO_API_ADDRESS,
    amount: 5000n, // 0.005 STX in microSTX
    senderKey: PRIVATE_KEY,
    network,
    memo: 'x402Metrics test payment',
    anchorMode: AnchorMode.Any,
  };

  console.log('📝 Transaction details:');
  console.log('  Amount: 0.005 STX (5000 microSTX)');
  console.log('  To:', DEMO_API_ADDRESS);
  console.log('  Memo: x402Metrics test payment');
  console.log('');

  console.log('🔨 Building transaction...');
  const transaction = await makeSTXTokenTransfer(txOptions);
  
  console.log('📡 Broadcasting to Stacks testnet...');
  const broadcastResponse = await broadcastTransaction({ transaction, network });
  
  if (broadcastResponse.error) {
    console.error('❌ Transaction failed:', broadcastResponse);
    process.exit(1);
  }
  
  const txId = typeof broadcastResponse === 'string' ? broadcastResponse : broadcastResponse.txid;
  
  console.log('\n✅ TRANSACTION BROADCAST SUCCESSFUL!\n');
  console.log('📦 Transaction ID:');
  console.log('  ', txId);
  console.log('');
  console.log('🔗 View on Stacks Explorer:');
  console.log('  ', `https://explorer.hiro.so/txid/${txId}?chain=testnet`);
  console.log('');
  console.log('⏳ Status: Pending (wait ~10 mins for confirmation)');
  console.log('');
  console.log('💡 This proves x402Metrics can handle REAL blockchain transactions!');
  console.log('');
  
  // Save to file for later use
  const fs = require('fs');
  fs.writeFileSync('./real-tx.json', JSON.stringify({
    txId,
    amount: '0.005',
    token: 'STX',
    timestamp: new Date().toISOString(),
    explorerUrl: `https://explorer.hiro.so/txid/${txId}?chain=testnet`,
    endpoint: '/api/weather',
    memo: 'x402Metrics test payment'
  }, null, 2));
  
  console.log('💾 Transaction details saved to real-tx.json');
}

makeRealTransaction().catch(console.error);
