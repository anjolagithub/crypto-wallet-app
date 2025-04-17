// app/services/walletService.ts
'use client';

// API interface for wallet operations
export const walletService = {
  generateMnemonic: async (): Promise<string> => {
    const response = await fetch('/api/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generateMnemonic',
      }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to generate mnemonic');
    return data.mnemonic;
  },
  
  validateMnemonic: async (mnemonic: string): Promise<boolean> => {
    const response = await fetch('/api/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'validateMnemonic',
        params: { mnemonic },
      }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to validate mnemonic');
    return data.isValid;
  },
  
  deriveAddresses: async (mnemonic: string, chains: string[]): Promise<Record<string, string>> => {
    const response = await fetch('/api/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'deriveAddresses',
        params: { mnemonic, chains },
      }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to derive addresses');
    return data.addresses;
  },
  
  getPrivateKey: async (mnemonic: string, chain: string): Promise<string> => {
    const response = await fetch('/api/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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