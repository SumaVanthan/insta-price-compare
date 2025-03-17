
import { ProductData } from '@/components/ProductCard';
import { SearchResultResponse } from './types';
import { extractPrice } from './priceUtils';
import { scraperService } from './scraping/ScraperService';

/**
 * Search for products across multiple platforms
 * @param query Search query
 * @param location User's location
 * @returns List of products with prices from different platforms
 */
export const searchProducts = async (
  query: string,
  location: { latitude: number; longitude: number }
): Promise<SearchResultResponse> => {
  console.log(`[API] Searching for "${query}" at location: ${location.latitude}, ${location.longitude}`);
  
  try {
    // Delegate to the scraper service with proper error handling
    console.time('[API] Search execution time');
    const results = await scraperService.searchProducts(query, location);
    console.timeEnd('[API] Search execution time');
    
    console.log(`[API] Found ${results.products.length} products for query "${query}"`);
    
    // Log product sources summary
    const sourceCount = {
      zepto: 0,
      blinkit: 0,
      instamart: 0,
      mixed: 0
    };
    
    results.products.forEach(product => {
      if (product.sources) {
        if (product.sources.length > 1) {
          sourceCount.mixed++;
        } else if (product.sources.includes('zepto')) {
          sourceCount.zepto++;
        } else if (product.sources.includes('blinkit')) {
          sourceCount.blinkit++;
        } else if (product.sources.includes('instamart')) {
          sourceCount.instamart++;
        }
      }
    });
    
    console.log('[API] Product sources breakdown:', sourceCount);
    
    return results;
  } catch (error) {
    console.error('[API] Search error:', error);
    throw error;
  }
};

/**
 * Scrape detailed prices for a specific product
 * Note: This is a placeholder for a more detailed implementation
 */
export const scrapeProductPrices = async (
  productId: string, 
  location: { latitude: number; longitude: number }
) => {
  console.log(`[API] Scraping detailed prices for product ID: ${productId}`);
  // In a real implementation, this would call your backend API which handles the scraping
  // For demo purposes, we're returning a synthetic response
  try {
    // Simulate a delay to represent the scraping process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      prices: {
        zepto: { 
          price: 'Live Price', 
          unit: 'Check website',
          url: 'https://www.zeptonow.com/product/sample-product/prid/12345'
        },
        blinkit: { 
          price: 'Live Price', 
          unit: 'Check website',
          url: 'https://blinkit.com/prn/sample-product/prid/54321'
        },
        instamart: { 
          price: 'Live Price', 
          unit: 'Check website',
          url: 'https://www.swiggy.com/instamart-item/sample-product-123456'
        },
      }
    };
  } catch (error) {
    console.error('[API] Error scraping product prices:', error);
    throw new Error('Failed to retrieve live price data');
  }
};
