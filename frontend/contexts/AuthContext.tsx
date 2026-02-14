'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';

interface AuthContextType {
  userSession: UserSession | null;
  address: string | null;
  isConnected: boolean;
  role: 'provider' | 'consumer' | 'both' | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  switchRole: (newRole: 'provider' | 'consumer') => void;
  currentView: 'provider' | 'consumer';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const appConfig = new AppConfig(['store_write', 'publish_data']);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userSession] = useState(() => new UserSession({ appConfig }));
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [role, setRole] = useState<'provider' | 'consumer' | 'both' | null>(null);
  const [currentView, setCurrentView] = useState<'provider' | 'consumer'>('provider');

  // Check if user is already logged in
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const walletAddress = userData.profile.stxAddress.testnet;
      setAddress(walletAddress);
      setIsConnected(true);
      
      // Load saved view preference
      const savedView = localStorage.getItem('x402_view');
      if (savedView === 'consumer' || savedView === 'provider') {
        setCurrentView(savedView);
      }
      
      // Detect role based on transaction history
      detectRole(walletAddress);
    }
  }, [userSession]);

  const detectRole = async (walletAddress: string) => {
    try {
      // Check if wallet has received payments (provider)
      const response = await fetch(`http://localhost:3001/api/payments/recent?limit=1000`);
      const payments = await response.json();
      
      const receivedPayments = payments.filter((p: any) => 
        p.sender_address && p.sender_address !== walletAddress
      );
      
      const sentPayments = payments.filter((p: any) => 
        p.sender_address === walletAddress
      );
      
      if (receivedPayments.length > 0 && sentPayments.length > 0) {
        setRole('both');
      } else if (receivedPayments.length > 0) {
        setRole('provider');
        setCurrentView('provider');
      } else if (sentPayments.length > 0) {
        setRole('consumer');
        setCurrentView('consumer');
      } else {
        setRole('consumer'); // Default to consumer for new users
      }
    } catch (error) {
      console.error('Error detecting role:', error);
      setRole('consumer');
    }
  };

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'x402Metrics',
        icon: window.location.origin + '/favicon.ico',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData();
        const walletAddress = userData.profile.stxAddress.testnet;
        setAddress(walletAddress);
        setIsConnected(true);
        detectRole(walletAddress);
        
        // Register user on backend
        fetch('http://localhost:3001/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            wallet_address: walletAddress,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error);
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setAddress(null);
    setIsConnected(false);
    setRole(null);
    localStorage.removeItem('x402_view');
    window.location.href = '/';
  };

  const switchRole = (newRole: 'provider' | 'consumer') => {
    setCurrentView(newRole);
    localStorage.setItem('x402_view', newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        userSession,
        address,
        isConnected,
        role,
        connectWallet,
        disconnectWallet,
        switchRole,
        currentView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
