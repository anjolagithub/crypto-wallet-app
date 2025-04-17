// app/wallet/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletContext } from '../context/WalletContext';

const AVAILABLE_CHAINS = ['ETH', 'BTC', 'SOL', 'MATIC', 'AVAX'];

export default function WalletDashboard() {
  const router = useRouter();
  const {
    mnemonic,
    addresses,
    selectedChain,
    setSelectedChain,
    deriveAddresses,
    getPrivateKey,
    clearWallet,
    isLoaded
  } = useWalletContext();
  
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Protected route - redirect if no wallet loaded
  useEffect(() => {
    if (!isLoaded) {
      router.push('/');
    } else if (mnemonic && Object.keys(addresses).length === 0) {
      // Derive addresses for all chains if not already done
      deriveAddresses.mutate({ mnemonic, chains: AVAILABLE_CHAINS });
    }
  }, [isLoaded, mnemonic, addresses, router, deriveAddresses]);

  const handleShowPrivateKey = async () => {
    if (!mnemonic || !selectedChain) return;
    
    setLoading(true);
    try {
      const key = await getPrivateKey.mutateAsync({ mnemonic, chain: selectedChain });
      setPrivateKey(key);
      setShowPrivateKey(true);
    } catch (err) {
      console.error("Failed to get private key", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(addresses[selectedChain] || '');
  };

  const handleCopyPrivateKey = () => {
    if (privateKey) {
      navigator.clipboard.writeText(privateKey);
    }
  };

  const handleCopyMnemonic = () => {
    if (mnemonic) {
      navigator.clipboard.writeText(mnemonic);
    }
  };

  const handleLogout = () => {
    clearWallet();
    router.push('/');
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Your Wallet</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          {/* Chain Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Blockchain
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CHAINS.map((chain) => (
                <button
                  key={chain}
                  onClick={() => setSelectedChain(chain)}
                  className={`px-3 py-1 rounded-md ${
                    selectedChain === chain
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {chain}
                </button>
              ))}
            </div>
          </div>

          {/* Address Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedChain} Address
            </label>
            <div className="flex">
              <input
                type="text"
                readOnly
                value={addresses[selectedChain] || 'Loading address...'}
                className="flex-1 p-2 border rounded-l-md bg-gray-50"
              />
              <button
                onClick={handleCopyAddress}
                className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Private Key Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {selectedChain} Private Key
              </label>
              <button
                onClick={handleShowPrivateKey}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {loading ? 'Loading...' : 'Show Private Key'}
              </button>
            </div>
            {showPrivateKey && privateKey && (
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={privateKey}
                  className="flex-1 p-2 border rounded-l-md bg-gray-50"
                />
                <button
                  onClick={handleCopyPrivateKey}
                  className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            )}
            <p className="text-xs text-red-600 mt-1">
              Never share your private key with anyone!
            </p>
          </div>

          {/* Recovery Phrase Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Recovery Phrase
              </label>
              <button
                onClick={() => setShowMnemonic(!showMnemonic)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showMnemonic ? 'Hide' : 'Show'} Recovery Phrase
              </button>
            </div>
            {showMnemonic && mnemonic && (
              <div className="mb-2">
                <div className="p-3 bg-gray-50 border rounded-md mb-2">
                  <p className="break-all">{mnemonic}</p>
                </div>
                <button
                  onClick={handleCopyMnemonic}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Copy to clipboard
                </button>
              </div>
            )}
            <p className="text-xs text-red-600">
              Important: Keep your recovery phrase in a safe place. Anyone with access to it can control your funds.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}