/**
 * Generates a random redeem code
 * @param length - Length of the code (default: 16)
 * @param format - Format pattern using segments separated by dashes (e.g., "XXXX-XXXX-XXXX-XXXX")
 * @param charset - Character set to use for generation (default: alphanumeric uppercase)
 * @returns A randomly generated redeem code
 */
export function generateRedeemCode(
  length: number = 16,
  format?: string,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
): string {
  const generateRandomChar = (): string => {
    const randomIndex = Math.floor(Math.random() * charset.length);
    return charset[randomIndex];
  };

  if (format) {
    // Use the format pattern (e.g., "XXXX-XXXX-XXXX")
    return format.replace(/X/g, () => generateRandomChar());
  }

  // Generate a code of specified length
  return Array.from({ length }, () => generateRandomChar()).join('');
}

/**
 * Generates a batch of unique redeem codes
 * @param count - Number of codes to generate
 * @param length - Length of each code
 * @param format - Format pattern (optional)
 * @returns Array of unique redeem codes
 */
export function generateRedeemCodeBatch(
  count: number,
  length: number = 16,
  format?: string
): string[] {
  const codes = new Set<string>();
  
  while (codes.size < count) {
    codes.add(generateRedeemCode(length, format));
  }
  
  return Array.from(codes);
}

/*
// Simple code
console.log('Simple 16-char code:', generateRedeemCode());

// Formatted code
console.log('Formatted code:', generateRedeemCode(undefined, 'XXXX-XXXX-XXXX-XXXX'));

// Custom length
console.log('12-char code:', generateRedeemCode(12));

// Custom charset (only letters)
console.log('Letters only:', generateRedeemCode(16, undefined, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'));

// Generate batch
console.log('Batch of 5 codes:', generateRedeemCodeBatch(5, undefined, 'XXXX-XXXX-XXXX'));
*/