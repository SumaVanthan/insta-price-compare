
import { ScrapedResult } from '../types';
import { ScraperClient } from '../scraping/ScraperClient';

export abstract class BaseScraper {
  protected scraperClient: ScraperClient;
  protected maxFallbackItems = 5;
  
  constructor(timeout: number = 8000) {
    this.scraperClient = new ScraperClient(timeout);
  }
  
  abstract scrapeProducts(query: string): Promise<ScrapedResult[]>;
  abstract getFallbackProducts(query: string): ScrapedResult[];
  
  protected logError(platform: string, error: any): void {
    console.error(`[${platform}Scraper] Scraping error:`, error);
  }
  
  /**
   * Handle scraping errors with better fallback mechanism
   */
  protected handleScrapingError(platform: string, error: any, query: string): ScrapedResult[] {
    this.logError(platform, error);
    
    console.info(`[${platform}Scraper] Using fallback products for "${query}"`);
    return this.getFallbackProducts(query);
  }
  
  /**
   * Normalize product name for better matching
   */
  protected normalizeProductName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }
}
