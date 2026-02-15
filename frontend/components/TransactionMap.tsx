'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Globe, DollarSign, Clock, TrendingUp } from 'lucide-react';

interface TransactionGeoData {
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

export default function TransactionMap() {
  const [transactions, setTransactions] = useState<TransactionGeoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<TransactionGeoData | null>(null);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const res = await fetch(`${backendUrl}/api/map/transactions?limit=50`);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch map data:', error);
      setLoading(false);
    }
  };

  // Group transactions by country
  const transactionsByCountry = transactions.reduce((acc, tx) => {
    const country = tx.country || 'Unknown';
    if (!acc[country]) {
      acc[country] = { count: 0, revenue: 0, transactions: [] };
    }
    acc[country].count += 1;
    acc[country].revenue += tx.amount;
    acc[country].transactions.push(tx);
    return acc;
  }, {} as Record<string, any>);

  const topCountries = Object.entries(transactionsByCountry)
    .map(([country, data]) => ({ country, ...data }))
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="glass-card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Global Payment Activity</h2>
            <p className="text-sm text-gray-400">Real-time transaction map</p>
          </div>
        </div>
        
        <div className="glass-pill px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-gray-300">{transactions.length} live</span>
          </div>
        </div>
      </div>

      {/* World Map Visualization (ASCII art placeholder - in production use react-simple-maps) */}
      <div className="relative mb-8 p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-px h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-blue-400/20"></div>
            ))}
          </div>
        </div>

        {/* Animated dots */}
        <div className="relative h-64 flex items-center justify-center">
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 opacity-20">
            🌍
          </div>
          
          {/* Pulse rings */}
          {transactions.slice(0, 8).map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 2], opacity: [1, 0.5, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut'
              }}
              className="absolute w-32 h-32 rounded-full border-2 border-blue-400"
              style={{
                left: `${20 + (i % 4) * 20}%`,
                top: `${30 + Math.floor(i / 4) * 30}%`
              }}
            />
          ))}
          
          {/* Transaction markers */}
          {transactions.slice(0, 12).map((tx, i) => (
            <motion.button
              key={tx.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedTx(tx)}
              className="absolute group"
              style={{
                left: `${15 + (i % 6) * 15}%`,
                top: `${25 + Math.floor(i / 6) * 40}%`
              }}
            >
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 opacity-50 group-hover:scale-150 transition-transform"></div>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <div className="glass-pill px-3 py-2 text-xs">
                  <div className="font-bold text-white">{tx.city}, {tx.country}</div>
                  <div className="text-green-400">{tx.amount.toFixed(4)} {tx.token}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 glass-pill px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-gray-300">Active</span>
          </div>
          <div className="flex items-center gap-2 glass-pill px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-gray-300">Processing</span>
          </div>
        </div>
      </div>

      {/* Top Countries */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {topCountries.map((country: any, index) => (
          <motion.div
            key={country.country}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-subtle p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <MapPin className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className={`text-xs font-bold ${
                index === 0 ? 'text-yellow-400' :
                index === 1 ? 'text-gray-300' :
                index === 2 ? 'text-orange-400' :
                'text-gray-500'
              }`}>
                #{index + 1}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1">{country.country}</h3>
            
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Payments</span>
                <span className="text-white font-semibold">{country.count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Revenue</span>
                <span className="text-green-400 font-semibold">{country.revenue.toFixed(4)} STX</span>
              </div>
            </div>

            {/* Mini progress bar */}
            <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(country.revenue / topCountries[0].revenue) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Transaction Detail */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTx(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Transaction Details</h3>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Location</div>
                  <div className="text-xl font-bold text-white">
                    {selectedTx.city}, {selectedTx.country}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Amount</div>
                    <div className="text-xl font-bold text-green-400">
                      {selectedTx.amount.toFixed(6)} {selectedTx.token}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Endpoint</div>
                    <div className="text-sm font-mono text-white">
                      {selectedTx.endpoint.replace('/api/', '')}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Timestamp</div>
                  <div className="text-sm text-white">
                    {new Date(selectedTx.timestamp).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Coordinates</div>
                  <div className="text-sm font-mono text-gray-300">
                    {selectedTx.lat.toFixed(4)}, {selectedTx.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
