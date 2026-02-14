import { supabase } from './src/supabase';

/**
 * Migration: Add provider_wallet column and backfill data
 * 
 * This script:
 * 1. Adds provider_wallet column to payment_events table
 * 2. Backfills existing payments with demo provider wallets
 */

async function migrate() {
  console.log('🔄 Starting migration: Add provider_wallet column...\n');

  try {
    // Note: Supabase doesn't support ALTER TABLE via JS client
    // You need to run this SQL in Supabase SQL Editor:
    console.log('📋 Step 1: Add column (run in Supabase SQL Editor):');
    console.log(`
ALTER TABLE payment_events 
ADD COLUMN IF NOT EXISTS provider_wallet TEXT;
    `);

    console.log('\n⏳ Waiting for you to run the SQL above...');
    console.log('Press ENTER after running the SQL in Supabase dashboard...');
    
    // For now, let's just do the backfill
    console.log('\n🔄 Step 2: Backfilling existing data...\n');

    // Provider wallet mapping
    const providerMap: Record<string, string> = {
      '/api/weather': 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Weather Data Pro
      '/api/crypto-price': 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', // Crypto Price Oracle
      '/api/random-fact': 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', // Also Crypto Oracle
      '/api/ai-summary': 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN', // AI Text Intelligence
    };

    // Get all payments
    const { data: payments, error: fetchError } = await supabase
      .from('payment_events')
      .select('id, endpoint')
      .is('provider_wallet', null);

    if (fetchError) {
      console.error('❌ Error fetching payments:', fetchError);
      return;
    }

    if (!payments || payments.length === 0) {
      console.log('✅ All payments already have provider_wallet set!');
      return;
    }

    console.log(`📊 Found ${payments.length} payments to update\n`);

    // Update each payment
    let updated = 0;
    for (const payment of payments) {
      const providerWallet = providerMap[payment.endpoint] || providerMap['/api/weather']; // Default to weather

      const { error: updateError } = await supabase
        .from('payment_events')
        .update({ provider_wallet: providerWallet })
        .eq('id', payment.id);

      if (updateError) {
        console.error(`❌ Error updating payment ${payment.id}:`, updateError);
      } else {
        updated++;
        console.log(`✅ ${updated}/${payments.length} - ${payment.endpoint} → ${providerWallet.substring(0, 10)}...`);
      }
    }

    console.log(`\n🎉 Migration complete! Updated ${updated}/${payments.length} payments`);

  } catch (error: any) {
    console.error('💥 Migration failed:', error);
  }
}

migrate();
