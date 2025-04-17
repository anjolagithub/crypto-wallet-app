// app/api/wallet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as walletCore from '@trustwallet/wallet-core';

// Initialize wallet core
let coreInitialized = false;

async function initWalletCore() {
  if (!coreInitialized) {
    await walletCore.initialize();
    coreInitialized = true;
  }
}

export async function POST(request: NextRequest) {
  await initWalletCore();
  
  try {
    const body = await request.json();
    const { action, params } = body;
    
    switch (action) {
      case 'generateMnemonic':
        const strength = params?.strength || 128; // 128 bits = 12 words
        const mnemonic = walletCore.HDWallet.generateMnemonic(strength);
        return NextResponse.json({ mnemonic });
        
      case 'validateMnemonic':
        const isValid = walletCore.HDWallet.isValid(params.mnemonic);
        return NextResponse.json({ isValid });
        
      case 'deriveAddresses':
        const { mnemonic, chains } = params;
        
        if (!walletCore.HDWallet.isValid(mnemonic)) {
          return NextResponse.json({ error: 'Invalid mnemonic' }, { status: 400 });
        }
        
        const wallet = walletCore.HDWallet.createWithMnemonic(mnemonic);
        const addresses: Record<string, string> = {};
        
        // Derive addresses for each requested chain
        chains.forEach((chain: string) => {
          switch (chain.toUpperCase()) {
            case 'ETH':
              const ethCoin = walletCore.CoinType.ethereum;
              addresses.ETH = wallet.getAddressForCoin(ethCoin);
              break;
            case 'BTC':
              const btcCoin = walletCore.CoinType.bitcoin;
              addresses.BTC = wallet.getAddressForCoin(btcCoin);
              break;
            case 'SOL':
              const solCoin = walletCore.CoinType.solana;
              addresses.SOL = wallet.getAddressForCoin(solCoin);
              break;
            // Add more chains as needed
          }
        });
        
        return NextResponse.json({ addresses });
        
      case 'getPrivateKey':
        const wallet2 = walletCore.HDWallet.createWithMnemonic(params.mnemonic);
        const coinType = walletCore.CoinType[params.chain.toLowerCase()];
        
        if (!coinType) {
          return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });
        }
        
        const privateKeyData = wallet2.getKeyForCoin(coinType);
        const privateKeyHex = Buffer.from(privateKeyData.data()).toString('hex');
        
        return NextResponse.json({ privateKey: privateKeyHex });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Wallet API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}