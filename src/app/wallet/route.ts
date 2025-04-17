import { NextRequest, NextResponse } from 'next/server';
import * as walletCore from '@trustwallet/wallet-core';
import { ethers } from 'ethers';

// Initialize wallet core
let coreInitialized = false;

async function initWalletCore() {
  if (!coreInitialized) {
    await walletCore.initialize();
    coreInitialized = true;
  }
}

// Map of chain codes to TrustWallet CoinType
const COIN_TYPE_MAP: Record<string, number> = {
  ETH: walletCore.CoinType.ethereum,
  MATIC: walletCore.CoinType.polygon,
  BNB: walletCore.CoinType.smartChain,
  AVAX: walletCore.CoinType.avalancheCChain,
  FTM: walletCore.CoinType.fantom,
  BTC: walletCore.CoinType.bitcoin,
  DOGE: walletCore.CoinType.dogecoin,
  ATOM: walletCore.CoinType.cosmos,
  NEAR: walletCore.CoinType.near,
  SUI: walletCore.CoinType.sui,
  SEI: walletCore.CoinType.sei,
  TRX: walletCore.CoinType.tron,
  SOL: walletCore.CoinType.solana,
  OM: walletCore.CoinType.ethereum, // Using Ethereum for ERC-20 tokens
};

// Type for supported chains
type ChainCode = keyof typeof COIN_TYPE_MAP;

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
        
      case 'deriveAddresses': {
        const { mnemonic, chains } = params;
        
        if (!walletCore.HDWallet.isValid(mnemonic)) {
          return NextResponse.json({ error: 'Invalid mnemonic' }, { status: 400 });
        }
        
        const wallet = walletCore.HDWallet.createWithMnemonic(mnemonic);
        const addresses: Record<string, string> = {};
        
        // Derive addresses for each requested chain
        chains.forEach((chain: ChainCode) => {
          const coinType = COIN_TYPE_MAP[chain];
          
          if (coinType !== undefined) {
            addresses[chain] = wallet.getAddressForCoin(coinType);
          }
        });
        
        // Special note for ERC-20 tokens
        if (chains.includes('OM')) {
          addresses['OM'] = addresses['ETH']; // OM uses the same address as ETH
        }
        
        return NextResponse.json({ addresses });
      }
        
      case 'getPrivateKey': {
        const { mnemonic, chain } = params;
        const wallet = walletCore.HDWallet.createWithMnemonic(mnemonic);
        const coinType = COIN_TYPE_MAP[chain as ChainCode];
        
        if (coinType === undefined) {
          return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });
        }
        
        const privateKeyData = wallet.getKeyForCoin(coinType);
        const privateKeyHex = Buffer.from(privateKeyData.data()).toString('hex');
        
        return NextResponse.json({ privateKey: privateKeyHex });
      }
      
      case 'signMessage': {
        const { mnemonic, message } = params;
        
        if (!mnemonic || !message) {
          return NextResponse.json({ error: 'Missing mnemonic or message' }, { status: 400 });
        }
        
        const wallet = walletCore.HDWallet.createWithMnemonic(mnemonic);
        const ethPrivateKeyData = wallet.getKeyForCoin(walletCore.CoinType.ethereum);
        const ethPrivateKey = Buffer.from(ethPrivateKeyData.data()).toString('hex');
        
        // Use ethers.js to create wallet and sign
        const ethWallet = new ethers.Wallet(ethPrivateKey);
        const signature = await ethWallet.signMessage(message);
        
        // Recover address from signature for verification
        const recoveredAddress = ethers.verifyMessage(message, signature);
        const actualAddress = wallet.getAddressForCoin(walletCore.CoinType.ethereum);
        
        return NextResponse.json({
          signature,
          recoveredAddress,
          actualAddress,
          verified: recoveredAddress.toLowerCase() === actualAddress.toLowerCase()
        });
      }
      
      case 'resetWallet': {
        // This is just a mock API endpoint since wallet state is client-side only
        return NextResponse.json({ success: true });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Wallet API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}