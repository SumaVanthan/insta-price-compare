// backend/src/services/productMatcher.ts
import { ScrapedResult, MergedBackendProduct, PlatformPriceDetail } from '../types';
import { areProductsSimilar, normalizeProductName } from '../utils/stringComparison';
// priceUtils can be imported if we decide to parse price strings into numbers here
// import { extractPriceDetails } from '../utils/priceUtils';

const SIMILARITY_THRESHOLD = 0.7;

export function mergeProducts(
  allPlatformResults: { zepto: ScrapedResult[], blinkit: ScrapedResult[], instamart: ScrapedResult[] },
  query: string // query might not be needed if fallbacks are fully removed
): MergedBackendProduct[] {
  
  const allProducts: Array<ScrapedResult & { sourcePlatform: string }> = [
    ...allPlatformResults.zepto.map(p => ({ ...p, sourcePlatform: 'zepto' as const })),
    ...allPlatformResults.blinkit.map(p => ({ ...p, sourcePlatform: 'blinkit' as const })),
    ...allPlatformResults.instamart.map(p => ({ ...p, sourcePlatform: 'instamart' as const }))
  ];

  if (allProducts.length === 0) {
    return [];
  }

  const mergedProducts: MergedBackendProduct[] = [];
  const processedProductNames = new Set<string>();

  allProducts.forEach(product => {
    const normalizedProductNameKey = normalizeProductName(product.name);
    if (processedProductNames.has(normalizedProductNameKey)) {
      return; 
    }

    // Find products similar to the current one that haven't been processed yet
    const similarProducts = allProducts.filter(otherProduct =>
      !processedProductNames.has(normalizeProductName(otherProduct.name)) && // Ensure we don't re-evaluate already grouped products
      areProductsSimilar(product.name, otherProduct.name, SIMILARITY_THRESHOLD)
    );
    
    // If no similar products are found (this group will contain at least 'product' itself)
    if (similarProducts.length === 0) { 
      // This case should ideally not be hit if product itself is always included by areProductsSimilar(product.name, product.name)
      // but as a safeguard for an extremely unique, non-processed item:
      if (!processedProductNames.has(normalizedProductNameKey)) { // Double check it's not processed
        const firstProduct = product;
        const productData: MergedBackendProduct = {
          id: `product-${mergedProducts.length}-${normalizedProductNameKey.replace(/\s+/g, '-')}`,
          name: firstProduct.name,
          imageUrl: firstProduct.imageUrl || '/placeholder.svg', // Default placeholder
          prices: { zepto: null, blinkit: null, instamart: null },
          // sourceProducts: [firstProduct] // Optional: for debugging
        };
        const platform = firstProduct.sourcePlatform; // Already asserted as 'zepto' | 'blinkit' | 'instamart'
        productData.prices[platform] = {
          price: firstProduct.price, // Raw price string
          unit: firstProduct.unit,
          url: firstProduct.url,
          // originalPrice and discountPercentage would require price string parsing here
        };
        mergedProducts.push(productData);
        processedProductNames.add(normalizedProductNameKey);
      }
      return;
    }
    
    // Determine the representative product for the group (e.g., one with an image, or the most common name variant)
    const representativeProduct = similarProducts.sort((a, b) => {
        const nameA = normalizeProductName(a.name);
        const nameB = normalizeProductName(b.name);
        // Prefer shorter, more generic names if very similar, or ones with images
        if (a.imageUrl && !b.imageUrl) return -1;
        if (!a.imageUrl && b.imageUrl) return 1;
        if (nameA.length < nameB.length && stringSimilarity(nameA, nameB) > 0.9) return -1;
        if (nameA.length > nameB.length && stringSimilarity(nameA, nameB) > 0.9) return 1;
        return 0;
    })[0] || product; 

    const groupNormalizedName = normalizeProductName(representativeProduct.name);

    const productData: MergedBackendProduct = {
      id: `product-${mergedProducts.length}-${groupNormalizedName.replace(/\s+/g, '-')}`,
      name: representativeProduct.name,
      imageUrl: representativeProduct.imageUrl || '/placeholder.svg',
      prices: { zepto: null, blinkit: null, instamart: null },
      // sourceProducts: similarProducts // Optional: for debugging
    };

    similarProducts.forEach(p => {
      const platform = p.sourcePlatform; // 'zepto', 'blinkit', or 'instamart'
      if (!productData.prices[platform]) { // Take the first one for a given platform in this group
        productData.prices[platform] = {
          price: p.price, // Raw price string
          unit: p.unit,
          url: p.url,
          // Here you could use extractPriceDetails if needed:
          // const priceDetails = extractPriceDetails(p.price);
          // price: priceDetails.price.toString(), // If you want to store parsed numeric price as string
          // originalPrice: priceDetails.originalPrice?.toString(),
          // discountPercentage: priceDetails.discountPercentage,
        };
      }
      processedProductNames.add(normalizeProductName(p.name)); // Mark all names in this group as processed
    });

    mergedProducts.push(productData);
  });

  // Fallback logic (getFallbackProducts) is removed as per instructions.
  // If mergedProducts is empty, it will be returned as such.

  return mergedProducts;
}

// This helper can be moved to a more general utility file if used elsewhere,
// but for now, it's fine here or in scrapingService.ts.
export function getPlatformBaseUrl(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'zepto': return 'www.zeptonow.com'; // Removed https://
    case 'blinkit': return 'blinkit.com';   // Removed https://
    case 'instamart': return 'www.swiggy.com/instamart'; // Removed https://
    default: return '';
  }
}
