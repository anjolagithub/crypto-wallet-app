'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// List of all supported chains
export const SUPPORTED_CHAINS = [
  'ETH', 'MATIC', 'BNB', 'AVAX', 'FTM', 'BTC', 'DOGE', 
  'ATOM', 'NEAR', 'SUI', 'SEI', 'TRX', 'SOL', 'OM'
] as const;

export type ChainCode = typeof SUPPORTED_CHAINS[number];

// Interface for our wallet state
interface WalletState {
  mnemonic: string | null;
  addresses: Record<ChainCode, string>;
  selectedChain: ChainCode;
}

// Interface for our wallet context
interface WalletContextValue extends WalletState {
  generateMnemonic: any;
  validateMnemonic: any;
  importMnemonic: any;
  deriveAddresses: any;
  getPrivateKey: any;
  setSelectedChain: (chain: ChainCode) => void;
  clearWallet: () => void;
  isLoaded: boolean;
  exportAddressesCsv: () => string;
}

// Create context
const WalletContext = createContext<WalletContextValue | null>(null);

// Wallet Service API calls
const walletService = {
  generateMnemonic: async (): Promise<string> => {
    const response = await fetch('/api/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generateMnemonic' }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to generate mnemonic');
    return data.mnemonic;
  },
  
  validateMnemonic: async (mnemonic: string): Promise<boolean> => {
    const response = await fetch('/api/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'validateMnemonic',
        params: { mnemonic },
      }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to validate mnemonic');
    return data.isValid;
  },
  
  deriveAddresses: async (mnemonic: string, chains: ChainCode[]): Promise<Record<ChainCode, string>> => {
    const response = await fetch('/api/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deriveAddresses',
        params: { mnemonic, chains },
      }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to derive addresses');
    return data.addresses;
  },
  
  getPrivateKey: async (mnemonic: string, chain: ChainCode): Promise<string> => {
    const response = await fetch('/api/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getPrivateKey',
        params: { mnemonic, chain },
      }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get private key');
    return data.privateKey;
  },
};

// Provider component
export function WalletProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<WalletState>({
    mnemonic: null,
    addresses: {} as Record<ChainCode, string>,
    selectedChain: 'ETH',
  });
  
  // Generate a new mnemonic
  const generateMnemonic = useMutation({
    mutationFn: walletService.generateMnemonic,
    onSuccess: (mnemonic) => {
      setState((prev) => ({ 
        ...prev, 
        mnemonic,
        addresses: {} as Record<ChainCode, string>
      }));
      // Invalidate derived addresses on mnemonic change
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  // Validate a mnemonic
  const validateMnemonic = useMutation({
    mutationFn: (mnemonic: string) => walletService.validateMnemonic(mnemonic),
  });

  // Import an existing mnemonic
  const importMnemonic = useMutation({
    mutationFn: async (mnemonic: string) => {
      const isValid = await walletService.validateMnemonic(mnemonic);
      if (!isValid) throw new Error('Invalid mnemonic');
      return mnemonic;
    },
    onSuccess: (mnemonic) => {
      setState((prev) => ({ 
        ...prev, 
        mnemonic,
        addresses: {} as Record<ChainCode, string>
      }));
      // Invalidate derived addresses on mnemonic change
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  // Derive addresses for specified chains
  const deriveAddresses = useMutation({
    mutationFn: ({ mnemonic, chains }: { mnemonic: string; chains: ChainCode[] }) => 
      walletService.deriveAddresses(mnemonic, chains),
    onSuccess: (addresses) => {
      setState((prev) => ({ 
        ...prev, 
        addresses: {
          ...prev.addresses,
          ...addresses
        } 
      }));
      // Cache the derived addresses
      queryClient.setQueryData(['addresses', state.mnemonic], addresses);
    },
  });

  // Get private key for a specific chain
  const getPrivateKey = useMutation({
    mutationFn: ({ mnemonic, chain }: { mnemonic: string; chain: ChainCode }) =>
      walletService.getPrivateKey(mnemonic, chain),
  });

  // Set the selected chain
  const setSelectedChain = (chain: ChainCode) => {
    setState((prev) => ({ ...prev, selectedChain: chain }));
  };

  // Clear wallet state (for logout/session end)
  const clearWallet = () => {
    setState({
      mnemonic: null,
      addresses: {} as Record<ChainCode, string>,
      selectedChain: 'ETH',
    });
    queryClient.clear();
  };
  
  // Export addresses as CSV
  const exportAddressesCsv = (): string => {
    const rows = [
      ['Chain', 'Address'], // Header row
      ...Object.entries(state.addresses).map(([chain, address]) => [chain, address])
    ];
    
    return rows.map(row => row.join(',')).join('\n');
  };

  // Derive addresses for all chains when mnemonic changes
  useEffect(() => {
    if (state.mnemonic && Object.keys(state.addresses).length === 0) {
      deriveAddresses.mutate({ 
        mnemonic: state.mnemonic, 
        chains: [...SUPPORTED_CHAINS] 
      });
    }
  }, [state.mnemonic]);

  const contextValue: WalletContextValue = {
    ...state,
    generateMnemonic,
    validateMnemonic,
    importMnemonic,
    deriveAddresses,
    getPrivateKey,
    setSelectedChain,
    clearWallet,
    isLoaded: !!state.mnemonic,
    exportAddressesCsv,
  };
  
  return (
    <WalletContext.Provider value={contextValue}>
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