
import cheerio from 'cheerio';

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
  
  constructor(private timeout: number = 5000) {}
  
  async fetch(url: string): Promise<ScraperResult> {
    const startTime = Date.now();
    
    // Check cache first
    const cachedResult = this.getFromCache(url);
    if (cachedResult) {
      console.log(`Using cached result for ${url}`);
      return { 
        success: true, 
        data: cachedResult,
        duration: 0 
      };
    }
    
    console.log(`Fetching ${url} with timeout ${this.timeout}ms`);
    
    // Try each proxy in parallel (not sequentially)
    const proxyPromises = this.proxyUrls.map(proxyUrl => 
      this.fetchWithProxy(proxyUrl, url)
    );
    
    try {
      // Race all proxy requests
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
      
      if (html.length < 1000 || (!html.includes('<html') && !html.includes('<body'))) {
        throw new Error('Invalid HTML response');
      }
      
      // Save to cache
      this.saveToCache(url, html);
      
      const duration = Date.now() - startTime;
      console.log(`Successfully fetched ${url} in ${duration}ms`);
      
      return {
        success: true,
        data: html,
        duration
      };
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
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
    
    return fetch(proxyUrl, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': window.location.origin
      },
      signal: AbortSignal.timeout(this.timeout)
    });
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
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}
