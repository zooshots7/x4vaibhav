'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users, DollarSign, Award } from 'lucide-react';

interface ProviderStats {
  provider_wallet: string;
  provider_name: string;
  total_revenue: number;
  total_payments: number;
  unique_consumers: number;
  avg_payment: number;
  endpoints: string[];
  rank: number;
}

export default function ProviderLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<ProviderStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/leaderboard/providers?limit=10');
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-400 to-blue-600';
  };

  if (loading) {
    return (
      <div className="glass-card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Provider Leaderboard</h2>
            <p className="text-sm text-gray-400">Top earning API providers</p>
          </div>
        </div>
        
        <div className="glass-pill px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-gray-300">Live</span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {leaderboard.map((provider, index) => (
          <motion.div
            key={provider.provider_wallet}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <div className={`relative overflow-hidden rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 ${
              provider.rank <= 3 ? 'bg-gradient-to-r ' + getRankColor(provider.rank) + ' bg-opacity-10' : 'glass-subtle'
            }`}>
              {/* Glow effect for top 3 */}
              {provider.rank <= 3 && (
                <div className={`absolute inset-0 bg-gradient-to-r ${getRankColor(provider.rank)} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}></div>
              )}
              
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  {/* Left: Rank + Provider */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`text-4xl font-bold ${provider.rank <= 3 ? 'text-white' : 'text-gray-500'}`}>
                      {getMedalEmoji(provider.rank)}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {provider.provider_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{provider.total_payments} payments</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{provider.unique_consumers} consumers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          <span>{provider.endpoints.length} endpoints</span>
                        </div>
                      </div>
                      
                      {/* Reputation Badge */}
                      {provider.reputation && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            provider.reputation >= 800 ? 'bg-green-500/20 text-green-400' :
                            provider.reputation >= 600 ? 'bg-blue-500/20 text-blue-400' :
                            provider.reputation >= 400 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            <span>⭐</span>
                            <span>{provider.reputation}/1000 Reputation</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {provider.uptime}% uptime • {provider.successRate}% success
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Revenue */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                      {provider.total_revenue.toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-400">STX earned</div>
                    <div className="text-xs text-gray-500 mt-1">
                      avg {provider.avg_payment.toFixed(4)} STX
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {leaderboard.length > 0 && (
                  <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(provider.total_revenue / leaderboard[0].total_revenue) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full bg-gradient-to-r ${getRankColor(provider.rank)}`}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>No providers yet. Be the first!</p>
        </div>
      )}
    </div>
  );
}
