'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Activity, 
  DollarSign, 
  TrendingUp, 
  Zap,
  ExternalLink,
  CheckCircle,
  Clock,
  Shield,
  Award,
  AlertTriangle,
  TrendingDown,
  Users,
  Store
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import MarketplaceTab from '../components/MarketplaceTab';

type Tab = 'analytics' | 'credit' | 'security' | 'marketplace';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [stats, setStats] = useState({
    totalRevenue: '0.000000',
    totalPayments: 0,
    successRate: 0,
    avgPayment: '0.000000'
  });
  const [payments, setPayments] = useState<any[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
  
  // Credit Bureau State
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [searchAddress, setSearchAddress] = useState('');
  const [creditResult, setCreditResult] = useState<any>(null);
  
  // Security State
  const [alerts, setAlerts] = useState<any[]>([]);
  
  // Marketplace State
  const [providers, setProviders] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const statsRes = await fetch('http://localhost:3001/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const paymentsRes = await fetch('http://localhost:3001/api/payments/recent?limit=20');
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData);
      
      buildRevenueHistory(paymentsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };
  
  // Fetch credit data
  const fetchCreditData = async () => {
    try {
      const leaderboardRes = await fetch('http://localhost:3001/api/credit/leaderboard?limit=10');
      const leaderboardData = await leaderboardRes.json();
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to fetch credit data:', error);
    }
  };
  
  // Fetch security data
  const fetchSecurityData = async () => {
    try {
      const alertsRes = await fetch('http://localhost:3001/api/security/alerts');
      const alertsData = await alertsRes.json();
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    }
  };
  
  // Fetch marketplace data
  const fetchMarketplaceData = async () => {
    try {
      const providersRes = await fetch('http://localhost:3001/api/providers');
      const providersData = await providersRes.json();
      setProviders(providersData);
      
      const trendingRes = await fetch('http://localhost:3001/api/trending?limit=5');
      const trendingData = await trendingRes.json();
      setTrending(trendingData);
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
    }
  };

  const buildRevenueHistory = (paymentData: any[]) => {
    const history: any[] = [];
    let cumulative = 0;
    
    paymentData.slice().reverse().forEach((p, i) => {
      cumulative += parseFloat(p.amount);
      history.push({
        index: i + 1,
        revenue: parseFloat(cumulative.toFixed(6)),
        time: new Date(p.timestamp || p.created_at).toLocaleTimeString()
      });
    });
    
    setRevenueHistory(history);
  };
  
  const searchCredit = async () => {
    if (!searchAddress) return;
    try {
      const res = await fetch(`http://localhost:3001/api/credit/${searchAddress}`);
      const data = await res.json();
      setCreditResult(data);
    } catch (error) {
      console.error('Credit search failed:', error);
      toast.error('Failed to fetch credit score');
    }
  };

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001');
    
    newSocket.on('connect', () => {
      console.log('✅ Connected to backend');
      setConnected(true);
      fetchData();
      fetchCreditData();
      fetchSecurityData();
      toast.success('🎉 Connected to real-time feed!', {
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #0ea5e9'
        }
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from backend');
      setConnected(false);
    });

    newSocket.on('new-payment', (payment: any) => {
      console.log('💰 New payment received:', payment);
      setPayments(prev => [payment, ...prev].slice(0, 50));
      fetchData();
      fetchCreditData();
      fetchSecurityData();
      fetchMarketplaceData();
      
      toast.success(
        <div>
          <div className="font-bold">New Payment! 💰</div>
          <div className="text-sm">{payment.amount} {payment.token}</div>
        </div>,
        {
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #10b981'
          },
          duration: 3000
        }
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Animated stat card
  const StatCard = ({ icon: Icon, label, value, trend, color = "cyan" }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-xl p-6 backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 shadow-2xl"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg bg-${color}-500/10`}>
            <Icon className={`w-5 h-5 text-${color}-400`} />
          </div>
          {trend && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </span>
          )}
        </div>
        <h3 className="text-slate-400 text-sm mb-1">{label}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                x402Metrics
              </h1>
              <p className="text-slate-400 text-lg">
                Intelligence Infrastructure for Autonomous Agents
              </p>
            </div>
            
            <motion.div 
              className="flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-xl bg-slate-900/50 border border-slate-800/50"
              animate={{ 
                borderColor: connected ? '#10b981' : '#ef4444',
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
                animate={{ 
                  scale: connected ? [1, 1.2, 1] : 1,
                  opacity: connected ? [1, 0.5, 1] : 1
                }}
                transition={{ 
                  repeat: connected ? Infinity : 0,
                  duration: 2 
                }}
              />
              <span className="text-sm font-medium">
                {connected ? 'Live' : 'Disconnected'}
              </span>
            </motion.div>
          </div>
        </motion.header>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {[
            { id: 'analytics' as Tab, label: 'Analytics', icon: Activity },
            { id: 'credit' as Tab, label: 'Credit Bureau', icon: Award },
            { id: 'marketplace' as Tab, label: 'Marketplace', icon: Store },
            { id: 'security' as Tab, label: 'Security', icon: Shield }
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800/50 hover:border-slate-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard 
                  icon={DollarSign}
                  label="Total Revenue"
                  value={`${stats.totalRevenue} STX`}
                  color="cyan"
                />
                <StatCard 
                  icon={Activity}
                  label="Total Payments"
                  value={stats.totalPayments}
                  color="blue"
                />
                <StatCard 
                  icon={CheckCircle}
                  label="Success Rate"
                  value={`${stats.successRate}%`}
                  color="green"
                />
                <StatCard 
                  icon={Zap}
                  label="Avg Payment"
                  value={`${stats.avgPayment} STX`}
                  color="purple"
                />
              </div>

              {/* Revenue Chart */}
              {revenueHistory.length > 0 && (
                <div className="mb-8 rounded-xl p-6 backdrop-blur-xl bg-slate-900/50 border border-slate-800/50">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Revenue Over Time
                  </h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={revenueHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="index" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#06b6d4" 
                        strokeWidth={3}
                        dot={{ fill: '#06b6d4', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Payment Feed */}
              <div className="rounded-xl p-6 backdrop-blur-xl bg-slate-900/50 border border-slate-800/50">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Live Payment Feed
                </h2>
                
                {payments.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500">No payments yet...</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {payments.map((payment, i) => (
                      <motion.div
                        key={payment.id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center justify-between p-4 rounded-lg backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-all"
                      >
                        <div className="flex-1">
                          <span className="font-mono text-sm text-cyan-400 font-bold">
                            {payment.endpoint}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(payment.timestamp || payment.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {payment.amount} <span className="text-cyan-400">{payment.token}</span>
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'credit' && (
            <motion.div
              key="credit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Credit Search */}
              <div className="mb-8 rounded-xl p-6 backdrop-blur-xl bg-slate-900/50 border border-slate-800/50">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  Agent Credit Score Lookup
                </h2>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Enter Stacks address (ST1...)"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
                  />
                  <button
                    onClick={searchCredit}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium transition-colors"
                  >
                    Search
                  </button>
                </div>
                
                {creditResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-6xl font-bold text-cyan-400">{creditResult.score}</div>
                        <div className="text-lg text-slate-400 mt-2">{creditResult.rating}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-400">{creditResult.discount}% OFF</div>
                        <div className="text-sm text-slate-400 mt-1">Eligible Discount</div>
                      </div>
                    </div>
                    
                    {creditResult.recommendations && creditResult.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-slate-400 mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {creditResult.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm text-slate-300">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Leaderboard */}
              <div className="rounded-xl p-6 backdrop-blur-xl bg-slate-900/50 border border-slate-800/50">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Top Agents by Credit Score
                </h2>
                <div className="space-y-3">
                  {leaderboard.map((agent, i) => (
                    <motion.div
                      key={agent.address}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          i === 1 ? 'bg-slate-400/20 text-slate-300' :
                          i === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-slate-700/20 text-slate-400'
                        }`}>
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-mono text-sm font-bold">{agent.address}</div>
                          <div className="text-xs text-slate-500">{agent.totalPayments} payments</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-cyan-400">{agent.score}</div>
                        <div className="text-xs text-green-400">{agent.discount}% discount</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MarketplaceTab providers={providers} trending={trending} />
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="rounded-xl p-6 backdrop-blur-xl bg-slate-900/50 border border-slate-800/50">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  Security Alerts
                </h2>
                
                {alerts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-slate-400">No security threats detected</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert, i) => (
                      <motion.div
                        key={alert.address}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-4 rounded-lg border ${
                          alert.severity === 'high' 
                            ? 'bg-red-900/20 border-red-500/50' 
                            : 'bg-yellow-900/20 border-yellow-500/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className={`w-5 h-5 ${
                              alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                            }`} />
                            <div>
                              <div className="font-mono text-sm font-bold">{alert.address}</div>
                              <div className="text-sm text-slate-300 mt-1">{alert.reason}</div>
                              <div className="text-xs text-slate-500 mt-2">
                                {alert.totalPayments} payments • Last seen: {new Date(alert.lastSeen).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            alert.severity === 'high'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
}
