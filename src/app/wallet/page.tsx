'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletContext, SUPPORTED_CHAINS, ChainCode } from '../context/WalletContext';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { MessageSigning } from '../components/MessageSigning';
import QRCode from 'qrcode.react'; 

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
    isLoaded,
    exportAddressesCsv
  } = useWalletContext();
  
  const { 
    balance, 
    price, 
    allBalances, 
    totalBalanceUsd, 
    formatUsd,
    refetchBalance 
  } = useTokenBalances();
  
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sign'>('dashboard');
  const [showQrCode, setShowQrCode] = useState(false);

  // Protected route - redirect if no wallet loaded
  useEffect(() => {
    if (!isLoaded) {
      router.push('/');
    } else if (mnemonic && Object.keys(addresses).length === 0) {
      // Derive addresses for all chains if not already done
      deriveAddresses.mutate({ mnemonic, chains: [...SUPPORTED_CHAINS] });
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
  
  const handleExportCsv = () => {
    const csvContent = exportAddressesCsv();
    const blob = new Blob([csvContent], { type: