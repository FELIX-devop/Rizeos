import React, { useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { verifyPayment } from '../services/api.js';
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

export default function PaymentButton({ adminWallet, platformFee, onVerified }) {
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
      const verified = await verifyPayment(token, tx.hash);
      
      // Success! Show success animation
      setAnimationState('success');
      toast.success('Payment confirmed on-chain');
      toast.success('Backend verified payment');
      
      // Call callback after a short delay to let user see success animation
      setTimeout(() => {
      onVerified(verified.id);
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

  const label = !hasMetaMask ? 'Install MetaMask' : loading ? 'Processing...' : `Pay ${platformFee} ETH to Post`;

  return (
    <>
    <motion.button
      whileHover={{ scale: hasMetaMask && !loading ? 1.02 : 1 }}
      disabled={loading || !hasMetaMask}
      onClick={handlePay}
      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70"
    >
      {label}
    </motion.button>
      
      {/* Payment Animation Modal */}
      <PaymentAnimationModal state={animationState} onClose={handleCloseModal} />
    </>
  );
}

