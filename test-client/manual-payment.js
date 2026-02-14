import axios from 'axios';
import { makeSTXTokenTransfer, broadcastTransaction } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:3002';
const PRIVATE_KEY = process.env.STACKS_PRIVATE_KEY;

async function testManualPayment() {
  try {
    console.log('🚀 Testing manual x402 payment flow\n');
    
    // Step 1: Request the resource (get 402)
    console.log('📝 Step 1: Requesting protected resource...');
    try {
      await axios.get(`${API_URL}/api/weather?city=Mumbai`);
    } catch (error) {
      if (error.response && error.response.status === 402) {
        console.log('✅ Got 402 Payment Required');
        const paymentInfo = error.response.data;
        console.log('💰 Payment details:');
        console.log('   Amount:', paymentInfo.accepts[0].amount, 'microSTX');
        console.log('   Asset:', paymentInfo.accepts[0].asset);
        console.log('   Network:', paymentInfo.accepts[0].network);
        console.log('');
        
        // For now, let's see if the x402-stacks client works with proper setup
        console.log('❌ Manual payment flow not yet implemented');
        console.log('   Need to use x402-stacks facilitator');
        return;
      }
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testManualPayment();
