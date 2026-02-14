'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, UserSession } from '@stacks/auth';
import { authenticate } from '@stacks/connect';
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
    try {
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
    } catch (error) {
      console.error('Error loading user session:', error);
      // Clear corrupted session data
      try {
        userSession.signUserOut();
      } catch (e) {
        // Manually clear localStorage if signUserOut fails
        if (typeof window !== 'undefined') {
          localStorage.removeItem('blockstack-session');
          localStorage.removeItem('blockstack-transit-private-key');
        }
      }
      setAddress(null);
      setIsConnected(false);
    }
  }, [userSession]);

  const detectRole = async (walletAddress: string) => {
    try {
      // Check wallet's role based on payment history
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/payments/recent?limit=1000`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const payments = await response.json();
      
      // Provider: Owns endpoints (provider_wallet matches)
      const providerPayments = payments.filter((p: any) => 
        p.provider_wallet === walletAddress
      );
      
      // Consumer: Made payments (sender_address matches)
      const consumerPayments = payments.filter((p: any) => 
        p.sender_address === walletAddress
      );
      
      console.log('Role detection:', {
        wallet: walletAddress.substring(0, 10) + '...',
        providerPayments: providerPayments.length,
        consumerPayments: consumerPayments.length
      });
      
      if (providerPayments.length > 0 && consumerPayments.length > 0) {
        setRole('both');
        // Default to provider view for "both"
        setCurrentView('provider');
      } else if (providerPayments.length > 0) {
        setRole('provider');
        setCurrentView('provider');
      } else if (consumerPayments.length > 0) {
        setRole('consumer');
        setCurrentView('consumer');
      } else {
        setRole('consumer'); // Default to consumer for new users
        setCurrentView('consumer');
      }
    } catch (error) {
      console.error('Error detecting role:', error);
      setRole('consumer');
      setCurrentView('consumer');
    }
  };

  const connectWallet = async () => {
    try {
      await authenticate({
        userSession,
        onFinish: ({ userSession: newUserSession }) => {
          const userData = newUserSession.loadUserData();
          const walletAddress = userData.profile.stxAddress.testnet;
          setAddress(walletAddress);
          setIsConnected(true);
          detectRole(walletAddress);
          
          // Register user on backend
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
          fetch(`${backendUrl}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              wallet_address: walletAddress,
              timestamp: new Date().toISOString()
            })
          }).catch(console.error);
        },
        onCancel: (error) => {
          console.log('User canceled authentication:', error);
        }
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
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
