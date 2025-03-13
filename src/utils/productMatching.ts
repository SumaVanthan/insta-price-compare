
import { ProductData } from '@/components/ProductCard';
import { ScrapedResult } from './types';
import { stringSimilarity } from './stringComparison';
import { extractPrice } from './priceUtils';

/**
 * Process and merge product data from multiple platforms based on similarity
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
  const similarityThreshold = 0.8; // 80% name similarity as requested
  
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
  
  // For each product, find similar products across platforms
  for (const product of allProducts) {
    // Skip if this product name has been processed
    if (isProductProcessed(product.name, processedProducts)) {
      continue;
    }
    
    console.log(`Processing product: ${product.name} from ${product.source}`);
    
    // Find all similar products across all platforms
    const similarProducts = allProducts.filter(p => 
      !isProductProcessed(p.name, processedProducts) && 
      (p === product || stringSimilarity(p.name.toLowerCase(), product.name.toLowerCase()) >= similarityThreshold)
    );
    
    console.log(`Found ${similarProducts.length} similar products for ${product.name}`);
    
    // Create a merged product data object
    const productData: ProductData = {
      id: `product-${mergedProducts.length}`,
      name: product.name, // Use the first product's name
      imageUrl: product.imageUrl || '/placeholder.svg',
      prices: {},
      unit: product.unit // Use the first product's unit
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
    if (stringSimilarity(productName.toLowerCase(), name.toLowerCase()) >= 0.8) { // Using 80% threshold
      return true;
    }
  }
  return false;
}

/**
 * Fallback products to show when scraping fails
 */
export function getFallbackProducts(query: string): ProductData[] {
  console.log('Using fallback products for query:', query);
  
  // Instead of using hardcoded mock data, we'll redirect users to the actual sites
  return [
    {
      id: '1',
      name: `${query} - View on Zepto`,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png',
      prices: {
        zepto: { 
          price: 'Click to view', 
          unit: 'Live price',
          url: `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`
        }
      },
      unit: 'Search result'
    },
    {
      id: '2',
      name: `${query} - View on Blinkit`,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png',
      prices: {
        blinkit: { 
          price: 'Click to view', 
          unit: 'Live price',
          url: `https://blinkit.com/s/?q=${encodeURIComponent(query)}`
        }
      },
      unit: 'Search result'
    },
    {
      id: '3',
      name: `${query} - View on Swiggy Instamart`,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg',
      prices: {
        instamart: { 
          price: 'Click to view', 
          unit: 'Live price',
          url: `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`
        }
      },
      unit: 'Search result'
    }
  ];
}
