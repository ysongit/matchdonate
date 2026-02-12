import { readContract } from '@wagmi/core';
import { type Address, formatUnits } from 'viem';
import type { Config } from '@wagmi/core';

// ERC20 ABI - just the balanceOf function
const ERC20_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Get the token balance for a specific address
 * @param config - Wagmi config instance
 * @param tokenAddress - The ERC20 token contract address
 * @param walletAddress - The wallet address to check balance for
 * @returns The raw balance as a bigint
 */
export async function getTokenBalance(
  config: Config,
  tokenAddress: Address,
  walletAddress: Address
): Promise<bigint> {
  try {
    const balance = await readContract(config, {
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    });

    return balance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
}

/**
 * Get the token balance formatted with decimals
 * @param config - Wagmi config instance
 * @param tokenAddress - The ERC20 token contract address
 * @param walletAddress - The wallet address to check balance for
 * @param decimals - Token decimals (default: 18)
 * @returns The formatted balance as a string
 */
export async function getTokenBalanceFormatted(
  config: Config,
  tokenAddress: Address,
  walletAddress: Address,
  decimals: number = 18
): Promise<string> {
  const balance = await getTokenBalance(config, tokenAddress, walletAddress);
  return formatUnits(balance, decimals);
}

/**
 * Get token balance with additional token information
 * @param config - Wagmi config instance
 * @param tokenAddress - The ERC20 token contract address
 * @param walletAddress - The wallet address to check balance for
 * @param decimals - Token decimals (optional)
 * @returns Object containing raw and formatted balance
 */
export async function getTokenBalanceWithInfo(
  config: Config,
  tokenAddress: Address,
  walletAddress: Address,
  decimals?: number
) {
  const rawBalance = await getTokenBalance(config, tokenAddress, walletAddress);
  
  return {
    raw: rawBalance,
    formatted: decimals ? formatUnits(rawBalance, decimals) : undefined,
    address: walletAddress,
    tokenAddress,
  };
}

// Example usage (commented out):
/*
import { createConfig, http } from '@wagmi/core';
import { mainnet } from '@wagmi/core/chains';

// Setup config
const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

// Example: Get USDC balance
const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

getTokenBalance(config, usdcAddress, walletAddress)
  .then(balance => console.log('Raw balance:', balance))
  .catch(error => console.error(error));

getTokenBalanceFormatted(config, usdcAddress, walletAddress, 6)
  .then(balance => console.log('Formatted balance:', balance, 'USDC'))
  .catch(error => console.error(error));
*/