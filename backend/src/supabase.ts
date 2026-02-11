import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not set - database features will not work');
  console.warn('  SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.warn('  SUPABASE_KEY:', supabaseKey ? 'SET' : 'MISSING');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);

// Database types
export interface PaymentEvent {
  id?: string;
  created_at?: string;
  endpoint: string;
  amount: number;
  token: 'STX' | 'sBTC' | 'USDCx';
  status: 'success' | 'failed' | 'pending';
  sender_address?: string;
  transaction_hash?: string;
  api_key: string;
  metadata?: any;
}

export interface ApiKey {
  id?: string;
  created_at?: string;
  api_key: string;
  name: string;
  active?: boolean;
}
