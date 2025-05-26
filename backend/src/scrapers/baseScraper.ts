// backend/src/scrapers/baseScraper.ts
import { ScrapedResult } from '../types'; // Path relative to backend/src/scrapers/

export abstract class BaseScraper {
  // scraperClient property and constructor are removed
  // maxFallbackItems can be removed if not used by any inheriting class
  
  // Constructor removed as it's not needed without scraperClient initialization
  
  abstract scrapeProducts(query: string, location?: { latitude: number; longitude: number }): Promise<ScrapedResult[]>;
  
  // getFallbackProducts and handleScrapingError are removed as scrapers will return [] directly.
  
  protected logError(platform: string, error: any): void {
    console.error(`[${platform}Scraper] Scraping error:`, error);
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
