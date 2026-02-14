const { makeContractDeploy, broadcastTransaction, AnchorMode } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: './test-client/.env' });

const PRIVATE_KEY = process.env.STACKS_PRIVATE_KEY;
const CONTRACT_NAME = 'x402metrics-provider-registry';

async function deployContract() {
  console.log('📜 Deploying x402Metrics Provider Registry Contract\n');
  
  // Read contract code
  const contractCode = fs.readFileSync('./contracts/provider-registry.clar', 'utf8');
  console.log(`✅ Contract loaded: ${contractCode.length} bytes`);
  console.log(`📝 Contract name: ${CONTRACT_NAME}\n`);
  
  const network = new StacksTestnet();
  
  const txOptions = {
    contractName: CONTRACT_NAME,
    codeBody: contractCode,
    senderKey: PRIVATE_KEY,
    network,
    anchorMode: AnchorMode.Any,
  };

  console.log('🔨 Building transaction...');
  const transaction = await makeContractDeploy(txOptions);
  
  console.log('📡 Broadcasting to Stacks testnet...');
  const broadcastResponse = await broadcastTransaction({ transaction, network });
  
  if (broadcastResponse.error) {
    console.error('❌ Deployment failed:', broadcastResponse);
    process.exit(1);
  }
  
  const txId = broadcastResponse.txid;
  console.log('\n✅ CONTRACT DEPLOYED!');
  console.log(`📦 Transaction ID: ${txId}`);
  console.log(`🔗 View on Explorer: https://explorer.hiro.so/txid/${txId}?chain=testnet`);
  console.log(`\n📋 Contract Address:`);
  console.log(`   ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914.${CONTRACT_NAME}`);
  console.log('\n⏳ Wait ~10 minutes for confirmation, then contract will be live!');
  
  // Save contract info
  const contractInfo = {
    name: CONTRACT_NAME,
    txId: txId,
    address: `ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914.${CONTRACT_NAME}`,
    deployedAt: new Date().toISOString(),
    explorerUrl: `https://explorer.hiro.so/txid/${txId}?chain=testnet`
  };
  
  fs.writeFileSync('./contracts/deployed.json', JSON.stringify(contractInfo, null, 2));
  console.log('\n💾 Contract info saved to contracts/deployed.json');
}

deployContract().catch(console.error);
