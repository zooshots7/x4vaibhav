import axios from 'axios';
import { wrapAxiosWithPayment, privateKeyToAccount, decodePaymentResponse } from 'x402-stacks';
import dotenv from 'dotenv';

dotenv.config();

const DEMO_API_URL = process.env.DEMO_API_URL || 'http://localhost:3002';
const NETWORK = process.env.STACKS_NETWORK || 'testnet';

console.log('🚀 x402 Payment Client Test (Fixed Version)\n');
console.log('Configuration:');
console.log('  Demo API:', DEMO_API_URL);
console.log('  Network:', NETWORK);
console.log('');

async function testPayments() {
  try {
    // Step 1: Setup wallet
    console.log('📝 Step 1: Setting up wallet...');
    
    if (!process.env.STACKS_PRIVATE_KEY) {
      console.error('❌ Missing STACKS_PRIVATE_KEY in .env');
      process.exit(1);
    }

    const account = privateKeyToAccount(process.env.STACKS_PRIVATE_KEY, NETWORK);
    console.log('✅ Using wallet:', account.address);
    console.log('');

    // Step 2: Create payment-enabled API client (FIXED VERSION)
    console.log('📝 Step 2: Creating payment client...');
    const axiosInstance = axios.create({ baseURL: DEMO_API_URL });
    const api = wrapAxiosWithPayment(axiosInstance, account);
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
          
          // Check payment details
          const paymentResponse = decodePaymentResponse(response.headers['payment-response']);
          if (paymentResponse) {
            console.log(`   💰 Payment confirmed!`);
            console.log(`   📝 Transaction: ${paymentResponse.transaction}`);
            console.log(`   👤 Payer: ${paymentResponse.payer}`);
            console.log(`   🔗 Explorer: https://explorer.hiro.so/txid/${paymentResponse.transaction}?chain=testnet`);
          }
        } else {
          console.log(`⚠️  ${test.name} returned data but unexpected format`);
        }
        
        console.log('');
      } catch (error) {
        console.error(`❌ ${test.name} error:`, error.message);
        if (error.response) {
          console.error(`   Status:`, error.response.status);
          console.error(`   Data:`, JSON.stringify(error.response.data).substring(0, 150));
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
