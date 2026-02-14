'use client';

import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Wallet, Shield, TrendingUp, Zap } from 'lucide-react';

export default function ConnectScreen() {
  const { connectWallet } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-8" 
         style={{
           background: 'linear-gradient(135deg, #0A3D3E 0%, #0D4A4C 25%, #0A2C2D 50%, #0A1E1F 75%, #000810 100%)',
         }}>
      
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FFD4] rounded-full blur-[140px] opacity-20 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00D4FF] rounded-full blur-[120px] opacity-15 animate-pulse" style={{ animationDelay: '1.5s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-black text-white mb-4 hero-text-glow"
          >
            x402Metrics
          </motion.h1>
          <p className="text-xl text-[#C5D5E0] font-medium">
            Real-Time Analytics for HTTP Payment Protocol
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-12 text-center border-2 border-[#00FFD4]/30 glow-cyan"
        >
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#00FFD4]/30 to-[#00D4FF]/20 
                            flex items-center justify-center border-2 border-[#00FFD4]/50 glow-cyan">
              <Wallet className="w-10 h-10 text-[#00FFD4]" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-3">
              Connect Your Stacks Wallet
            </h2>
            
            <p className="text-[#C5D5E0] text-lg max-w-md mx-auto">
              Sign in with your Stacks wallet to access your personalized analytics dashboard
            </p>
          </div>

          {/* Connect Button */}
          <motion.button
            onClick={connectWallet}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-full max-w-sm mx-auto px-8 py-4 bg-gradient-to-r from-[#00FFD4] to-[#00D4FF] 
                       rounded-xl font-bold text-lg text-[#0A2C2D] hover:shadow-[0_0_40px_rgba(0,255,212,0.5)] 
                       transition-all duration-300 flex items-center justify-center gap-3"
          >
            <Wallet className="w-6 h-6" />
            Connect Wallet
          </motion.button>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-[#00FFD4]/20">
            <div className="text-center">
              <Shield className="w-6 h-6 text-[#00FFD4] mx-auto mb-2" />
              <p className="text-sm text-[#C5D5E0]">Secure</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-6 h-6 text-[#00FFD4] mx-auto mb-2" />
              <p className="text-sm text-[#C5D5E0]">Real-Time</p>
            </div>
            <div className="text-center">
              <Zap className="w-6 h-6 text-[#00FFD4] mx-auto mb-2" />
              <p className="text-sm text-[#C5D5E0]">Lightning Fast</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[#8B9DAF] text-sm mt-8"
        >
          Works with Hiro Wallet, Leather, and all Stacks-compatible wallets
        </motion.p>
      </motion.div>
    </div>
  );
}
