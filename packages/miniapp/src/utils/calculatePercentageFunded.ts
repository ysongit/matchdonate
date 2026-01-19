export const calculatePercentageFunded = (fundedGFT: bigint, availableTokens: bigint): string => {
  // Handle edge case where availableTokens is 0
  if (availableTokens === 0n) {
    return "0.00";
  }
  
  // Calculate percentage: (fundedGFT / availableTokens) * 100
  // Multiply by 10000 to preserve 2 decimal places before division
  const percentage = (fundedGFT * 10000n) / availableTokens;
  
  // Convert to number and divide by 100 to get the actual percentage with 2 decimals
  const percentageNumber = Number(percentage) / 100;
  
 // Format to 2 decimal places then remove trailing zeros
  return percentageNumber.toFixed(2).replace(/\.?0+$/, '');
}