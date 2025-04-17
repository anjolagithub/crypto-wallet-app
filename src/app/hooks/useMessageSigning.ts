// app/hooks/useMessageSigning.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { useWalletContext } from '../context/WalletContext';

interface SignMessageParams {
  message: string;
}

interface SignMessageResult {
  signature: string;
  recoveredAddress: string;
  actualAddress: string;
  verified: boolean;
}

export function useMessageSigning() {
  const { mnemonic } = useWalletContext();
  
  const signMessage = useMutation<SignMessageResult, Error, SignMessageParams>({
    mutationFn: async ({ message }) => {
      if (!mnemonic) {
        throw new Error('No wallet loaded');
      }
      
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signMessage',
          params: { mnemonic, message }
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sign message');
      }
      
      return response.json();
    }
  });
  
  return {
    signMessage,
  };
}