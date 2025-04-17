// app/hooks/useBalances.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { useWalletContext } from '../context/WalletContext';

// Mock service for fetching balances - in a real app, this would connect to blockchain APIs
const fetchBalance = async (address: string, chain: string): Promise<string> => {
  // In a real implementation, we would call blockchain APIs here
  // For demo purposes, we'll return mock data
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock response
  const mockBalances: Record<string, Record<string, string>> = {
    ETH: { 
      '0x123': '1.245', 
      '0x456': '0.5' 
    },
    BTC: { 
      'bc1abc': '0.0023', 
      'bc1def': '0.0001' 
    },
    SOL: { 
      'ABCDE': '12.5', 
      'FGHIJ': '3.75' 
    }
  };
  
  // Return a random balance for this demo
  return mockBalances[chain]?.[address.substring(0, 5)] || '0';
};

export function useBalances() {
  const { addresses, selectedChain } = useWalletContext();
  
  const { data: balance, isLoading, error, refetch } = useQuery({
    queryKey: ['balance', selectedChain, addresses[selectedChain]],
    queryFn: () => {
      const address = addresses[selectedChain];
      if (!address) return '0';
      return fetchBalance(address, selectedChain);
    },
    enabled: !!addresses[selectedChain],
    staleTime: 30000, // Balance data can be stale after 30 seconds
  });
  
  return {
    balance: balance || '0',
    isLoading,
    error,
    refetch,
  };
}