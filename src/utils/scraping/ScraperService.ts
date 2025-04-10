import { ProductScraper } from './ProductScraper';
import { ScrapedResult } from '../types';
import { mergeProducts, getFallbackProducts } from '../productMatching';
import { toast } from '@/hooks/use-toast';

class ScraperService {
  private scraper: ProductScraper;
  private cachedResults: Map<string, { timestamp: number, data: any }> = new Map();
  private cacheExpiration = 5 * 60 * 1000; // 5 minutes
  private maxRetries = 2; // Maximum retry attempts
  private retryDelay = 1000; // Delay between retries in milliseconds
  private lastNetworkErrorTime: number = 0;
  
  constructor() {
    this.scraper = new ProductScraper(15000); // Increased timeout to 15 seconds
    console.log(`[ScraperService] Initialized with 15s timeout`);
  }
  
  async searchProducts(query: string, location: { latitude: number; longitude: number }) {
    console.log(`[ScraperService] Searching for "${query}" at location: ${location.latitude}, ${location.longitude}`);
    
    // Check if mock data is requested
    const useMockData = localStorage.getItem('use_mock_data') === 'true';
    
    // Check cache first (cache by query and location)
    const cacheKey = `search:${query}:${location.latitude}:${location.longitude}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      console.log('[ScraperService] Using cached search results');
      return cached;
    }
    
    try {
      console.log('[ScraperService] Starting parallel scraping of all sources...');
      
      // If mock data is explicitly requested, use it directly
      if (useMockData) {
        console.log('[ScraperService] Mock data requested, using mock products');
        return this.getMockResults(query);
      }
      
      // Set up a global timeout for the entire search operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Search timed out after 20 seconds")), 20000);
      });
      
      // Scrape in parallel with better error handling
      const scrapingPromise = Promise.all([
        this.scrapeWithRetry(() => this.scraper.scrapeZeptoProducts(query), 'Zepto'),
        this.scrapeWithRetry(() => this.scraper.scrapeBlinkitProducts(query), 'Blinkit'),
        this.scrapeWithRetry(() => this.scraper.scrapeInstamartProducts(query), 'Instamart')
      ]);
      
      // Race between successful scraping and timeout
      const [zeptoProducts, blinkitProducts, instamartProducts] = await Promise.race([
        scrapingPromise,
        timeoutPromise.then(() => {
          throw new Error("Search timed out after 20 seconds");
        })
      ]) as [ScrapedResult[], ScrapedResult[], ScrapedResult[]];
      
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
      
      // If no real products found from any source, show appropriate message and use mock data
      if (!anyRealProducts) {
        // Rate limit network error messages (only show once every 30 seconds)
        const now = Date.now();
        if (now - this.lastNetworkErrorTime > 30000) {
          this.lastNetworkErrorTime = now;
          toast({
            title: "Using mock results",
            description: "Could not fetch real-time data. Showing mock results instead.",
            duration: 5000,
          });
        }
        
        // If real products failed, use mock data as fallback
        return this.getMockResults(query);
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
        title: "Search Issues",
        description: "Could not fetch results. Showing mock data instead.",
        variant: "destructive",
      });
      
      // Return mock results as fallback
      return this.getMockResults(query);
    }
  }
  
  /**
   * Get mock results for all platforms
   */
  private getMockResults(query: string) {
    console.log('[ScraperService] Using mock results for all platforms');
    
    // Get mock data from all platforms
    const zeptoProducts = this.scraper.getMockZeptoProducts(query);
    const blinkitProducts = this.scraper.getMockBlinkitProducts(query);
    const instamartProducts = this.scraper.getMockInstamartProducts(query);
    
    // Mark all products as mock data
    zeptoProducts.forEach(p => p.isMock = true);
    blinkitProducts.forEach(p => p.isMock = true);
    instamartProducts.forEach(p => p.isMock = true);
    
    // Merge mock products
    const mergedProducts = mergeProducts(
      zeptoProducts,
      blinkitProducts,
      instamartProducts,
      query
    );
    
    return { products: mergedProducts };
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
      
      if (hasMockImage) {
        return true;
      }
      
      // For each platform, check if products match the known mock patterns
      if (source === 'zepto' && products.length === 3) {
        return products.some(p => p.name === "Daawat Basmati Rice - Super") &&
               products.some(p => p.name === "India Gate Classic Basmati Rice") &&
               products.some(p => p.name === "Fortune Everyday Basmati Rice");
      }
      
      if (source === 'blinkit' && products.length === 3) {
        return products.some(p => p.name === "Daawat Rozana Basmati Rice Gold") &&
               products.some(p => p.name === "India Gate All Rounder Feast Rozzana Basmati Rice") &&
               products.some(p => p.name === "Udhaiyam Ponni Rice 5 Kgs, Goldwinner Refined Sunflower Oil 1 Ltr, Udhaiyam Urad Dal 1 Kg");
      }
      
      if (source === 'instamart' && products.length === 3) {
        return products.some(p => p.name === "Daawat Basmati Rice - Super") &&
               products.some(p => p.name === "Sivaji Vkr Boiled Rice") &&
               products.some(p => p.name === "Supreme Harvest Ponni Raw Rice");
      }
      
      return false;
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
        
        const results = await scrapeFn();
        
        // If we got results, return them
        if (results && results.length > 0) {
          console.log(`[ScraperService] Successfully scraped ${results.length} products from ${source}`);
          return results;
        } else {
          console.log(`[ScraperService] No products found from ${source}, will retry`);
          lastError = new Error(`No products found from ${source}`);
        }
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
      if (now - entry.timestamp < this.cacheExpiration * 3) { // Allow older cache when needed
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
