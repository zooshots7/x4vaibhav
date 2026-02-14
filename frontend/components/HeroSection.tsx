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
        background: 'linear-gradient(135deg, #0A3D3E 0%, #0D4A4C 25%, #0A2C2D 50%, #0A1E1F 75%, #000810 100%)',
      }}
    >
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-70"
        style={{
          background: 'linear-gradient(135deg, #0A3D3E, #0D4A4C, #0A2C2D, #0A3D3E)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 15s ease infinite'
        }}
      />
      
      {/* Glowing Orbs - Neon Cyan */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-[#00FFD4] rounded-full blur-[120px] opacity-20 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#00D4FF] rounded-full blur-[140px] opacity-15 animate-pulse" style={{ animationDelay: '1.5s' }} />
      
      {/* Neon Ring Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border-2 border-[#00FFD4]/20 blur-sm opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#00D4FF]/10 blur-md opacity-20" />
      
      {/* Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-7xl font-black text-white mb-4 hero-text-glow">
            x402Metrics
          </h1>
          <p className="text-2xl text-[#C5D5E0] mb-8 font-medium tracking-wide">
            Real-Time Analytics for HTTP Payment Protocol
          </p>
        </motion.div>

        {/* Stats Row - Premium Glass Cards */}
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
              className="glass-card rounded-xl p-6 glow-cyan"
            >
              <stat.icon className="w-8 h-8 text-[#00FFD4] mb-3" />
              <div className="text-white font-bold text-xl mb-1">{stat.value}</div>
              <div className="text-[#C5D5E0] text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </motion.div>
  );
}
