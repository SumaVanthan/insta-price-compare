
import { ProductScraper } from './ProductScraper';
import { ScrapedResult } from '../types';
import { mergeProducts, getFallbackProducts } from '../productMatching';
import { toast } from '@/hooks/use-toast';

class ScraperService {
  private scraper: ProductScraper;
  private cachedResults: Map<string, { timestamp: number, data: any }> = new Map();
  private cacheExpiration = 5 * 60 * 1000; // 5 minutes
  private maxRetries = 2; // Maximum number of retry attempts
  private retryDelay = 1000; // Delay between retries in milliseconds
  
  constructor() {
    this.scraper = new ProductScraper(8000); // 8 second timeout
    console.log(`[ScraperService] Initialized with 8s timeout`);
  }
  
  async searchProducts(query: string, location: { latitude: number; longitude: number }) {
    console.log(`[ScraperService] Searching for "${query}" at location: ${location.latitude}, ${location.longitude}`);
    
    // Check cache first (cache by query and location)
    const cacheKey = `search:${query}:${location.latitude}:${location.longitude}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      console.log('[ScraperService] Using cached search results');
      return cached;
    }
    
    try {
      console.log('[ScraperService] Starting parallel scraping of all sources...');
      
      // Scrape in parallel with retries and better error handling
      const [zeptoProducts, blinkitProducts, instamartProducts] = await Promise.all([
        this.scrapeWithRetry(() => this.scraper.scrapeZeptoProducts(query), 'Zepto'),
        this.scrapeWithRetry(() => this.scraper.scrapeBlinkitProducts(query), 'Blinkit'),
        this.scrapeWithRetry(() => this.scraper.scrapeInstamartProducts(query), 'Instamart')
      ]);
      
      console.log('[ScraperService] Products scraped:', {
        zepto: zeptoProducts.length,
        blinkit: blinkitProducts.length,
        instamart: instamartProducts.length
      });
      
      // If no products found from any source, use fallbacks but notify user
      if (zeptoProducts.length === 0 && blinkitProducts.length === 0 && instamartProducts.length === 0) {
        console.log('[ScraperService] No products found from any source, using fallback');
        toast({
          title: "Network Issues Detected",
          description: "Using cached results. Live prices may not be available.",
          variant: "destructive",
        });
        const fallbackProducts = getFallbackProducts(query);
        return { products: fallbackProducts };
      }
      
      // If some sources failed but others succeeded, notify the user
      const failedSources = [];
      if (zeptoProducts.length === 0) failedSources.push('Zepto');
      if (blinkitProducts.length === 0) failedSources.push('Blinkit');
      if (instamartProducts.length === 0) failedSources.push('Instamart');
      
      if (failedSources.length > 0 && failedSources.length < 3) {
        toast({
          title: "Partial Data Available",
          description: `Could not fetch from ${failedSources.join(', ')}. Showing available results.`,
          duration: 5000,
        });
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
      
      // Show error toast to user
      toast({
        title: "Search Error",
        description: "Failed to fetch live data. Showing cached results.",
        variant: "destructive",
      });
      
      // Return fallback products if scraping fails
      const fallbackProducts = getFallbackProducts(query);
      return { products: fallbackProducts };
    }
  }
  
  /**
   * Attempt to scrape with retry logic for resilience
   */
  private async scrapeWithRetry(
    scrapeFn: () => Promise<ScrapedResult[]>,
    source: string
  ): Promise<ScrapedResult[]> {
    let lastError: any;
    
    // Try initial attempt + retries
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[ScraperService] Retry attempt ${attempt}/${this.maxRetries} for ${source}`);
          // Add exponential backoff delay
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1)));
        }
        
        return await scrapeFn();
      } catch (error) {
        lastError = error;
        console.warn(`[ScraperService] ${source} scraping attempt ${attempt + 1} failed:`, error);
      }
    }
    
    console.error(`[ScraperService] All ${this.maxRetries + 1} attempts failed for ${source}:`, lastError);
    // Return empty array after all retry attempts fail
    return [];
  }
  
  clearCache() {
    console.log(`[ScraperService] Cache cleared (had ${this.cachedResults.size} entries)`);
    this.cachedResults.clear();
    toast({
      title: "Cache Cleared",
      description: "Search cache has been cleared. Fresh results will be fetched.",
    });
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
