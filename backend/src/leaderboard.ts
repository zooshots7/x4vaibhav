// Provider Leaderboard Logic
import { supabase } from './supabase';

export interface ProviderStats {
  provider_wallet: string;
  provider_name: string;
  total_revenue: number;
  total_payments: number;
  unique_consumers: number;
  avg_payment: number;
  endpoints: string[];
  rank: number;
}

export async function getProviderLeaderboard(limit: number = 10): Promise<ProviderStats[]> {
  try {
    // Get all successful payments
    const { data: payments, error } = await supabase
      .from('payment_events')
      .select('provider_wallet, endpoint, amount, sender_address')
      .eq('status', 'success')
      .not('provider_wallet', 'is', null);
    
    if (error) throw error;
    
    // Group by provider_wallet
    const providerMap = new Map<string, any>();
    
    payments?.forEach(payment => {
      const wallet = payment.provider_wallet;
      
      if (!providerMap.has(wallet)) {
        providerMap.set(wallet, {
          provider_wallet: wallet,
          total_revenue: 0,
          total_payments: 0,
          consumers: new Set(),
          endpoints: new Set(),
        });
      }
      
      const provider = providerMap.get(wallet);
      provider.total_revenue += parseFloat(payment.amount.toString());
      provider.total_payments += 1;
      provider.consumers.add(payment.sender_address);
      provider.endpoints.add(payment.endpoint);
    });
    
    // Convert to array and calculate stats
    const leaderboard: ProviderStats[] = Array.from(providerMap.values()).map(p => ({
      provider_wallet: p.provider_wallet,
      provider_name: getProviderName(p.provider_wallet),
      total_revenue: p.total_revenue,
      total_payments: p.total_payments,
      unique_consumers: p.consumers.size,
      avg_payment: p.total_revenue / p.total_payments,
      endpoints: Array.from(p.endpoints),
      rank: 0 // Will be assigned after sorting
    }));
    
    // Sort by total revenue descending
    leaderboard.sort((a, b) => b.total_revenue - a.total_revenue);
    
    // Assign ranks
    leaderboard.forEach((provider, index) => {
      provider.rank = index + 1;
    });
    
    return leaderboard.slice(0, limit);
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    return [];
  }
}

// Map wallet addresses to provider names
function getProviderName(wallet: string): string {
  const providerNames: Record<string, string> = {
    'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM': 'Weather Data Pro',
    'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG': 'Crypto Price Oracle',
    'ST3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSPNET8TN': 'AI Text Intelligence'
  };
  
  return providerNames[wallet] || wallet.substring(0, 8) + '...' + wallet.substring(wallet.length - 6);
}

export interface TransactionGeoData {
  id: string;
  lat: number;
  lng: number;
  amount: number;
  token: string;
  endpoint: string;
  timestamp: string;
  city?: string;
  country?: string;
}

// Generate mock geo data for demo (in production, use IP geolocation)
export function generateTransactionMap(payments: any[]): TransactionGeoData[] {
  const cities = [
    { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
    { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
    { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
    { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
    { city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
    { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
    { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
    { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
    { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 }
  ];
  
  return payments.slice(0, 50).map((payment, index) => {
    const location = cities[index % cities.length];
    return {
      id: payment.id,
      lat: location.lat + (Math.random() - 0.5) * 0.1, // Add some jitter
      lng: location.lng + (Math.random() - 0.5) * 0.1,
      amount: parseFloat(payment.amount),
      token: payment.token,
      endpoint: payment.endpoint,
      timestamp: payment.created_at,
      city: location.city,
      country: location.country
    };
  });
}

export interface FraudPattern {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  addresses: string[];
  count: number;
}

export async function detectFraudPatterns(): Promise<FraudPattern[]> {
  try {
    const { data: payments, error } = await supabase
      .from('payment_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (error) throw error;
    
    const patterns: FraudPattern[] = [];
    
    // Pattern 1: Rapid-fire payments (>10 in 1 minute)
    const addressTimestamps = new Map<string, Date[]>();
    payments?.forEach(p => {
      if (!p.sender_address) return;
      if (!addressTimestamps.has(p.sender_address)) {
        addressTimestamps.set(p.sender_address, []);
      }
      addressTimestamps.get(p.sender_address)!.push(new Date(p.created_at));
    });
    
    const rapidFireAddresses: string[] = [];
    addressTimestamps.forEach((timestamps, address) => {
      timestamps.sort((a, b) => b.getTime() - a.getTime());
      for (let i = 0; i < timestamps.length - 10; i++) {
        const timeWindow = timestamps[i].getTime() - timestamps[i + 10].getTime();
        if (timeWindow < 60000) { // 10 payments in less than 1 minute
          rapidFireAddresses.push(address);
          break;
        }
      }
    });
    
    if (rapidFireAddresses.length > 0) {
      patterns.push({
        type: 'rapid-fire',
        severity: 'high',
        description: 'Multiple payments in rapid succession',
        addresses: rapidFireAddresses,
        count: rapidFireAddresses.length
      });
    }
    
    // Pattern 2: Unusual amounts (>1 STX per payment)
    const highAmountAddresses = new Set<string>();
    payments?.forEach(p => {
      if (parseFloat(p.amount) > 1.0 && p.sender_address) {
        highAmountAddresses.add(p.sender_address);
      }
    });
    
    if (highAmountAddresses.size > 0) {
      patterns.push({
        type: 'unusual-amounts',
        severity: 'medium',
        description: 'Payments exceeding normal threshold',
        addresses: Array.from(highAmountAddresses),
        count: highAmountAddresses.size
      });
    }
    
    // Pattern 3: Failed payment spikes
    const addressFailures = new Map<string, number>();
    payments?.forEach(p => {
      if (p.status !== 'success' && p.sender_address) {
        addressFailures.set(p.sender_address, (addressFailures.get(p.sender_address) || 0) + 1);
      }
    });
    
    const highFailureAddresses: string[] = [];
    addressFailures.forEach((failures, address) => {
      if (failures > 5) {
        highFailureAddresses.push(address);
      }
    });
    
    if (highFailureAddresses.length > 0) {
      patterns.push({
        type: 'failed-payments',
        severity: 'low',
        description: 'Multiple failed payment attempts',
        addresses: highFailureAddresses,
        count: highFailureAddresses.length
      });
    }
    
    return patterns;
    
  } catch (error) {
    console.error('Fraud pattern detection error:', error);
    return [];
  }
}
