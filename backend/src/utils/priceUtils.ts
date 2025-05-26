// backend/src/utils/priceUtils.ts

export interface PriceDetails {
  price: number;
  originalPrice?: number | null;
  discountPercentage?: number | null;
}

/**
 * Extracts numerical price from a string (e.g., "₹120", "Rs. 55.50").
 * Returns an object with price, originalPrice (if strikethrough), and discount.
 */
export function extractPriceDetails(priceString: string, originalPriceString?: string | null): PriceDetails {
  const normalize = (str: string | null | undefined): number | null => {
    if (!str) return null;
    const numStr = str.replace(/[₹,Rs\sMRP]+/gi, '').trim();
    const num = parseFloat(numStr);
    return isNaN(num) ? null : num;
  };

  const currentPrice = normalize(priceString);

  if (currentPrice === null) {
    // Fallback if main price string can't be parsed (e.g. "Price not available")
    return { price: 0, originalPrice: null, discountPercentage: null };
  }

  let originalPrice = normalize(originalPriceString);

  // If originalPriceString is not provided, try to find it within priceString (e.g. "₹100 MRP ₹120")
  if (!originalPrice && priceString.toLowerCase().includes('mrp')) {
    const parts = priceString.split(/mrp/i);
    if (parts.length > 1) {
      const potentialOriginal = normalize(parts[1]);
      if (potentialOriginal && potentialOriginal > currentPrice) {
        originalPrice = potentialOriginal;
      }
      // Sometimes the MRP is listed first, e.g., "MRP ₹120 ₹100"
      else if (parts.length > 0) {
         const potentialOriginalFromFirstPart = normalize(parts[0]);
         if (potentialOriginalFromFirstPart && potentialOriginalFromFirstPart > currentPrice) {
            originalPrice = potentialOriginalFromFirstPart;
         }
      }
    }
  }
  
  // If original price found is less than or equal to current price, it's likely a parsing error or not a real discount
  if (originalPrice !== null && originalPrice <= currentPrice) {
    originalPrice = null; 
  }

  let discountPercentage: number | null = null;
  if (originalPrice && currentPrice && originalPrice > currentPrice) {
    discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  return {
    price: currentPrice,
    originalPrice: originalPrice,
    discountPercentage: discountPercentage,
  };
}


/**
 * Formats a price number into a currency string (e.g., "₹120.50").
 */
export function formatPrice(price: number | null | undefined, currencySymbol: string = '₹'): string {
  if (price === null || price === undefined) {
    return 'N/A';
  }
  return `${currencySymbol}${price.toFixed(2)}`;
}
