import type { Hash } from 'viem';

export const formatTxHash = (hash: Hash, startChars: number = 6, endChars: number = 4): string => {
  if (!hash) return '';
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}