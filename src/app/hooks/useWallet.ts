// app/hooks/useWallet.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { walletService } from '../services/walletService';

// Interface for our wallet state
interface WalletState {
  mnemonic: string | null;
  addresses: Record<string, string>;
  selectedChain: string;
}

// Hook for wallet management
export function useWallet() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<WalletState>({
    mnemonic: null,
    addresses: {},
    selectedChain: 'ETH',
  });
  
  // Generate a new mnemonic
  const generateMnemonic = useMutation({
    mutationFn: walletService.generateMnemonic,
    onSuccess: (mnemonic) => {
      setState((prev) => ({ 
        ...prev, 
        mnemonic,
        addresses: {} 
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
        addresses: {} 
      }));
      // Invalidate derived addresses on mnemonic change
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  // Derive addresses for specified chains
  const deriveAddresses = useMutation({
    mutationFn: ({ mnemonic, chains }: { mnemonic: string; chains: string[] }) => 
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
    mutationFn: ({ mnemonic, chain }: { mnemonic: string; chain: string }) =>
      walletService.getPrivateKey(mnemonic, chain),
  });

  // Set the selected chain
  const setSelectedChain = (chain: string) => {
    setState((prev) => ({ ...prev, selectedChain: chain }));
  };

  // Clear wallet state (for logout/session end)
  const clearWallet = () => {
    setState({
      mnemonic: null,
      addresses: {},
      selectedChain: 'ETH',
    });
    queryClient.clear();
  };

  return {
    ...state,
    generateMnemonic,
    validateMnemonic,
    importMnemonic,
    deriveAddresses,
    getPrivateKey,
    setSelectedChain,
    clearWallet,
    isLoaded: !!state.mnemonic,
  };
}