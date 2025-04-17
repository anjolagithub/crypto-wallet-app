 'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useWallet } from '../hooks/useWallet';

// Define context type
type WalletContextType = ReturnType<typeof useWallet>;

// Create context
const WalletContext = createContext<WalletContextType | null>(null);

// Provider component
export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  
  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
}

// Context consumer hook
export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}