#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDatabase() {
  console.log('🗑️  Clearing all payment events from database...\n');
  
  // First, show current count
  const { data: beforeData, error: beforeError } = await supabase
    .from('payment_events')
    .select('*', { count: 'exact', head: true });
  
  if (beforeError) {
    console.error('❌ Error checking database:', beforeError);
    process.exit(1);
  }
  
  console.log(`📊 Current records: ${beforeData?.length || 0}`);
  
  // Delete all records
  const { error: deleteError } = await supabase
    .from('payment_events')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (dummy condition)
  
  if (deleteError) {
    console.error('❌ Error deleting records:', deleteError);
    process.exit(1);
  }
  
  // Verify deletion
  const { count } = await supabase
    .from('payment_events')
    .select('*', { count: 'exact', head: true });
  
  console.log(`✅ Database cleared! Remaining records: ${count || 0}\n`);
  console.log('🎯 Ready for real blockchain transactions!\n');
}

clearDatabase().catch(console.error);
