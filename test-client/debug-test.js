import { privateKeyToAccount } from 'x402-stacks';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Debug Test\n');

const PRIVATE_KEY = process.env.STACKS_PRIVATE_KEY;
const NETWORK = process.env.STACKS_NETWORK || 'testnet';

console.log('Config:');
console.log('  Private Key:', PRIVATE_KEY ? 'Set ✅' : 'Missing ❌');
console.log('  Network:', NETWORK);
console.log('');

try {
  console.log('Creating account...');
  const account = privateKeyToAccount(PRIVATE_KEY, NETWORK);
  
  console.log('✅ Account created!');
  console.log('  Address:', account.address);
  console.log('  Type:', typeof account);
  console.log('  Keys:', Object.keys(account));
  console.log('');
  console.log('Full account object:');
  console.log(JSON.stringify(account, null, 2));
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
