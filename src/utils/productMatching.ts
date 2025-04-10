
import { ProductData } from '@/components/ProductCard';
import { ScrapedResult } from './types';
import { areProductsSimilar } from './stringComparison';
import { extractPrice } from './priceUtils';

/**
 * Process and merge product data from multiple platforms based on 60% similarity threshold
 */
export function mergeProducts(
  zeptoProducts: ScrapedResult[], 
  blinkitProducts: ScrapedResult[], 
  instamartProducts: ScrapedResult[],
  query: string
): ProductData[] {
  console.log('Raw product counts for matching:', {
    zepto: zeptoProducts.length,
    blinkit: blinkitProducts.length,
    instamart: instamartProducts.length
  });
  
  // If all platforms returned no products, return fallback
  if (zeptoProducts.length === 0 && blinkitProducts.length === 0 && instamartProducts.length === 0) {
    console.log('No products found on any platform, using fallback');
    return getFallbackProducts(query);
  }
  
  const mergedProducts: ProductData[] = [];
  const processedProducts = new Set<string>();
  
  // Create a master list of all products
  const allProducts: Array<ScrapedResult & { source: string }> = [
    ...zeptoProducts.map(p => ({ ...p, source: 'zepto' })),
    ...blinkitProducts.map(p => ({ ...p, source: 'blinkit' })),
    ...instamartProducts.map(p => ({ ...p, source: 'instamart' }))
  ];
  
  // Log the total number of products across all platforms
  console.log(`Total products to merge: ${allProducts.length}`);
  
  // Sort products by name for more deterministic grouping
  allProducts.sort((a, b) => a.name.localeCompare(b.name));
  
  // First pass: find exact name matches
  const exactMatches = new Map<string, ScrapedResult[]>();
  
  allProducts.forEach(product => {
    const normalizedName = product.name.toLowerCase().trim();
    if (!exactMatches.has(normalizedName)) {
      exactMatches.set(normalizedName, []);
    }
    exactMatches.get(normalizedName)?.push(product);
  });
  
  // Process exact matches first
  exactMatches.forEach((products, normalizedName) => {
    if (products.length > 1) {
      console.log(`Found ${products.length} exact matches for ${normalizedName}`);
      
      // Create a merged product data object
      const firstProduct = products[0];
      const productData: ProductData = {
        id: `product-${mergedProducts.length}`,
        name: firstProduct.name,
        imageUrl: firstProduct.imageUrl || '/placeholder.svg',
        prices: {},
        unit: firstProduct.unit || '',
        sources: products.map(p => p.source as string)
      };
      
      // Add prices from each platform
      products.forEach(product => {
        const platform = product.source as keyof ProductData['prices'];
        
        productData.prices[platform] = {
          price: product.price,
          unit: product.unit,
          url: product.url
        };
        
        // Mark this product as processed
        processedProducts.add(product.name);
      });
      
      // For platforms without this product, add "Not available"
      const availablePlatforms = new Set(products.map(p => p.source));
      const allPlatforms = ['zepto', 'blinkit', 'instamart'];
      
      allPlatforms.forEach(platform => {
        if (!availablePlatforms.has(platform)) {
          productData.prices[platform as keyof ProductData['prices']] = {
            price: 'Not available',
            unit: '',
            url: `https://${getPlatformBaseUrl(platform)}/search?q=${encodeURIComponent(query)}`
          };
        }
      });
      
      mergedProducts.push(productData);
    }
  });
  
  // Second pass: find similar products for those not already processed
  for (const product of allProducts) {
    // Skip if this product name has been processed in exact matches
    if (processedProducts.has(product.name)) {
      continue;
    }
    
    console.log(`Processing product: ${product.name} from ${product.source}`);
    
    // For mock data, reduce the similarity threshold to ensure we get products
    const similarityThreshold = product.isMock ? 0.4 : 0.6;
    
    // Find all similar products across all platforms
    const similarProducts = allProducts.filter(p => 
      !processedProducts.has(p.name) && 
      (p === product || areProductsSimilar(p.name, product.name))
    );
    
    console.log(`Found ${similarProducts.length} similar products for ${product.name}`);
    
    // Create a merged product data object
    const productData: ProductData = {
      id: `product-${mergedProducts.length}`,
      name: product.name, // Use the first product's name
      imageUrl: product.imageUrl || '/placeholder.svg',
      prices: {},
      unit: product.unit || '', // Use the first product's unit
      sources: similarProducts.map(p => p.source as string)
    };
    
    // Add prices from each platform
    for (const similarProduct of similarProducts) {
      const platform = similarProduct.source as keyof ProductData['prices'];
      
      productData.prices[platform] = {
        price: similarProduct.price,
        unit: similarProduct.unit,
        url: similarProduct.url
      };
      
      // Mark this product as processed
      processedProducts.add(similarProduct.name);
    }
    
    // For platforms without this product, add "Not available"
    const availablePlatforms = new Set(similarProducts.map(p => p.source));
    const allPlatforms = ['zepto', 'blinkit', 'instamart'];
    
    allPlatforms.forEach(platform => {
      if (!availablePlatforms.has(platform)) {
        productData.prices[platform as keyof ProductData['prices']] = {
          price: 'Not available',
          unit: '',
          url: `https://${getPlatformBaseUrl(platform)}/search?q=${encodeURIComponent(query)}`
        };
      }
    });
    
    mergedProducts.push(productData);
  }
  
  console.log('Total merged products:', mergedProducts.length);
  
  // If we somehow ended up with no products, fall back to direct links
  if (mergedProducts.length === 0) {
    return getFallbackProducts(query);
  }
  
  return mergedProducts;
}

/**
 * Helper to get platform base URLs for "Not available" products
 */
function getPlatformBaseUrl(platform: string): string {
  switch (platform) {
    case 'zepto':
      return 'www.zeptonow.com';
    case 'blinkit':
      return 'blinkit.com';
    case 'instamart':
      return 'www.swiggy.com/instamart';
    default:
      return '';
  }
}

/**
 * Check if a product has already been processed based on name similarity
 */
function isProductProcessed(productName: string, processedNames: Set<string>): boolean {
  for (const name of processedNames) {
    if (areProductsSimilar(productName, name)) {
      return true;
    }
  }
  return false;
}

/**
 * Fallback products to show when scraping fails
 */
export function getFallbackProducts(query: string): ProductData[] {
  console.log(`Creating fallback product data for query: ${query}`);
  
  return [
    {
      id: 'fallback-1',
      name: `Search for "${query}" on all platforms`,
      imageUrl: '/placeholder.svg',
      prices: {
        zepto: {
          price: 'Click to view',
          unit: '',
          url: `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`
        },
        blinkit: {
          price: 'Click to view',
          unit: '',
          url: `https://blinkit.com/s/?q=${encodeURIComponent(query)}`
        },
        instamart: {
          price: 'Click to view',
          unit: '',
          url: `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(query)}`
        }
      }
    }
  ];
}
