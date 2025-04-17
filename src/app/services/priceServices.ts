// app/services/priceService.ts
'use client';

// NOTE: In a real application, we would need to handle API keys securely via environment variables
// For this demo, we'll use a mock implementation 

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

export interface Balance {
  address: string;
  chain: string;
  balance: string;
  balanceUsd: number;
}

// Fetch token prices from a mock API (simulating CMC)
export const fetchTokenPrices = async (symbols: string[]): Promise<Record<string, TokenPrice>> => {
  // In a real app, replace with actual CMC API call:
  // const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols.join(',')}`);
  
  // For demo purposes, simulate API response
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  
  const mockPrices: Record<string, TokenPrice> = {
    ETH: { symbol: 'ETH', price: 2450.75, change24h: 2.3 },
    MATIC: { symbol: 'MATIC', price: 0.85, change24h: -1.2 },
    BNB: { symbol: 'BNB', price: 318.45, change24h: 0.7 },
    AVAX: { symbol: 'AVAX', price: 28.15, change24h: 5.6 },
    FTM: { symbol: 'FTM', price: 0.52, change24h: 3.2 },
    BTC: { symbol: 'BTC', price: 55780.30, change24h: 1.5 },
    DOGE: { symbol: 'DOGE', price: 0.12, change24h: -0.8 },
    ATOM: { symbol: 'ATOM', price: 12.35, change24h: 4.1 },
    NEAR: { symbol: 'NEAR', price: 3.74, change24h: 1.9 },
    SUI: { symbol: 'SUI', price: 1.23, change24h: 8.4 },
    SEI: { symbol: 'SEI', price: 0.65, change24h: 12.5 },
    TRX: { symbol: 'TRX', price: 0.11, change24h: 0.3 },
    SOL: { symbol: 'SOL', price: 145.20, change24h: 6.7 },
    OM: { symbol: 'OM', price: 0.032, change24h: -2.6 },
  };
  
  // Filter to only requested symbols
  const result: Record<string, TokenPrice> = {};
  symbols.forEach(symbol => {
    if (mockPrices[symbol]) {
      result[symbol] = mockPrices[symbol];
    }
  });
  
  return result;
};

// Fetch balance for a specific address on a specific chain
export const fetchBalance = async (address: string, chain: string): Promise<Balance> => {
  // In a real app, this would call blockchain APIs
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  // Mock balances for demo
  const mockBalances: Record<string, number> = {
    ETH: 0.487,
    MATIC: 145.23,
    BNB: 1.32,
    AVAX: 12.5,
    FTM: 230.75,
    BTC: 0.0085,
    DOGE: 2150.0,
    ATOM: 8.32,
    NEAR: 45.2,
    SUI: 320.0,
    SEI: 175.5,
    TRX: 1250.0,
    SOL: 3.75,
    OM: 5280.0,
  };
  
  // Generate random balance based on chain
  const balance = mockBalances[chain] || Math.random() * 10;
  
  // Get mock price for calculating USD value
  const prices = await fetchTokenPrices([chain]);
  const price = prices[chain]?.price || 0;
  
  return {
    address,
    chain,
    balance: balance.toString(),
    balanceUsd: balance * price,
  };
};