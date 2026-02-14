/**
 * Agent Credit Bureau - Trust Layer for Autonomous Agents
 * Calculates credit scores based on payment behavior
 */

interface PaymentHistory {
  payer: string;
  totalPayments: number;
  successfulPayments: number;
  totalVolume: number;
  avgPaymentSize: number;
  firstPayment: Date;
  lastPayment: Date;
  uniqueEndpoints: number;
  suspiciousActivity: boolean;
}

interface CreditScore {
  score: number; // 300-850 (like FICO)
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  discount: number; // Percentage discount (0-30%)
  factors: {
    paymentHistory: number;
    volume: number;
    diversity: number;
    age: number;
    fraud: number;
  };
  recommendations: string[];
}

/**
 * Calculate credit score for an agent based on payment history
 */
export function calculateCreditScore(history: PaymentHistory): CreditScore {
  // Base score starts at 500
  let score = 500;
  const factors = {
    paymentHistory: 0,
    volume: 0,
    diversity: 0,
    age: 0,
    fraud: 0
  };

  // 1. Payment History (35% weight) - Max +175 points
  const successRate = history.successfulPayments / history.totalPayments;
  const historyScore = successRate * 175;
  score += historyScore;
  factors.paymentHistory = historyScore;

  // 2. Total Volume (30% weight) - Max +150 points
  // $0.001 STX = 1 point, cap at $1 STX = 150 points
  const volumeScore = Math.min(history.totalVolume * 150, 150);
  score += volumeScore;
  factors.volume = volumeScore;

  // 3. Endpoint Diversity (20% weight) - Max +100 points
  // More endpoints used = more trustworthy agent
  const diversityScore = Math.min(history.uniqueEndpoints * 25, 100);
  score += diversityScore;
  factors.diversity = diversityScore;

  // 4. Account Age (10% weight) - Max +50 points
  const daysSinceFirst = Math.floor(
    (new Date().getTime() - new Date(history.firstPayment).getTime()) / (1000 * 60 * 60 * 24)
  );
  const ageScore = Math.min(daysSinceFirst * 2, 50);
  score += ageScore;
  factors.age = ageScore;

  // 5. Fraud Indicators (5% weight) - Can subtract up to -125 points
  if (history.suspiciousActivity) {
    score -= 125;
    factors.fraud = -125;
  }

  // Cap score between 300 and 850
  score = Math.max(300, Math.min(850, Math.round(score)));

  // Determine rating
  let rating: CreditScore['rating'];
  if (score >= 750) rating = 'Excellent';
  else if (score >= 650) rating = 'Good';
  else if (score >= 550) rating = 'Fair';
  else rating = 'Poor';

  // Calculate discount based on score
  let discount = 0;
  if (score >= 800) discount = 30;
  else if (score >= 750) discount = 20;
  else if (score >= 700) discount = 15;
  else if (score >= 650) discount = 10;
  else if (score >= 600) discount = 5;

  // Generate recommendations
  const recommendations: string[] = [];
  if (factors.paymentHistory < 150) {
    recommendations.push('Complete more successful payments to improve your score');
  }
  if (factors.volume < 100) {
    const needed = ((100 - factors.volume) / 150).toFixed(3);
    recommendations.push(`Increase payment volume by ${needed} STX to boost score`);
  }
  if (factors.diversity < 75) {
    const needed = Math.ceil((75 - factors.diversity) / 25);
    recommendations.push(`Use ${needed} more unique endpoints to show diversity`);
  }
  if (factors.age < 30) {
    recommendations.push('Continue building payment history over time');
  }
  if (factors.fraud < 0) {
    recommendations.push('⚠️ Suspicious activity detected - contact support');
  }

  return {
    score,
    rating,
    discount,
    factors,
    recommendations
  };
}

/**
 * Detect fraud indicators
 */
export function detectFraud(payments: any[]): boolean {
  if (payments.length === 0) return false;

  // Check 1: Rapid-fire requests (>10 requests in 5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const recentPayments = payments.filter(p => 
    new Date(p.timestamp || p.created_at).getTime() > fiveMinutesAgo
  );
  if (recentPayments.length > 10) return true;

  // Check 2: All same endpoint (bot behavior)
  const endpoints = new Set(payments.map(p => p.endpoint));
  if (endpoints.size === 1 && payments.length > 20) return true;

  // Check 3: Exact same amount every time (scripted)
  const amounts = new Set(payments.map(p => p.amount));
  if (amounts.size === 1 && payments.length > 15) return true;

  return false;
}

/**
 * Calculate discount for a given credit score
 */
export function getDiscountForScore(score: number): number {
  if (score >= 800) return 0.30;
  if (score >= 750) return 0.20;
  if (score >= 700) return 0.15;
  if (score >= 650) return 0.10;
  if (score >= 600) return 0.05;
  return 0;
}
