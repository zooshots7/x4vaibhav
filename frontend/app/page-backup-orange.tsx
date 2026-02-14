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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
import MarketplaceTab from '../components/MarketplaceTab';
import HeroSection from '../components/HeroSection';

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
  const [tokenData, setTokenData] = useState<any[]>([]);
  const [endpointData, setEndpointData] = useState<any[]>([]);
  
  // Credit Bureau State
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [searchAddress, setSearchAddress] = useState('');
  const [creditResult, setCreditResult] = useState<any>(null);
  
  // Security State
  const [alerts, setAlerts] = useState<any[]>([]);
  
  // Marketplace State
  const [providers, setProviders] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  
  // NEW FEATURES State
  const [fraudData, setFraudData] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [savingsData, setSavingsData] = useState<any>(null);
  const [webhookTestResult, setWebhookTestResult] = useState<any>(null);

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
      
      // Fetch token breakdown
      const tokenRes = await fetch('http://localhost:3001/api/analytics/by-token');
      const tokenBreakdown = await tokenRes.json();
      const tokenChartData = Object.entries(tokenBreakdown).map(([token, amount]: any) => ({
        name: token,
        value: parseFloat(amount.toFixed(6))
      }));
      setTokenData(tokenChartData);
      
      // Fetch endpoint breakdown
      const endpointRes = await fetch('http://localhost:3001/api/analytics/by-endpoint');
      const endpointBreakdown = await endpointRes.json();
      const endpointChartData = Object.entries(endpointBreakdown).map(([endpoint, data]: any) => ({
        name: endpoint.replace('/api/', ''),
        count: data.count,
        revenue: parseFloat(data.revenue.toFixed(6))
      }));
      setEndpointData(endpointChartData);
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
      
      // NEW: Also fetch savings data
      const savingsRes = await fetch(`http://localhost:3001/api/savings/${searchAddress}`);
      const savingsInfo = await savingsRes.json();
      setSavingsData(savingsInfo);
    } catch (error) {
      console.error('Credit search failed:', error);
      toast.error('Failed to fetch credit score');
    }
  };
  
  // NEW FEATURE FUNCTIONS
  
  // Download export
  const downloadExport = async (format: 'csv' | 'json') => {
    try {
      const url = `http://localhost:3001/api/export/${format}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `x402metrics-export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported to ${format.toUpperCase()}!`);
    } catch (error) {
      toast.error('Export failed');
    }
  };
  
  // Test webhook
  const testWebhook = async (scenario: string) => {
    try {
      const res = await fetch('http://localhost:3001/api/test/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const data = await res.json();
      setWebhookTestResult(data);
      toast.success('Test payment triggered!');
      
      // Refresh data
      setTimeout(() => fetchData(), 1000);
    } catch (error) {
      toast.error('Webhook test failed');
    }
  };
  
  // Fetch fraud data
  const fetchFraudData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/fraud/analytics');
      const data = await res.json();
      setFraudData(data);
    } catch (error) {
      console.error('Failed to fetch fraud data:', error);
    }
  };
  
  // Fetch heatmap data
  const fetchHeatmapData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/heatmap');
      const data = await res.json();
      setHeatmapData(data);
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
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
      fetchFraudData();
      fetchHeatmapData();
      toast.success('🎉 Connected to real-time feed!', {
        style: {
          background: '#1C1210',
          color: '#fff',
          border: '1px solid #FF6A00'
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
            background: '#1C1210',
            color: '#fff',
            border: '1px solid #FF8C42'
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

  // Animated stat card with orange glow
  const StatCard = ({ icon: Icon, label, value, trend, color = "#FF6A00" }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -8 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#FF6A00]/30 shadow-2xl glow-orange"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF6A00]/5 to-transparent opacity-50" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#F24C00]/10 border border-[#FF6A00]/30">
            <Icon className="w-6 h-6 text-[#FF7A1A]" />
          </div>
          {trend && (
            <span className="text-xs text-[#FF8C42] flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </span>
          )}
        </div>
        <h3 className="text-[#9E9E9E] text-sm mb-2 uppercase tracking-wide">{label}</h3>
        <p className="text-4xl font-black text-white">{value}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#0E0E0F] text-white p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Connection Status Badge */}
        <motion.div 
          className="flex justify-end mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-xl bg-[#1C1210]/90 border border-[#2A0F0B]/50 glow-orange"
            animate={{ 
              borderColor: connected ? '#FF6A00' : '#C62828',
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className={`w-3 h-3 rounded-full ${connected ? 'bg-[#FF6A00]' : 'bg-[#C62828]'} pulse-orange`}
            />
            <span className="text-sm font-medium">
              {connected ? '🔥 Live' : 'Disconnected'}
            </span>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {[
            { id: 'analytics' as Tab, label: 'Analytics', icon: Activity },
            { id: 'credit' as Tab, label: 'Credit Bureau', icon: Award },
            { id: 'marketplace' as Tab, label: 'Marketplace', icon: Store },
            { id: 'security' as Tab, label: 'Security', icon: Shield }
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#FF6A00]/30 to-[#F24C00]/20 text-[#FF7A1A] border border-[#FF6A00]/70 glow-orange shadow-[0_0_30px_rgba(255,106,0,0.4)]'
                  : 'bg-[#1C1210]/90 text-[#CFCFCF] border border-[#2A0F0B]/50 hover:border-[#FF6A00]/30 hover:text-[#FF8C42]'
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
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

              {/* NEW: Export & Tools Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Export Reports */}
                <div className="rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#FF6A00]/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-[#FF7A1A]" />
                    Export Data
                  </h3>
                  <p className="text-sm text-[#9E9E9E] mb-4">Download payment history for accounting</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadExport('csv')}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FF6A00] to-[#F24C00] rounded-lg font-semibold hover:from-[#FF8C42] hover:to-[#FF6A00] transition-all"
                    >
                      Download CSV
                    </button>
                    <button
                      onClick={() => downloadExport('json')}
                      className="flex-1 px-4 py-2 bg-[#1C1210] border border-[#FF6A00]/50 rounded-lg font-semibold hover:bg-[#FF6A00]/10 transition-all"
                    >
                      Download JSON
                    </button>
                  </div>
                </div>

                {/* Webhook Tester */}
                <div className="rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#FF6A00]/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#FF7A1A]" />
                    Webhook Tester
                  </h3>
                  <p className="text-sm text-[#9E9E9E] mb-4">Simulate test payments</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => testWebhook('success')}
                      className="flex-1 px-4 py-2 bg-[#1C1210] border border-[#10b981]/50 rounded-lg text-sm font-semibold hover:bg-[#10b981]/10 transition-all"
                    >
                      ✅ Success
                    </button>
                    <button
                      onClick={() => testWebhook('fraud')}
                      className="flex-1 px-4 py-2 bg-[#1C1210] border border-[#C62828]/50 rounded-lg text-sm font-semibold hover:bg-[#C62828]/10 transition-all"
                    >
                      🚨 Fraud
                    </button>
                  </div>
                  {webhookTestResult && (
                    <div className="mt-3 p-2 bg-[#10b981]/10 border border-[#10b981]/30 rounded text-xs">
                      ✅ Test payment triggered! Check feed below.
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue Chart */}
              {revenueHistory.length > 0 && (
                <div className="mb-8 rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#FF6A00]/30 shadow-2xl glow-orange-intense">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#FF6A00]/20 to-[#F24C00]/10">
                      <TrendingUp className="w-6 h-6 text-[#FF7A1A]" />
                    </div>
                    <span className="bg-gradient-to-r from-[#FF6A00] to-[#F24C00] bg-clip-text text-transparent">
                      Revenue Over Time
                    </span>
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueHistory}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.8}/>
                          <stop offset="50%" stopColor="#F24C00" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#D84315" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A0F0B" opacity={0.3} />
                      <XAxis 
                        dataKey="index" 
                        stroke="#9E9E9E" 
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#9E9E9E"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1C1210',
                          border: '1px solid #FF6A00',
                          borderRadius: '12px',
                          boxShadow: '0 0 20px rgba(255, 106, 0, 0.3)'
                        }}
                        labelStyle={{ color: '#CFCFCF' }}
                        itemStyle={{ color: '#FF7A1A', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#FF6A00" 
                        strokeWidth={3}
                        fill="url(#colorRevenue)"
                        dot={{ fill: '#FF6A00', r: 5, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, strokeWidth: 2, stroke: '#FF8C42' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Token & Endpoint Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Token Breakdown */}
                {tokenData.length > 0 && (
                  <div className="rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#FF6A00]/20 shadow-2xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#FF6A00]/20 to-[#F24C00]/10">
                        <DollarSign className="w-5 h-5 text-[#FF7A1A]" />
                      </div>
                      <span className="bg-gradient-to-r from-[#FF6A00] to-[#F24C00] bg-clip-text text-transparent">
                        Revenue by Token
                      </span>
                    </h2>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={tokenData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A0F0B" opacity={0.3} />
                        <XAxis dataKey="name" stroke="#9E9E9E" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9E9E9E" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1C1210',
                            border: '1px solid #FF6A00',
                            borderRadius: '12px'
                          }}
                          labelStyle={{ color: '#CFCFCF' }}
                          itemStyle={{ color: '#FF7A1A', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="value" fill="#FF6A00" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Endpoint Breakdown */}
                {endpointData.length > 0 && (
                  <div className="rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#FF6A00]/20 shadow-2xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#FF6A00]/20 to-[#F24C00]/10">
                        <Zap className="w-5 h-5 text-[#FF7A1A]" />
                      </div>
                      <span className="bg-gradient-to-r from-[#FF6A00] to-[#F24C00] bg-clip-text text-transparent">
                        Revenue by Endpoint
                      </span>
                    </h2>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={endpointData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A0F0B" opacity={0.3} />
                        <XAxis dataKey="name" stroke="#9E9E9E" style={{ fontSize: '11px' }} angle={-15} textAnchor="end" height={80} />
                        <YAxis stroke="#9E9E9E" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1C1210',
                            border: '1px solid #FF6A00',
                            borderRadius: '12px'
                          }}
                          labelStyle={{ color: '#CFCFCF' }}
                        />
                        <Bar dataKey="revenue" fill="#F24C00" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Payment Feed */}
              <div className="rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#FF6A00]/20 shadow-2xl glow-orange">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#FF6A00]" />
                  Live Payment Feed
                </h2>
                
                {payments.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-[#9E9E9E]">No payments yet...</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {payments.map((payment, i) => (
                      <motion.div
                        key={payment.id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.03, x: 8 }}
                        className="flex items-center justify-between p-4 rounded-lg backdrop-blur-xl bg-gradient-to-r from-[#151515]/80 to-[#1C1210]/60 border border-[#2A0F0B]/50 hover:border-[#FF6A00]/80 hover:shadow-[0_0_20px_rgba(255,106,0,0.3)] transition-all duration-300"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-[#FF6A00] font-bold">
                              {payment.endpoint}
                            </span>
                            {payment.transaction_hash && payment.transaction_hash !== 'pending' && (
                              <a
                                href={`https://explorer.hiro.so/txid/${payment.transaction_hash}?chain=testnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#FF7A1A] hover:text-[#FF8C42] flex items-center gap-1 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3 h-3" />
                                View TX
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-[#9E9E9E]">
                            {new Date(payment.timestamp || payment.created_at).toLocaleString()}
                          </p>
                          {payment.sender_address && (
                            <p className="text-xs text-[#9E9E9E] font-mono mt-1">
                              From: {payment.sender_address.substring(0, 8)}...{payment.sender_address.substring(payment.sender_address.length - 6)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {payment.amount} <span className="text-[#FF6A00]">{payment.token}</span>
                          </p>
                          <p className="text-xs text-[#CFCFCF] mt-1 capitalize">{payment.status}</p>
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
              <div className="mb-8 rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#2A0F0B]/50">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#FF6A00]" />
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
                    className="px-6 py-3 bg-gradient-to-r from-[#FF6A00] to-[#F24C00] hover:from-[#FF8C42] hover:to-[#FF6A00] rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(255,106,0,0.3)] hover:shadow-[0_0_30px_rgba(255,106,0,0.5)]"
                  >
                    Search
                  </button>
                </div>
                
                {creditResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 rounded-lg bg-[#151515]/50 border border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-6xl font-bold text-[#FF6A00]">{creditResult.score}</div>
                        <div className="text-lg text-[#CFCFCF] mt-2">{creditResult.rating}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-400">{creditResult.discount}% OFF</div>
                        <div className="text-sm text-[#CFCFCF] mt-1">Eligible Discount</div>
                      </div>
                    </div>
                    
                    {creditResult.recommendations && creditResult.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-[#CFCFCF] mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {creditResult.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm text-slate-300">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* NEW: Cost Savings Calculator */}
                    {savingsData && !savingsData.error && (
                      <div className="mt-6 p-6 rounded-lg bg-gradient-to-br from-[#FF6A00]/10 to-[#F24C00]/5 border border-[#FF6A00]/30">
                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-[#FF7A1A]" />
                          💰 Cost Savings
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-[#9E9E9E]">Total Saved</p>
                            <p className="text-2xl font-bold text-[#10b981]">{savingsData.totalSaved} STX</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9E9E9E]">Monthly Savings</p>
                            <p className="text-2xl font-bold text-[#FF7A1A]">{savingsData.monthlySavings} STX</p>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-[#1C1210]/50 rounded">
                          <p className="text-sm text-[#CFCFCF]">
                            💡 <strong>You're saving {creditResult.discount}%</strong> on every transaction thanks to your excellent credit score!
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Leaderboard */}
              <div className="rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#2A0F0B]/50">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#FF6A00]" />
                  Top Agents by Credit Score
                </h2>
                <div className="space-y-3">
                  {leaderboard.map((agent, i) => (
                    <motion.div
                      key={agent.address}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-[#151515]/50 border border-[#2A0F0B]/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          i === 1 ? 'bg-slate-400/20 text-slate-300' :
                          i === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-slate-700/20 text-[#CFCFCF]'
                        }`}>
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-mono text-sm font-bold">{agent.address}</div>
                          <div className="text-xs text-[#9E9E9E]">{agent.totalPayments} payments</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#FF6A00]">{agent.score}</div>
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
              {/* Fraud Analytics Stats */}
              {fraudData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatCard icon={Users} label="Total Addresses" value={fraudData.totalAddresses} />
                  <StatCard icon={AlertTriangle} label="Fraud Alerts" value={fraudData.fraudulentAddresses} color="#C62828" />
                  <StatCard icon={Shield} label="Fraud Rate" value={`${fraudData.fraudRate}%`} color="#10b981" />
                </div>
              )}
              
              <div className="rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#2A0F0B]/50">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  Security Alerts {fraudData && fraudData.alerts && `(${fraudData.alerts.length} detected)`}
                </h2>
                
                {alerts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-[#CFCFCF]">No security threats detected</p>
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
                              <div className="text-xs text-[#9E9E9E] mt-2">
                                {alert.totalPayments} payments • Last seen: {new Date(alert.lastSeen).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            alert.severity === 'high'
                              ? 'bg-[#C62828]/20 text-red-400'
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
