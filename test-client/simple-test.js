import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DEMO_API_URL = process.env.DEMO_API_URL || 'http://localhost:3002';

console.log('🧪 Simple x402 Test\n');

async function test() {
  try {
    // Step 1: Make request without payment
    console.log('📝 Making request to /api/weather...');
    const response = await axios.get(`${DEMO_API_URL}/api/weather`);
    
    console.log('✅ Response:', response.data);
  } catch (error) {
    if (error.response && error.response.status === 402) {
      console.log('✅ Got 402 Payment Required (expected)');
      console.log('📋 Payment details:');
      console.log(JSON.stringify(error.response.data, null, 2));
      
      const paymentHeader = error.response.headers['payment-required'];
      if (paymentHeader) {
        console.log('\n✅ Payment-required header present');
        const decoded = JSON.parse(Buffer.from(paymentHeader, 'base64').toString());
        console.log('📋 Decoded payment requirements:');
        console.log(JSON.stringify(decoded, null, 2));
      }
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

test();
