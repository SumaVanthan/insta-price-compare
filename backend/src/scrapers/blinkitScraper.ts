// backend/src/scrapers/blinkitScraper.ts
import { ScrapedResult } from '../types';
import { BaseScraper } from './baseScraper';
import { fetchHtml } from '../utils/httpClient';
import * as cheerio from 'cheerio';

export class BlinkitScraper extends BaseScraper {
  constructor() {
    super(); // Call base constructor if it has any logic in the future
  }

  async scrapeProducts(query: string, location?: { latitude: number; longitude: number }): Promise<ScrapedResult[]> {
    try {
      console.log(`[BlinkitScraper] Scraping Blinkit for "${query}"...`);
      let url = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
      if (location && location.latitude && location.longitude) {
        url += `&lat=${location.latitude}&lon=${location.longitude}`;
      }
      
      const fetchAttempt = await fetchHtml(url);
      if (!fetchAttempt.success || !fetchAttempt.data) {
        throw new Error(`Failed to fetch Blinkit data: ${fetchAttempt.error}`);
      }
      
      const $ = cheerio.load(fetchAttempt.data);
      console.log(`[BlinkitScraper] Successfully fetched and parsed Blinkit HTML`);
      
      const productSelectors = [
        'div[data-testid="product-card"]', 
        '[class*="product-card"]', 
        '[class*="plp-product"]',
        '.plp-products > div'
      ];
      
      let productElements: any[] = [];
      
      for (const selector of productSelectors) {
        const elements = $(selector).toArray();
        if (elements.length > 0) {
          console.log(`[BlinkitScraper] Found ${elements.length} Blinkit products with selector: ${selector}`);
          productElements = elements;
          break;
        }
      }
      
      if (productElements.length === 0) {
        console.log('[BlinkitScraper] No products found with specific selectors, trying generic approach');
        const allDivs = $('div').toArray();
        productElements = allDivs.filter(el => {
          const html = $(el).html() || '';
          return (html.includes('price') || html.includes('₹') || html.includes('rs')) && 
                 (html.includes('kg') || html.includes('g') || html.includes('ml') || html.includes('l'));
        });
        console.log(`[BlinkitScraper] Found ${productElements.length} potential Blinkit products with generic approach`);
      }
      
      if (productElements.length === 0) {
        console.log('[BlinkitScraper] No Blinkit products found, returning empty array');
        return [];
      }
      
      const products: ScrapedResult[] = [];
      
      productElements.forEach((el, index) => {
        try {
          const $el = $(el);
          
          let name = '';
          const nameSelectors = ['h3', 'h2', '[class*="name"]', '[class*="title"]'];
          for (const selector of nameSelectors) {
            const text = $el.find(selector).first().text().trim();
            if (text) {
              name = text;
              break;
            }
          }
          
          let price = '';
          const priceSelectors = ['[class*="price"]', '[class*="amount"]'];
          for (const selector of priceSelectors) {
            const text = $el.find(selector).first().text().trim();
            if (text && (text.includes('₹') || text.includes('Rs'))) {
              price = text;
              break;
            }
          }
          
          let unit = '';
          const unitSelectors = ['[class*="weight"]', '[class*="quantity"]', '[class*="unit"]'];
          for (const selector of unitSelectors) {
            const text = $el.find(selector).first().text().trim();
            if (text) {
              unit = text;
              break;
            }
          }
          
          let productUrl = ''; // Renamed to avoid conflict with outer scope 'url'
          const anchor = $el.find('a').first();
          if (anchor.length) {
            const href = anchor.attr('href');
            if (href) {
              productUrl = href.startsWith('http') ? href : `https://blinkit.com${href.startsWith('/') ? '' : '/'}${href}`;
            }
          }
          
          let imageUrl = '';
          const img = $el.find('img').first();
          if (img.length) {
            imageUrl = img.attr('src') || img.attr('data-src') || '';
          }
          
          if (name || price) {
            products.push({
              name: name || `Blinkit Product ${index + 1}`,
              price: price || 'Price not available',
              unit: unit || '',
              url: productUrl || `https://blinkit.com/s/?q=${encodeURIComponent(query)}`,
              imageUrl: imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png',
              source: 'blinkit'
            });
          }
        } catch (err) {
          console.error(`[BlinkitScraper] Error extracting Blinkit product #${index}:`, err);
        }
      });
      
      console.log(`[BlinkitScraper] Successfully extracted ${products.length} Blinkit products`);
      return products;
    } catch (error) {
      this.logError('Blinkit', error);
      return [];
    }
  }

  // Fallback products are no longer part of individual scrapers
  getFallbackProducts(query: string): ScrapedResult[] {
    console.log('[BlinkitScraper] Fallback requested but returning empty array as per backend logic.');
    return [];
  }
}
