// app/page.tsx
'use client';

import { useState } from 'react';
import { useWalletContext } from './context/WalletContext';
import Link from 'next/link';

export default function Home() {
  const { 
    generateMnemonic, 
    importMnemonic,
    isLoaded 
  } = useWalletContext();
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [error, setError] = useState('');

  const handleImport = async () => {
    try {
      setError('');
      await importMnemonic.mutateAsync(mnemonicInput);
    } catch (err) {
      setError('Invalid mnemonic phrase');
    }
  };

  const handleGenerate = async () => {
    try {
      setError('');
      await generateMnemonic.mutateAsync();
    } catch (err) {
      setError('Failed to generate mnemonic');
    }
  };

  // Redirect to wallet if already loaded
  if (isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-8">Your wallet is ready!</h1>
        <Link 
          href="/wallet" 
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Wallet
        </Link>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Multi-Chain Crypto Wallet</h1>
        
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Create New Wallet</h2>
            <button
              onClick={handleGenerate}
              disabled={generateMnemonic.isPending}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {generateMnemonic.isPending ? 'Generating...' : 'Generate New Wallet'}
            </button>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Import Existing Wallet</h2>
            <textarea
              value={mnemonicInput}
              onChange={(e) => setMnemonicInput(e.target.value)}
              placeholder="Enter your 12-word recovery phrase..."
              className="w-full p-3 border rounded-md mb-3 min-h-24"
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              onClick={handleImport}
              disabled={importMnemonic.isPending || !mnemonicInput.trim()}
              className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
            >
              {importMnemonic.isPending ? 'Importing...' : 'Import Wallet'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}