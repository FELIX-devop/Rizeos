import React, { useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { verifyJobSeekerPremium } from '../services/api.js';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext.jsx';
import PaymentAnimationModal from './PaymentAnimationModal.jsx';

// Sepolia testnet (Ethereum)
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111
const SEPOLIA_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: [
    'https://sepolia.infura.io/v3/de11139a237947098e16a7eff66b3fd1',
    'https://eth-sepolia.g.alchemy.com/v2/demo',
    'https://rpc.sepolia.org',
  ],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};

const isMissingChainError = (err) =>
  err?.code === 4902 ||
  err?.error?.code === 4902 ||
  err?.info?.error?.code === 4902;

export default function PremiumPaymentButton({ adminWallet, platformFee, onVerified }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  // Animation state: 'idle' | 'processing' | 'success' | 'failed'
  const [animationState, setAnimationState] = useState('idle');
  const hasMetaMask = useMemo(() => typeof window !== 'undefined' && !!window.ethereum, []);

  const ensureNetwork = async (provider) => {
    const network = await provider.getNetwork();
    const chainIdHex = '0x' + network.chainId.toString(16);
    if (chainIdHex !== SEPOLIA_CHAIN_ID) {
      try {
        await provider.send('wallet_switchEthereumChain', [{ chainId: SEPOLIA_CHAIN_ID }]);
      } catch (err) {
        // If chain is not added, add it then switch.
        if (isMissingChainError(err)) {
          await provider.send('wallet_addEthereumChain', [SEPOLIA_PARAMS]);
          await provider.send('wallet_switchEthereumChain', [{ chainId: SEPOLIA_CHAIN_ID }]);
        } else {
          throw err;
        }
      }
    }
  };

  const handlePay = async () => {
    if (!adminWallet) {
      toast.error('Admin wallet not configured.');
      return;
    }
    if (!platformFee) {
      toast.error('Platform fee missing.');
      return;
    }
    if (!hasMetaMask || !window.ethereum) {
      toast.error('MetaMask not found. Please install or enable it.');
      return;
    }
    
    setLoading(true);
    setAnimationState('idle'); // Reset animation state
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (!accounts || !accounts.length) throw new Error('No account selected');
      await ensureNetwork(provider);

      const signer = await provider.getSigner();
      const sender = (await signer.getAddress()).toLowerCase();
      const recipient = adminWallet.toLowerCase();

      if (sender === recipient) {
        toast.error('Select a different account to send from; admin wallet is the recipient.');
        setLoading(false);
        return;
      }

      const feeWei = ethers.parseEther(platformFee.toString());
      const bal = await provider.getBalance(sender);
      if (bal <= feeWei) {
        toast.error('Not enough ETH to cover the fee and gas. Fund your account and retry.');
        setLoading(false);
        return;
      }

      // Send transaction (MetaMask popup appears here)
      const tx = await signer.sendTransaction({
        to: adminWallet,
        value: ethers.parseEther(platformFee.toString()),
      });
      
      // After MetaMask confirmation, show processing animation
      setAnimationState('processing');
      toast.info('Waiting for confirmation...');
      
      // Wait for transaction receipt
      await tx.wait();
      
      // Transaction confirmed on-chain - verify with backend
      const verified = await verifyJobSeekerPremium(token, tx.hash);
      
      // Success! Show success animation
      setAnimationState('success');
      toast.success('Payment confirmed on-chain');
      toast.success('Premium access activated!');
      
      // Call callback after a short delay to let user see success animation
      setTimeout(() => {
        if (onVerified) {
          onVerified(verified.payment || verified);
        }
      }, 1500);
      
    } catch (err) {
      // Handle different error types
      const errorMessage = err.message || 'Payment failed';
      
      // Check if user rejected transaction
      if (errorMessage.includes('rejected') || errorMessage.includes('denied') || errorMessage.includes('User rejected')) {
        setAnimationState('failed');
        toast.error('Transaction rejected');
      } else {
        setAnimationState('failed');
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setAnimationState('idle');
  };

  // Crown SVG icon
  const CrownIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block ml-1"
    >
      <path
        d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 16H19V19H5V16Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <>
      <motion.button
        whileHover={{ scale: hasMetaMask && !loading ? 1.05 : 1 }}
        whileTap={{ scale: 0.95 }}
        disabled={loading || !hasMetaMask}
        onClick={handlePay}
        className="px-6 py-2.5 rounded-full font-bold text-sm disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-1"
        style={{
          background: hasMetaMask && !loading 
            ? 'linear-gradient(135deg, #FFD700 0%, #FFB700 100%)'
            : 'linear-gradient(135deg, #666 0%, #555 100%)',
          color: hasMetaMask && !loading ? '#000000' : '#ffffff',
          boxShadow: hasMetaMask && !loading
            ? '0 4px 15px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2)'
            : 'none',
        }}
        onMouseEnter={(e) => {
          if (hasMetaMask && !loading) {
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (hasMetaMask && !loading) {
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2)';
          }
        }}
      >
        {!hasMetaMask ? 'Install MetaMask' : loading ? 'Processing...' : (
          <>
            PREMIUM
            <CrownIcon />
          </>
        )}
      </motion.button>
      
      {/* Payment Animation Modal */}
      <PaymentAnimationModal state={animationState} onClose={handleCloseModal} />
    </>
  );
}

