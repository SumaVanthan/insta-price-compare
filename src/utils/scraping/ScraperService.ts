
import { ProductScraper } from './ProductScraper';
import { ScrapedResult } from '../types';
import { mergeProducts, getFallbackProducts } from '../productMatching';

class ScraperService {
  private scraper: ProductScraper;
  private cachedResults: Map<string, { timestamp: number, data: any }> = new Map();
  private cacheExpiration = 5 * 60 * 1000; // 5 minutes
  
  constructor() {
    this.scraper = new ProductScraper(8000); // 8 second timeout
    console.log(`[ScraperService] Initialized with 8s timeout`);
  }
  
  async searchProducts(query: string, location: { latitude: number; longitude: number }) {
    console.log(`[ScraperService] Searching for "${query}" at location: ${location.latitude}, ${location.longitude}`);
    
    // Check cache first
    const cacheKey = `search:${query}:${location.latitude}:${location.longitude}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      console.log('[ScraperService] Using cached search results');
      return cached;
    }
    
    try {
      console.log('[ScraperService] Starting parallel scraping of all sources...');
      // Scrape in parallel with a timeout for each source
      const [zeptoProducts, blinkitProducts, instamartProducts] = await Promise.all([
        this.scraper.scrapeZeptoProducts(query).catch(err => {
          console.error('[ScraperService] Zepto scraping error:', err);
          return [];
        }),
        this.scraper.scrapeBlinkitProducts(query).catch(err => {
          console.error('[ScraperService] Blinkit scraping error:', err);
          return [];
        }),
        this.scraper.scrapeInstamartProducts(query).catch(err => {
          console.error('[ScraperService] Instamart scraping error:', err);
          return [];
        })
      ]);
      
      console.log('[ScraperService] Products scraped:', {
        zepto: zeptoProducts.length,
        blinkit: blinkitProducts.length,
        instamart: instamartProducts.length
      });
      
      // If no products found, use fallbacks
      if (zeptoProducts.length === 0 && blinkitProducts.length === 0 && instamartProducts.length === 0) {
        console.log('[ScraperService] No products found from any source, using fallback');
        const fallbackProducts = getFallbackProducts(query);
        return { products: fallbackProducts };
      }
      
      // Merge products and cache the result
      console.log('[ScraperService] Merging products from all sources...');
      const mergedProducts = mergeProducts(
        zeptoProducts,
        blinkitProducts,
        instamartProducts,
        query
      );
      
      console.log(`[ScraperService] Final merged products count: ${mergedProducts.length}`);
      
      const result = { products: mergedProducts };
      this.cacheResult(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('[ScraperService] Search error:', error);
      
      // Return fallback products if scraping fails
      const fallbackProducts = getFallbackProducts(query);
      return { products: fallbackProducts };
    }
  }
  
  clearCache() {
    console.log(`[ScraperService] Cache cleared (had ${this.cachedResults.size} entries)`);
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
    console.log(`[ScraperService] Saved search result to cache with key: ${key}`);
  }
}

// Singleton instance
export const scraperService = new ScraperService();
