// Simulate successful x402 payments to populate dashboard
import dotenv from 'dotenv';
dotenv.config();

const BACKEND_URL = 'http://localhost:3001';
const YOUR_ADDRESS = 'ST1Z6ZQD1D8QQH6JBK1VV52SSXSQZT5NCK59BS914';

const endpoints = [
  { path: '/api/weather', amount: '0.005' },
  { path: '/api/crypto-price', amount: '0.003' },
  { path: '/api/ai-summary', amount: '0.01' },
  { path: '/api/random-fact', amount: '0.001' },
];

console.log('💰 Simulating x402 payments to test dashboard\n');

async function simulatePayment(endpoint, amount) {
  try {
    const response = await fetch(`${BACKEND_URL}/webhook/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint,
        amount,
        token: 'STX',
        payer: YOUR_ADDRESS,
        txHash: '0x' + Math.random().toString(16).substring(2, 42),
        timestamp: new Date().toISOString()
      })
    });
    
    const data = await response.json();
    console.log(`✅ ${endpoint} - ${amount} STX - Payment ID: ${data.paymentId}`);
  } catch (error) {
    console.error(`❌ ${endpoint} failed:`, error.message);
  }
}

async function run() {
  console.log('Creating 20 test payments...\n');
  
  for (let i = 0; i < 20; i++) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    await simulatePayment(endpoint.path, endpoint.amount);
    await new Promise(r => setTimeout(r, 500)); // 500ms delay
  }
  
  console.log('\n✅ Complete! Check dashboard at http://localhost:3000');
  console.log('\n📊 Dashboard should show:');
  console.log('  - 20 payments in live feed');
  console.log('  - Revenue stats updated');
  console.log('  - Real-time updates via Socket.io');
}

run();
