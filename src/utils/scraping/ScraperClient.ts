
import * as cheerio from 'cheerio';

type ScraperResult = {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
};

export class ScraperClient {
  private proxyUrls: string[] = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://proxy.cors.sh/',
    'https://api.codetabs.com/v1/proxy?quest='
  ];
  
  private cache: Map<string, {data: any, timestamp: number}> = new Map();
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes
  private proxyFailureCount: Map<string, number> = new Map(); // Track proxy reliability
  
  constructor(private timeout: number = 5000) {
    console.log(`[ScraperClient] Initialized with timeout: ${timeout}ms`);
    
    // Initialize proxy failure counts
    this.proxyUrls.forEach(proxy => {
      this.proxyFailureCount.set(proxy, 0);
    });
  }
  
  async fetch(url: string): Promise<ScraperResult> {
    const startTime = Date.now();
    
    // Check cache first
    const cachedResult = this.getFromCache(url);
    if (cachedResult) {
      console.log(`[ScraperClient] Using cached result for ${url}`);
      return { 
        success: true, 
        data: cachedResult,
        duration: 0 
      };
    }
    
    console.log(`[ScraperClient] Fetching ${url} with timeout ${this.timeout}ms`);
    
    // Sort proxies by failure count (most reliable first)
    const sortedProxies = [...this.proxyUrls].sort((a, b) => {
      return (this.proxyFailureCount.get(a) || 0) - (this.proxyFailureCount.get(b) || 0);
    });
    
    // Try each proxy in parallel with the most reliable ones prioritized
    const proxyPromises = sortedProxies.map(proxyUrl => {
      const proxyName = proxyUrl.split('/')[2];
      console.log(`[ScraperClient] Trying proxy: ${proxyName} for ${url}`);
      return this.fetchWithProxy(proxyUrl, url).catch(error => {
        // Increment failure count for this proxy
        const currentCount = this.proxyFailureCount.get(proxyUrl) || 0;
        this.proxyFailureCount.set(proxyUrl, currentCount + 1);
        throw error; // Re-throw to be caught by Promise.race
      });
    });
    
    try {
      // Race all proxy requests with overall timeout
      const response = await Promise.race([
        ...proxyPromises,
        new Promise<Response>((_, reject) => 
          setTimeout(() => reject(new Error('All proxies timed out')), this.timeout)
        )
      ]) as Response;
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const html = await response.text();
      
      // Validate HTML response
      if (this.isValidHtml(html)) {
        // Save to cache
        this.saveToCache(url, html);
        
        const duration = Date.now() - startTime;
        console.log(`[ScraperClient] Successfully fetched ${url} in ${duration}ms`);
        
        return {
          success: true,
          data: html,
          duration
        };
      } else {
        throw new Error('Invalid HTML response');
      }
    } catch (error) {
      console.error(`[ScraperClient] Error fetching ${url}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }
  
  /**
   * Check if HTML response is valid and contains actual content
   */
  private isValidHtml(html: string): boolean {
    if (!html || html.length < 1000) {
      console.warn(`[ScraperClient] Very short HTML response (${html?.length || 0} chars)`);
      return false;
    }
    
    if (!html.includes('<html') && !html.includes('<body')) {
      console.warn('[ScraperClient] Response does not contain HTML tags');
      return false;
    }
    
    // Check for common error messages
    const lowerHtml = html.toLowerCase();
    if (lowerHtml.includes('access denied') || 
        lowerHtml.includes('forbidden') || 
        lowerHtml.includes('captcha') || 
        lowerHtml.includes('too many requests')) {
      console.warn('[ScraperClient] Response contains access restriction indicators');
      return false;
    }
    
    return true;
  }
  
  async parse(html: string, selectors: Record<string, string>): Promise<any> {
    const $ = cheerio.load(html);
    const result: Record<string, any> = {};
    
    for (const [key, selector] of Object.entries(selectors)) {
      result[key] = $(selector).toArray().map(element => $(element).text().trim());
    }
    
    return result;
  }
  
  private async fetchWithProxy(proxyBaseUrl: string, targetUrl: string): Promise<Response> {
    const encodedUrl = encodeURIComponent(targetUrl);
    const proxyUrl = `${proxyBaseUrl}${encodedUrl}`;
    
    try {
      return fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': window.location.origin,
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: AbortSignal.timeout(this.timeout)
      });
    } catch (error) {
      console.error(`[ScraperClient] Proxy ${proxyBaseUrl} failed:`, error);
      throw error;
    }
  }
  
  private getFromCache(url: string): any | null {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }
  
  private saveToCache(url: string, data: any): void {
    this.cache.set(url, {
      data,
      timestamp: Date.now()
    });
    console.log(`[ScraperClient] Saved result for ${url} to cache`);
  }
  
  clearCache(): void {
    console.log(`[ScraperClient] Cache cleared (had ${this.cache.size} entries)`);
    this.cache.clear();
  }
  
  /**
   * Reset proxy failure counts to give all proxies a fresh chance
   */
  resetProxyStats(): void {
    this.proxyUrls.forEach(proxy => {
      this.proxyFailureCount.set(proxy, 0);
    });
    console.log('[ScraperClient] Proxy statistics reset');
  }
}
