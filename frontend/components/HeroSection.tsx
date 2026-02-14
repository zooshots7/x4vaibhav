'use client';

import { motion } from 'framer-motion';
import { Zap, TrendingUp, Shield, Activity } from 'lucide-react';

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl mb-8 p-12"
      style={{
        background: 'linear-gradient(135deg, #FF6A00 0%, #F24C00 25%, #D84315 50%, #C62828 75%, #8E1B13 100%)',
      }}
    >
      {/* Animated Background */}
      <div 
        className="absolute inset-0 gradient-shift opacity-70"
        style={{
          background: 'linear-gradient(135deg, #FF6A00, #F24C00, #D84315, #C62828, #FF6A00)',
          backgroundSize: '400% 400%',
        }}
      />
      
      {/* Glowing Orbs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-[#FF6A00] rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#C62828] rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-7xl font-black text-white mb-4 text-glow-orange">
            x402Metrics
          </h1>
          <p className="text-2xl text-white/90 mb-8 font-medium">
            Real-Time Analytics for HTTP Payment Protocol
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: Activity, label: 'Live Tracking', value: 'Real-Time' },
            { icon: Zap, label: 'Lightning Fast', value: '<100ms' },
            { icon: Shield, label: 'Blockchain Verified', value: 'Secure' },
            { icon: TrendingUp, label: 'Advanced Analytics', value: 'AI-Powered' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 glow-orange"
            >
              <stat.icon className="w-8 h-8 text-white mb-3" />
              <div className="text-white font-bold text-xl mb-1">{stat.value}</div>
              <div className="text-white/70 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
