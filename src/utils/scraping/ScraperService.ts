
import { ProductScraper } from './ProductScraper';
import { ScrapedResult } from '../types';
import { mergeProducts, getFallbackProducts } from '../productMatching';
import { toast } from '@/hooks/use-toast';

class ScraperService {
  private scraper: ProductScraper;
  private cachedResults: Map<string, { timestamp: number, data: any }> = new Map();
  private cacheExpiration = 5 * 60 * 1000; // 5 minutes
  private maxRetries = 3; // Increased maximum retry attempts
  private retryDelay = 1000; // Delay between retries in milliseconds
  private lastNetworkErrorTime: number = 0;
  
  constructor() {
    this.scraper = new ProductScraper(12000); // Increased timeout to 12 seconds
    console.log(`[ScraperService] Initialized with 12s timeout`);
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
      
      const realZeptoProducts = this.filterOutMockData(zeptoProducts, 'zepto');
      const realBlinkitProducts = this.filterOutMockData(blinkitProducts, 'blinkit');
      const realInstamartProducts = this.filterOutMockData(instamartProducts, 'instamart');
      
      const anyRealProducts = 
        realZeptoProducts.length > 0 || 
        realBlinkitProducts.length > 0 || 
        realInstamartProducts.length > 0;
      
      console.log('[ScraperService] Real products scraped:', {
        zepto: realZeptoProducts.length,
        blinkit: realBlinkitProducts.length,
        instamart: realInstamartProducts.length,
        anyRealProducts
      });
      
      // If no real products found from any source, show appropriate message
      if (!anyRealProducts) {
        // Rate limit network error messages (only show once every 30 seconds)
        const now = Date.now();
        if (now - this.lastNetworkErrorTime > 30000) {
          this.lastNetworkErrorTime = now;
          toast({
            title: "Network Issues Detected",
            description: "Could not fetch real-time data. Please check your connection and try again.",
            variant: "destructive",
            duration: 5000,
          });
        }
        
        // Use cached results if available, otherwise return empty array
        const cachedResults = this.getAllCachedResults(query);
        if (cachedResults.length > 0) {
          console.log(`[ScraperService] Using ${cachedResults.length} cached products due to network issues`);
          return { products: cachedResults };
        }
        
        return { products: [] };
      }
      
      // If some sources failed but others succeeded, notify the user
      const failedSources = [];
      if (realZeptoProducts.length === 0) failedSources.push('Zepto');
      if (realBlinkitProducts.length === 0) failedSources.push('Blinkit');
      if (realInstamartProducts.length === 0) failedSources.push('Instamart');
      
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
        realZeptoProducts,
        realBlinkitProducts,
        realInstamartProducts,
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
        description: "Failed to fetch data. Please try again later.",
        variant: "destructive",
      });
      
      // Return empty results instead of fallbacks
      return { products: [] };
    }
  }
  
  /**
   * Filter out mock data from product results
   */
  private filterOutMockData(products: ScrapedResult[], source: string): ScrapedResult[] {
    // Check if these are mock products by examining patterns in the data
    const isMockData = products.length > 0 && products.every(product => {
      // Check for default mock image URLs
      const hasMockImage = product.imageUrl && (
        product.imageUrl.includes('wikipedia.org') ||
        product.imageUrl.includes('via.placeholder.com')
      );
      
      // For zepto, check if all products match the mock pattern
      if (source === 'zepto') {
        return hasMockImage || 
               (products.length === 3 && 
                products.some(p => p.name === "Daawat Basmati Rice - Super") &&
                products.some(p => p.name === "India Gate Basmati Rice - Classic") &&
                products.some(p => p.name === "Fortune Everyday Basmati Rice"));
      }
      
      // For blinkit, check if all products match the mock pattern
      if (source === 'blinkit') {
        return hasMockImage || 
               (products.length === 3 && 
                products.some(p => p.name === "Daawat Rozana Basmati Rice Gold") &&
                products.some(p => p.name === "India Gate Basmati Rice - Classic") &&
                products.some(p => p.name === "Fortune Everyday Basmati Rice"));
      }
      
      // For instamart, check if all products match the mock pattern
      if (source === 'instamart') {
        return hasMockImage || 
               (products.length === 3 && 
                products.some(p => p.name === "Daawat Basmati Rice - Super") &&
                products.some(p => p.name === "India Gate Classic Basmati Rice") &&
                products.some(p => p.name === "Fortune Basmati Rice"));
      }
      
      return hasMockImage;
    });
    
    if (isMockData) {
      console.log(`[ScraperService] Detected mock data for ${source}, filtering out`);
      return [];
    }
    
    return products;
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
  
  /**
   * Get all cached results that might be relevant to the query
   */
  private getAllCachedResults(query: string): any[] {
    const results: any[] = [];
    const now = Date.now();
    const queryLower = query.toLowerCase();
    
    for (const [key, entry] of this.cachedResults.entries()) {
      if (now - entry.timestamp < this.cacheExpiration * 2) { // Allow slightly older cache
        if (key.toLowerCase().includes(queryLower)) {
          results.push(...(entry.data.products || []));
        }
      }
    }
    
    return results.slice(0, 10); // Limit to 10 products
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
