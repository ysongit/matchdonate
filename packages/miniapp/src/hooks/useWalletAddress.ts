import { useAccount } from 'wagmi';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { useWallets } from '@privy-io/react-auth';

export function useWalletAddress() {
  const { address: wagmiAddress } = useAccount();
  const { client } = useSmartWallets();
  const { wallets } = useWallets();

  // Check if smart wallet exists and is ready
  const smartWallet = wallets.find(w => w.walletClientType === 'privy');
  const smartWalletAddress = client?.account?.address;

  // Prefer smart wallet address if available, otherwise use wagmi address
  const address = smartWalletAddress || wagmiAddress;
  
  return {
    address,
    smartWalletAddress,
    eoaAddress: wagmiAddress,
    isSmartWallet: !!smartWalletAddress,
    hasSmartWallet: !!smartWallet,
  };
}
