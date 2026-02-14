'use client';

import { motion } from 'framer-motion';
import { 
  Store, 
  TrendingUp, 
  Shield, 
  Star,
  ExternalLink,
  Zap,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface MarketplaceTabProps {
  providers: any[];
  trending: any[];
}

export default function MarketplaceTab({ providers, trending }: MarketplaceTabProps) {
  return (
    <div className="space-y-8">
      {/* Featured Providers */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" />
          Featured Providers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers
            .filter((p: any) => p.featured)
            .map((provider: any, i: number) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="rounded-xl p-6 backdrop-blur-xl bg-gradient-to-br from-[#1C1210]/90 to-[#151515]/70 border border-[#2A0F0B]/50 shadow-2xl cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{provider.name}</h3>
                      {provider.verified && (
                        <CheckCircle2 className="w-5 h-5 text-[#FF6A00]" />
                      )}
                    </div>
                    <p className="text-sm text-[#CFCFCF] line-clamp-2">
                      {provider.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-[#FF6A00]">
                    {provider.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    {provider.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2A0F0B]/50">
                  <div>
                    <div className="text-xs text-[#9E9E9E] mb-1">Revenue</div>
                    <div className="text-lg font-bold text-white">
                      {provider.totalRevenue.toFixed(3)} STX
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#9E9E9E] mb-1">Requests</div>
                    <div className="text-lg font-bold text-white">
                      {provider.totalRequests}
                    </div>
                  </div>
                </div>
                
                <button className="mt-4 w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-[#FF6A00] rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-cyan-500 group-hover:text-white">
                  <Store className="w-4 h-4" />
                  View APIs
                </button>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Trending APIs */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-400" />
          Trending APIs (Last 24h)
        </h2>
        <div className="rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#2A0F0B]/50">
          <div className="space-y-3">
            {trending.length === 0 ? (
              <div className="text-center py-8 text-[#9E9E9E]">
                No trending data yet. Start using APIs!
              </div>
            ) : (
              trending.map((api: any, i: number) => (
                <motion.div
                  key={api.endpoint}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#151515]/50 border border-[#2A0F0B]/50 hover:border-green-500/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      i === 1 ? 'bg-slate-400/20 text-slate-300' :
                      i === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-slate-700/20 text-[#CFCFCF]'
                    }`}>
                      #{i + 1}
                    </div>
                    <div>
                      <div className="font-mono text-sm font-bold text-white group-hover:text-green-400 transition-colors">
                        {api.endpoint}
                      </div>
                      <div className="text-xs text-[#9E9E9E]">
                        {api.requests24h} requests
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {api.revenue24h} STX
                    </div>
                    <div className="text-xs text-[#9E9E9E]">24h revenue</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* All Providers */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Store className="w-6 h-6 text-[#FF6A00]" />
          All Providers
        </h2>
        <div className="space-y-3">
          {providers.map((provider: any, i: number) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="flex items-center justify-between p-5 rounded-xl backdrop-blur-xl bg-[#1C1210]/90 border border-[#2A0F0B]/50 hover:border-[#FF8C42]/50 transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{provider.name}</h3>
                  {provider.verified && (
                    <Shield className="w-4 h-4 text-[#FF6A00]" />
                  )}
                  <span className="px-2 py-1 rounded text-xs bg-slate-700/50 text-[#CFCFCF]">
                    {provider.category}
                  </span>
                </div>
                <p className="text-sm text-[#CFCFCF]">{provider.description}</p>
              </div>
              <div className="flex items-center gap-6 ml-6">
                <div className="text-right">
                  <div className="text-sm text-[#9E9E9E] mb-1">Revenue</div>
                  <div className="text-lg font-bold text-white">
                    {provider.totalRevenue.toFixed(3)} STX
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#9E9E9E] mb-1">Requests</div>
                  <div className="text-lg font-bold text-white">
                    {provider.totalRequests}
                  </div>
                </div>
                <button className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500 text-[#FF6A00] hover:text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#2A0F0B]/50 text-center">
          <Store className="w-8 h-8 text-[#FF6A00] mx-auto mb-3" />
          <div className="text-3xl font-bold text-white mb-1">{providers.length}</div>
          <div className="text-sm text-[#CFCFCF]">Active Providers</div>
        </div>
        <div className="rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#2A0F0B]/50 text-center">
          <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-white mb-1">
            {providers.reduce((sum, p) => sum + p.totalRequests, 0)}
          </div>
          <div className="text-sm text-[#CFCFCF]">Total Requests</div>
        </div>
        <div className="rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#2A0F0B]/50 text-center">
          <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-white mb-1">
            {providers.reduce((sum, p) => sum + p.totalRevenue, 0).toFixed(3)} STX
          </div>
          <div className="text-sm text-[#CFCFCF]">Total Revenue</div>
        </div>
        <div className="rounded-xl p-6 backdrop-blur-xl bg-[#1C1210]/90 border border-[#2A0F0B]/50 text-center">
          <Shield className="w-8 h-8 text-[#FF6A00] mx-auto mb-3" />
          <div className="text-3xl font-bold text-white mb-1">
            {providers.filter(p => p.verified).length}
          </div>
          <div className="text-sm text-[#CFCFCF]">Verified</div>
        </div>
      </div>
    </div>
  );
}
