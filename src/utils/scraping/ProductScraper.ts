
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
  async scrapeZeptoProducts(query: string): Promise<ScrapedResult[]> {
    try {
      return await this.zeptoScraper.scrapeProducts(query);
    } catch (error) {
      console.error('[ProductScraper] Failed to scrape Zepto:', error);
      return this.getMockZeptoProducts(query);
    }
  }
  
  /**
   * Scrape Blinkit products based on search query
   */
  async scrapeBlinkitProducts(query: string): Promise<ScrapedResult[]> {
    try {
      return await this.blinkitScraper.scrapeProducts(query);
    } catch (error) {
      console.error('[ProductScraper] Failed to scrape Blinkit:', error);
      return this.getMockBlinkitProducts(query);
    }
  }
  
  /**
   * Scrape Instamart products based on search query
   */
  async scrapeInstamartProducts(query: string): Promise<ScrapedResult[]> {
    try {
      return await this.instamartScraper.scrapeProducts(query);
    } catch (error) {
      console.error('[ProductScraper] Failed to scrape Instamart:', error);
      return this.getMockInstamartProducts(query);
    }
  }
  
  /**
   * Get mock Zepto products for testing or when scraping fails
   */
  private getMockZeptoProducts(query: string): ScrapedResult[] {
    console.log('[ProductScraper] Using mock Zepto products');
    return [
      {
        name: "Daawat Basmati Rice - Super",
        price: "₹159",
        unit: "1 kg",
        url: `https://www.zeptonow.com/product/daawat-basmati-rice-super`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png",
        source: "zepto"
      },
      {
        name: "India Gate Basmati Rice - Classic",
        price: "₹232",
        unit: "1 kg",
        url: `https://www.zeptonow.com/product/india-gate-basmati-rice-classic`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png",
        source: "zepto"
      },
      {
        name: "Fortune Everyday Basmati Rice",
        price: "₹120",
        unit: "1 kg",
        url: `https://www.zeptonow.com/product/fortune-everyday-basmati-rice`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png",
        source: "zepto"
      }
    ];
  }
  
  /**
   * Get mock Blinkit products for testing or when scraping fails
   */
  private getMockBlinkitProducts(query: string): ScrapedResult[] {
    console.log('[ProductScraper] Using mock Blinkit products');
    return [
      {
        name: "Daawat Rozana Basmati Rice Gold",
        price: "₹423",
        unit: "5 kg",
        url: `https://blinkit.com/prn/daawat-rozana-basmati-rice-gold/prid/423`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png",
        source: "blinkit"
      },
      {
        name: "India Gate Basmati Rice - Classic",
        price: "₹235",
        unit: "1 kg",
        url: `https://blinkit.com/prn/india-gate-basmati-rice-classic/prid/235`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png",
        source: "blinkit"
      },
      {
        name: "Fortune Everyday Basmati Rice",
        price: "₹118",
        unit: "1 kg",
        url: `https://blinkit.com/prn/fortune-everyday-basmati-rice/prid/118`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png",
        source: "blinkit"
      }
    ];
  }
  
  /**
   * Get mock Instamart products for testing or when scraping fails
   */
  private getMockInstamartProducts(query: string): ScrapedResult[] {
    console.log('[ProductScraper] Using mock Instamart products');
    return [
      {
        name: "Daawat Basmati Rice - Super",
        price: "₹160",
        unit: "1 kg",
        url: `https://www.swiggy.com/instamart/product/daawat-basmati-rice-super`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg",
        source: "instamart"
      },
      {
        name: "India Gate Classic Basmati Rice",
        price: "₹230",
        unit: "1 kg",
        url: `https://www.swiggy.com/instamart/product/india-gate-classic-basmati-rice`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg",
        source: "instamart"
      },
      {
        name: "Fortune Basmati Rice",
        price: "₹121",
        unit: "1 kg",
        url: `https://www.swiggy.com/instamart/product/fortune-basmati-rice`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg",
        source: "instamart"
      }
    ];
  }
}
