'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Activity, TrendingDown, Eye, AlertOctagon } from 'lucide-react';

interface FraudPattern {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  addresses: string[];
  count: number;
}

export default function FraudDashboard() {
  const [patterns, setPatterns] = useState<FraudPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockedAddresses, setBlockedAddresses] = useState<Set<string>>(new Set());
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(false);

  useEffect(() => {
    fetchPatterns();
    const interval = setInterval(fetchPatterns, 20000); // Refresh every 20s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-block high severity patterns if enabled
    if (autoBlockEnabled) {
      patterns.forEach(pattern => {
        if (pattern.severity === 'high') {
          handleBlockAddresses(pattern.addresses, pattern.type, true);
        }
      });
    }
  }, [patterns, autoBlockEnabled]);

  const fetchPatterns = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/fraud/patterns');
      const data = await res.json();
      setPatterns(data.patterns || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch fraud patterns:', error);
      setLoading(false);
    }
  };

  const handleBlockAddresses = async (addresses: string[], patternType: string, auto = false) => {
    try {
      // Add to blocked list
      const newBlocked = new Set(blockedAddresses);
      addresses.forEach(addr => newBlocked.add(addr));
      setBlockedAddresses(newBlocked);

      // Call backend to block
      await fetch('http://localhost:3001/api/security/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses, pattern: patternType, auto })
      });

      if (!auto) {
        alert(`✅ Blocked ${addresses.length} addresses for ${patternType}`);
      }
    } catch (error) {
      console.error('Failed to block addresses:', error);
    }
  };

  const handleMarkSafe = async (addresses: string[]) => {
    try {
      // Remove from blocked list
      const newBlocked = new Set(blockedAddresses);
      addresses.forEach(addr => newBlocked.delete(addr));
      setBlockedAddresses(newBlocked);

      // Call backend to whitelist
      await fetch('http://localhost:3001/api/security/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses })
      });

      alert(`✅ Marked ${addresses.length} addresses as safe`);
    } catch (error) {
      console.error('Failed to mark safe:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'from-red-500 to-red-700';
      case 'medium': return 'from-yellow-500 to-orange-600';
      case 'low': return 'from-blue-500 to-blue-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertOctagon className="w-6 h-6" />;
      case 'medium': return <AlertTriangle className="w-6 h-6" />;
      case 'low': return <Eye className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'rapid-fire': return '⚡';
      case 'unusual-amounts': return '💰';
      case 'failed-payments': return '❌';
      default: return '🚨';
    }
  };

  const totalAlerts = patterns.reduce((sum, p) => sum + p.count, 0);
  const highSeverity = patterns.filter(p => p.severity === 'high').length;
  const mediumSeverity = patterns.filter(p => p.severity === 'medium').length;
  const lowSeverity = patterns.filter(p => p.severity === 'low').length;

  if (loading) {
    return (
      <div className="glass-card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-l-4 border-l-purple-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Total Alerts</div>
              <div className="text-3xl font-bold text-white">{totalAlerts}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        {/* High Severity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 border-l-4 border-l-red-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">High Risk</div>
              <div className="text-3xl font-bold text-red-400">{highSeverity}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Medium Severity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 border-l-4 border-l-yellow-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Medium Risk</div>
              <div className="text-3xl font-bold text-yellow-400">{mediumSeverity}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Low Severity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 border-l-4 border-l-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Low Risk</div>
              <div className="text-3xl font-bold text-blue-400">{lowSeverity}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pattern Details */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Fraud Patterns Detected</h2>
              <p className="text-sm text-gray-400">Real-time anomaly detection</p>
            </div>
          </div>

          {/* Auto-Block Toggle */}
          <div className="flex items-center gap-3 glass-pill px-4 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoBlockEnabled}
                onChange={(e) => setAutoBlockEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm font-semibold text-white">Auto-Block High Risk</span>
            </label>
            {autoBlockEnabled && (
              <div className="flex items-center gap-1 text-xs text-red-400">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                Active
              </div>
            )}
          </div>
        </div>

        {patterns.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Shield className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">All Clear! 🎉</h3>
            <p className="text-gray-400">No suspicious patterns detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {patterns.map((pattern, index) => (
              <motion.div
                key={`${pattern.type}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className={`relative overflow-hidden rounded-xl border-2 ${
                  pattern.severity === 'high' ? 'border-red-500/50' :
                  pattern.severity === 'medium' ? 'border-yellow-500/50' :
                  'border-blue-500/50'
                } glass-subtle`}>
                  {/* Severity glow */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${getSeverityColor(pattern.severity)} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300`}></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      {/* Pattern Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-4xl">{getPatternIcon(pattern.type)}</div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white capitalize">
                              {pattern.type.replace('-', ' ')}
                            </h3>
                            <div className={`glass-pill px-3 py-1 text-xs font-bold ${
                              pattern.severity === 'high' ? 'text-red-400 border-red-500/50' :
                              pattern.severity === 'medium' ? 'text-yellow-400 border-yellow-500/50' :
                              'text-blue-400 border-blue-500/50'
                            }`}>
                              {pattern.severity.toUpperCase()}
                            </div>
                          </div>
                          
                          <p className="text-gray-400 mb-4">{pattern.description}</p>
                          
                          {/* Affected Addresses */}
                          <div>
                            <div className="text-sm font-semibold text-gray-300 mb-2">
                              Affected Addresses ({pattern.count})
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {pattern.addresses.slice(0, 5).map((addr, i) => (
                                <div key={i} className="glass-pill px-3 py-1 text-xs font-mono text-gray-300">
                                  {addr.substring(0, 10)}...{addr.substring(addr.length - 6)}
                                </div>
                              ))}
                              {pattern.addresses.length > 5 && (
                                <div className="glass-pill px-3 py-1 text-xs text-gray-400">
                                  +{pattern.addresses.length - 5} more
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Severity Icon */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getSeverityColor(pattern.severity)} flex items-center justify-center flex-shrink-0`}>
                        {getSeverityIcon(pattern.severity)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-700/50">
                      <button 
                        onClick={() => handleBlockAddresses(pattern.addresses, pattern.type)}
                        className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        Block All ({pattern.count})
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-sm font-semibold transition-colors">
                        View Details
                      </button>
                      <button 
                        onClick={() => handleMarkSafe(pattern.addresses)}
                        className="px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold transition-colors ml-auto"
                      >
                        Mark as Safe
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
