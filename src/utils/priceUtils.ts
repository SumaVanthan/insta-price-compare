
/**
 * Extract the numeric price from a price string
 * @param priceString e.g. "₹30", "Rs.45", "$5.99"
 * @returns number or null if no price found
 */
export function extractPrice(priceString: string): number | null {
  if (!priceString) return null;
  
  // Match any number (with optional decimal) in the string
  const priceMatch = priceString.match(/(\d+(\.\d+)?)/);
  if (priceMatch) {
    return parseFloat(priceMatch[0]);
  }
  return null;
}
