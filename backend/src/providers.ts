/**
 * Provider Marketplace - Infrastructure Layer for x402 APIs
 * Allows API providers to register, manage pricing, and track revenue
 */

export interface Provider {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  endpoints: ProviderEndpoint[];
  totalRevenue: number;
  totalRequests: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderEndpoint {
  id: string;
  providerId: string;
  name: string;
  path: string;
  baseUrl: string;
  description: string;
  pricing: {
    basePrice: number;
    currency: 'STX' | 'sBTC' | 'USDCx';
    peakHourMultiplier?: number;
    volumeDiscounts?: {
      threshold: number;
      discountPercent: number;
    }[];
  };
  category: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  featured: boolean;
  verified: boolean;
  totalRevenue: number;
  totalRequests: number;
  averageResponseTime?: number;
  successRate?: number;
}

export interface ProviderStats {
  providerId: string;
  totalRevenue: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageRevenue: number;
  topEndpoint: string;
  revenueByEndpoint: Record<string, number>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    requests: number;
  }>;
}

/**
 * Calculate dynamic pricing based on time and usage
 */
export function calculateDynamicPrice(
  basePrice: number,
  peakHourMultiplier?: number,
  currentHour?: number
): number {
  let price = basePrice;

  // Peak hours: 9am-5pm weekdays
  if (peakHourMultiplier && currentHour) {
    const isPeakHour = currentHour >= 9 && currentHour <= 17;
    const isWeekday = new Date().getDay() >= 1 && new Date().getDay() <= 5;
    
    if (isPeakHour && isWeekday) {
      price *= peakHourMultiplier;
    }
  }

  return price;
}

/**
 * Calculate revenue split (95% provider, 5% platform)
 */
export function calculateRevenueSplit(amount: number): {
  providerShare: number;
  platformFee: number;
} {
  const platformFeePercent = 0.05; // 5%
  const platformFee = amount * platformFeePercent;
  const providerShare = amount - platformFee;

  return {
    providerShare: parseFloat(providerShare.toFixed(6)),
    platformFee: parseFloat(platformFee.toFixed(6))
  };
}

/**
 * Get trending APIs based on recent activity
 */
export function getTrendingScore(
  requests24h: number,
  revenue24h: number,
  growthRate: number
): number {
  // Weighted scoring: 40% requests, 30% revenue, 30% growth
  const requestsScore = Math.min(requests24h / 1000, 1) * 40;
  const revenueScore = Math.min(revenue24h / 10, 1) * 30;
  const growthScore = Math.min(growthRate / 2, 1) * 30;

  return requestsScore + revenueScore + growthScore;
}

/**
 * Categorize endpoints
 */
export const ENDPOINT_CATEGORIES = [
  'AI/ML',
  'Data Analytics',
  'Blockchain',
  'Weather',
  'Finance',
  'Social Media',
  'IoT',
  'Security',
  'Other'
] as const;

export type EndpointCategory = typeof ENDPOINT_CATEGORIES[number];
