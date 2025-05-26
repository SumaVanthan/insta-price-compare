
import { ScrapedResult } from '../types';
import { ZeptoScraper } from '../scrapers/zeptoScraper';
import { BlinkitScraper } from '../scrapers/blinkitScraper';
import { InstamartScraper } from '../scrapers/instamartScraper';

export class ProductScraper {
  private timeout: number;
  private zeptoScraper: ZeptoScraper;
  private blinkitScraper: BlinkitScraper;
  private instamartScraper: InstamartScraper;

  constructor(timeout: number = 8000) {
    this.timeout = timeout;
    this.zeptoScraper = new ZeptoScraper(timeout);
    this.blinkitScraper = new BlinkitScraper(timeout);
    this.instamartScraper = new InstamartScraper(timeout);
    console.log(`[ProductScraper] Initialized with timeout: ${timeout}ms`);
  }

  /**
   * Scrape Zepto products based on search query
   */
  async scrapeZeptoProducts(query: string, location?: { latitude: number; longitude: number }): Promise<ScrapedResult[]> {
    try {
      return await this.zeptoScraper.scrapeProducts(query, location);
    } catch (error) {
      console.error('[ProductScraper] Failed to scrape Zepto:', error);
      return [];
    }
  }
  
  /**
   * Scrape Blinkit products based on search query
   */
  async scrapeBlinkitProducts(query: string, location?: { latitude: number; longitude: number }): Promise<ScrapedResult[]> {
    try {
      return await this.blinkitScraper.scrapeProducts(query, location);
    } catch (error) {
      console.error('[ProductScraper] Failed to scrape Blinkit:', error);
      return [];
    }
  }
  
  /**
   * Scrape Instamart products based on search query
   */
  async scrapeInstamartProducts(query: string, location?: { latitude: number; longitude: number }): Promise<ScrapedResult[]> {
    try {
      return await this.instamartScraper.scrapeProducts(query, location);
    } catch (error) {
      console.error('[ProductScraper] Failed to scrape Instamart:', error);
      return [];
    }
  }
}
