import { createPaymentClient, privateKeyToAccount, generateKeypair } from 'x402-stacks';
import dotenv from 'dotenv';

dotenv.config();

const DEMO_API_URL = process.env.DEMO_API_URL || 'http://localhost:3002';
const NETWORK = process.env.STACKS_NETWORK || 'testnet';

console.log('🚀 x402 Payment Client Test\n');
console.log('Configuration:');
console.log('  Demo API:', DEMO_API_URL);
console.log('  Network:', NETWORK);
console.log('');

async function testPayments() {
  try {
    // Step 1: Setup wallet
    console.log('📝 Step 1: Setting up wallet...');
    
    let account;
    if (process.env.STACKS_PRIVATE_KEY) {
      // Use provided private key
      account = privateKeyToAccount(process.env.STACKS_PRIVATE_KEY, NETWORK);
      console.log('✅ Using wallet from env:', account.address);
    } else {
      // Generate demo wallet
      const wallet = generateKeypair(NETWORK);
      account = privateKeyToAccount(wallet.privateKey, NETWORK);
      console.log('⚠️  Generated demo wallet:', account.address);
      console.log('⚠️  This wallet has no STX! Payment will fail.');
      console.log('⚠️  Get testnet STX: https://explorer.hiro.so/sandbox/faucet');
      console.log('');
    }

    // Step 2: Create payment-enabled API client
    console.log('📝 Step 2: Creating payment client...');
    const api = createPaymentClient(account, { baseURL: DEMO_API_URL });
    console.log('✅ Client ready\n');

    // Step 3: Test each endpoint
    const tests = [
      { name: 'Weather API', method: 'get', url: '/api/weather?city=Mumbai', expected: 'city' },
      { name: 'Crypto Price API', method: 'get', url: '/api/crypto-price', expected: 'BTC' },
      { name: 'Random Fact API', method: 'get', url: '/api/random-fact', expected: 'fact' },
      { name: 'AI Summary API', method: 'post', url: '/api/ai-summary', data: { text: 'This is a test text for summarization using x402 payments on Stacks blockchain.' }, expected: 'summary' }
    ];

    console.log('📝 Step 3: Testing payment flow on all endpoints...\n');

    for (const test of tests) {
      try {
        console.log(`🧪 Testing ${test.name}...`);
        
        let response;
        if (test.method === 'post') {
          response = await api.post(test.url, test.data);
        } else {
          response = await api.get(test.url);
        }

        if (response.data && response.data[test.expected]) {
          console.log(`✅ ${test.name} successful!`);
          console.log(`   Response:`, JSON.stringify(response.data).substring(0, 100) + '...');
          
          // Check for payment response header
          if (response.headers['payment-response']) {
            console.log(`   💰 Payment confirmed via header`);
          }
        } else {
          console.log(`⚠️  ${test.name} returned data but unexpected format`);
        }
        
        console.log('');
      } catch (error) {
        if (error.response && error.response.status === 402) {
          console.log(`💳 ${test.name} requires payment (402)`);
          console.log(`   Payment details:`, JSON.stringify(error.response.data).substring(0, 150));
          console.log(`   ⚠️  Payment signing failed - check wallet has STX`);
        } else {
          console.log(`❌ ${test.name} error:`, error.message);
        }
        console.log('');
      }
    }

    console.log('✅ Test complete!');
    console.log('\n📊 Check dashboard at http://localhost:3000 to see payments');

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run tests
testPayments();
