
import { ProductScraper } from './ProductScraper';
import { ScrapedResult } from '../types';
import { mergeProducts, getFallbackProducts } from '../productMatching';

class ScraperService {
  private scraper: ProductScraper;
  private cachedResults: Map<string, { timestamp: number, data: any }> = new Map();
  private cacheExpiration = 5 * 60 * 1000; // 5 minutes
  
  constructor() {
    this.scraper = new ProductScraper(8000); // 8 second timeout
  }
  
  async searchProducts(query: string, location: { latitude: number; longitude: number }) {
    console.log(`Searching for "${query}" at location:`, location);
    
    // Check cache first
    const cacheKey = `search:${query}:${location.latitude}:${location.longitude}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      console.log('Using cached search results');
      return cached;
    }
    
    try {
      // Scrape in parallel with a timeout for each source
      const [zeptoProducts, blinkitProducts, instamartProducts] = await Promise.all([
        this.scraper.scrapeZeptoProducts(query).catch(err => {
          console.error('Zepto scraping error:', err);
          return [];
        }),
        this.scraper.scrapeBlinkitProducts(query).catch(err => {
          console.error('Blinkit scraping error:', err);
          return [];
        }),
        this.scraper.scrapeInstamartProducts(query).catch(err => {
          console.error('Instamart scraping error:', err);
          return [];
        })
      ]);
      
      console.log('Products scraped:', {
        zepto: zeptoProducts.length,
        blinkit: blinkitProducts.length,
        instamart: instamartProducts.length
      });
      
      // If no products found, use fallbacks
      if (zeptoProducts.length === 0 && blinkitProducts.length === 0 && instamartProducts.length === 0) {
        console.log('No products found from any source, using fallback');
        const fallbackProducts = getFallbackProducts(query);
        return { products: fallbackProducts };
      }
      
      // Merge products and cache the result
      const mergedProducts = mergeProducts(
        zeptoProducts,
        blinkitProducts,
        instamartProducts,
        query
      );
      
      const result = { products: mergedProducts };
      this.cacheResult(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Search error:', error);
      
      // Return fallback products if scraping fails
      const fallbackProducts = getFallbackProducts(query);
      return { products: fallbackProducts };
    }
  }
  
  clearCache() {
    this.cachedResults.clear();
  }
  
  private getCachedResult(key: string) {
    const cached = this.cachedResults.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
      return cached.data;
    }
    return null;
  }
  
  private cacheResult(key: string, data: any) {
    this.cachedResults.set(key, {
      timestamp: Date.now(),
      data
    });
  }
}

// Singleton instance
export const scraperService = new ScraperService();
