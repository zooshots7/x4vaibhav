'use client';

import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Wallet, LogOut, User } from 'lucide-react';

export default function ConnectWallet() {
  const { address, isConnected, role, connectWallet, disconnectWallet, currentView, switchRole } = useAuth();

  if (!isConnected) {
    return (
      <motion.button
        onClick={connectWallet}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00FFD4]/30 to-[#00D4FF]/20 
                   text-[#00FFD4] border border-[#00FFD4]/50 rounded-lg font-semibold 
                   hover:border-[#00FFD4]/80 transition-all glow-cyan"
      >
        <Wallet className="w-5 h-5" />
        Connect Wallet
      </motion.button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Role Switch (if user is both provider and consumer) */}
      {role === 'both' && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card border border-[#00FFD4]/30">
          <User className="w-4 h-4 text-[#00FFD4]" />
          <select
            value={currentView}
            onChange={(e) => switchRole(e.target.value as 'provider' | 'consumer')}
            className="bg-transparent text-[#00FFD4] text-sm font-medium border-none outline-none cursor-pointer"
          >
            <option value="provider" className="bg-[#0A2C2D] text-[#00FFD4]">Provider View</option>
            <option value="consumer" className="bg-[#0A2C2D] text-[#00FFD4]">Consumer View</option>
          </select>
        </div>
      )}

      {/* Wallet Address Display */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg glass-card border border-[#00FFD4]/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00FFD4] pulse-cyan" />
          <span className="text-sm font-mono text-[#00FFD4]">
            {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
          </span>
        </div>
        
        {/* Role Badge */}
        {role && (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#00FFD4]/20 text-[#00FFD4] border border-[#00FFD4]/30">
            {role === 'both' ? currentView : role}
          </span>
        )}
      </div>

      {/* Disconnect Button */}
      <motion.button
        onClick={disconnectWallet}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#FF6464]/50 
                   text-[#FF6464] hover:bg-[#FF6464]/10 transition-all"
        title="Disconnect Wallet"
      >
        <LogOut className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
