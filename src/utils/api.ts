
import { ProductData } from '@/components/ProductCard';
import { SearchResultResponse, ScrapedResult } from './types';
import { extractPrice } from './priceUtils';
import { scrapeZeptoProducts } from './scrapers/zeptoScraper';
import { scrapeBlinkitProducts } from './scrapers/blinkitScraper';
import { scrapeInstamartProducts } from './scrapers/instamartScraper';
import { mergeProducts, getFallbackProducts } from './productMatching';

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
  console.log(`Searching for "${query}" at location:`, location);
  
  try {
    // Fetch from multiple platforms in parallel
    const [zeptoProducts, blinkitProducts, instamartProducts] = await Promise.all([
      scrapeZeptoProducts(query),
      scrapeBlinkitProducts(query),
      scrapeInstamartProducts(query)
    ]);

    // Add numeric price to each product for comparison
    const productsWithNumericPrice = [
      ...zeptoProducts, 
      ...blinkitProducts, 
      ...instamartProducts
    ].map(product => ({
      ...product,
      numericPrice: extractPrice(product.price)
    }));

    console.log('Scraped products:', { 
      zeptoProducts, 
      blinkitProducts, 
      instamartProducts 
    });
    
    // Merge similar products across platforms
    const mergedProducts = mergeProducts(
      zeptoProducts, 
      blinkitProducts, 
      instamartProducts, 
      query
    );
    
    return { products: mergedProducts };
  } catch (error) {
    console.error('Scraping error:', error);
    // If scraping fails, use a fallback approach to show the expected structure
    return { products: getFallbackProducts(query) };
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
    console.error('Error scraping product prices:', error);
    throw new Error('Failed to retrieve live price data');
  }
};
