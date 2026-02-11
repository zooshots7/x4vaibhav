'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [stats, setStats] = useState({
    totalRevenue: '0.000000',
    totalPayments: 0,
    successRate: 0,
    avgPayment: '0.000000'
  });
  const [payments, setPayments] = useState<any[]>([]);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const statsRes = await fetch('http://localhost:3001/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const paymentsRes = await fetch('http://localhost:3001/api/payments/recent?limit=20');
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001');
    
    newSocket.on('connect', () => {
      console.log('✅ Connected to backend');
      setConnected(true);
      fetchData(); // Load initial data
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from backend');
      setConnected(false);
    });

    // Listen for new payments
    newSocket.on('new-payment', (payment: any) => {
      console.log('💰 New payment received:', payment);
      setPayments(prev => [payment, ...prev].slice(0, 50)); // Keep last 50
      fetchData(); // Refresh stats
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            x402Metrics
          </h1>
          <p className="text-slate-400 mt-2">
            Real-time analytics for x402 payments
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-slate-400">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-slate-400 text-sm mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold">{stats.totalRevenue} STX</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-slate-400 text-sm mb-2">Total Payments</h3>
            <p className="text-3xl font-bold">{stats.totalPayments}</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-slate-400 text-sm mb-2">Success Rate</h3>
            <p className="text-3xl font-bold">{stats.successRate}%</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-slate-400 text-sm mb-2">Avg Payment</h3>
            <p className="text-3xl font-bold">{stats.avgPayment} STX</p>
          </div>
        </div>

        <div className="mt-8 bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Live Payment Feed
            {connected && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">LIVE</span>}
          </h2>
          
          {payments.length === 0 ? (
            <p className="text-slate-500">No payments yet... Make a test payment to see it appear here!</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {payments.map((payment, i) => (
                <div 
                  key={payment.id || i} 
                  className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-500 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="flex-1">
                    <p className="font-mono text-sm text-purple-400">{payment.endpoint}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(payment.timestamp || payment.created_at).toLocaleString()}
                    </p>
                    {payment.payer && (
                      <p className="text-xs text-slate-600 mt-1">
                        Payer: {payment.payer}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-white">{payment.amount} {payment.token}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'success' 
                        ? 'bg-green-900/50 text-green-300' 
                        : payment.status === 'pending'
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : 'bg-red-900/50 text-red-300'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}