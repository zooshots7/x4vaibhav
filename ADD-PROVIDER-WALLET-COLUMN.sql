-- Migration: Add provider_wallet column to payment_events
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)

-- Step 1: Add the column
ALTER TABLE payment_events 
ADD COLUMN IF NOT EXISTS provider_wallet TEXT;

-- Step 2: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_events_provider_wallet 
ON payment_events(provider_wallet);

-- Step 3: Backfill existing data with demo providers
UPDATE payment_events 
SET provider_wallet = CASE 
  WHEN endpoint LIKE '%weather%' THEN 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
  WHEN endpoint LIKE '%crypto%' THEN 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG'
  WHEN endpoint LIKE '%random-fact%' THEN 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG'
  WHEN endpoint LIKE '%ai%' THEN 'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN'
  ELSE 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
END
WHERE provider_wallet IS NULL;

-- Verify the update
SELECT endpoint, provider_wallet, COUNT(*) as count
FROM payment_events
GROUP BY endpoint, provider_wallet
ORDER BY endpoint;
