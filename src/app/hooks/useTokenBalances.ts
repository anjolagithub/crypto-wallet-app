'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import { useWalletContext } from '../contexts/WalletContext';
import { fetchBalance, fetchTokenPrices, Balance, TokenPrice } from '../services/priceServices';

export function useTokenBalances() {
  const { addresses, selectedChain } = useWalletContext();
  
  // Get price data for all supported chains
  const { data: prices = {} } = useQuery({
    queryKey: ['prices'],
    queryFn: () => fetchTokenPrices(Object.keys(addresses)),
    enabled: Object.keys(addresses).length > 0,
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Get balance for selected chain
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ['balance', selectedChain, addresses[selectedChain]],
    queryFn: () => {
      const address = addresses[selectedChain];
      if (!address) return null;
      return fetchBalance(address, selectedChain);
    },
    enabled: !!addresses[selectedChain],
    staleTime: 30000, // Balance data can be stale after 30 seconds
  });
  
  // Get balances for all chains
  const balanceQueries = useQueries({
    queries: Object.entries(addresses).map(([chain, address]) => ({
      queryKey: ['balance', chain, address],
      queryFn: () => fetchBalance(address, chain),
      enabled: !!address,
      staleTime: 30000,
    })),
  });
  
  const allBalances = balanceQueries
    .filter(query => query.data)
    .map(query => query.data) as Balance[];
    
  const totalBalanceUsd = allBalances.reduce((sum, balance) => 
    sum + (balance?.balanceUsd || 0), 0);
  
  return {
    // Selected chain data
    balance,
    price: prices[selectedChain],
    balanceLoading,
    refetchBalance,
    
    // All chains data
    prices,
    allBalances,
    totalBalanceUsd,
    
    // Helpers
    formatUsd: (amount: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount),
  };
}