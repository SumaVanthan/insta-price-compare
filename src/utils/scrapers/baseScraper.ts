
import { ScrapedResult } from '../types';
import { ScraperClient } from '../scraping/ScraperClient';

export abstract class BaseScraper {
  protected scraperClient: ScraperClient;
  
  constructor(timeout: number = 8000) {
    this.scraperClient = new ScraperClient(timeout);
  }
  
  abstract scrapeProducts(query: string): Promise<ScrapedResult[]>;
  
  protected logError(platform: string, error: any): void {
    console.error(`[${platform}Scraper] Scraping error:`, error);
  }
}
