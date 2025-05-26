// backend/src/scrapers/instamartScraper.ts
import { ScrapedResult } from '../types';
import { BaseScraper } from './baseScraper';
import { fetchHtml } from '../utils/httpClient';
import * as cheerio from 'cheerio';

export class InstamartScraper extends BaseScraper {
  constructor() {
    super(); // Call base constructor
  }

  async scrapeProducts(query: string, location?: { latitude: number; longitude: number }): Promise<ScrapedResult[]> {
    try {
      console.log(`[InstamartScraper] Scraping Instamart for "${query}"...`);
      let url = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
      if (location && location.latitude && location.longitude) {
        url += `&lat=${location.latitude}&lon=${location.longitude}`;
      }
      
      const fetchAttempt = await fetchHtml(url);
      if (!fetchAttempt.success || !fetchAttempt.data) {
        throw new Error(`Failed to fetch Instamart data: ${fetchAttempt.error}`);
      }
      
      const $ = cheerio.load(fetchAttempt.data);
      console.log(`[InstamartScraper] Successfully fetched and parsed Instamart HTML`);
      
      const productSelectors = [
        '[class*="ProductCard"]', 
        '[class*="product-card"]', 
        '[class*="ProductDetail"]',
        '.search-items-container > div'
      ];
      
      let productElements: any[] = [];
      
      for (const selector of productSelectors) {
        const elements = $(selector).toArray();
        if (elements.length > 0) {
          console.log(`[InstamartScraper] Found ${elements.length} Instamart products with selector: ${selector}`);
          productElements = elements;
          break;
        }
      }
      
      if (productElements.length === 0) {
        console.log('[InstamartScraper] No products found with specific selectors, trying generic approach');
        const allDivs = $('div').toArray();
        productElements = allDivs.filter(el => {
          const html = $(el).html() || '';
          return (html.includes('price') || html.includes('₹') || html.includes('rs')) && 
                 (html.includes('kg') || html.includes('g') || html.includes('ml') || html.includes('l'));
        });
        console.log(`[InstamartScraper] Found ${productElements.length} potential Instamart products with generic approach`);
      }
      
      if (productElements.length === 0) {
        console.log('[InstamartScraper] No Instamart products found, returning empty array');
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
              productUrl = href.startsWith('http') ? href : `https://www.swiggy.com${href.startsWith('/') ? '' : '/'}${href}`;
            }
          }
          
          let imageUrl = '';
          const img = $el.find('img').first();
          if (img.length) {
            imageUrl = img.attr('src') || img.attr('data-src') || '';
          }
          
          if (name || price) {
            products.push({
              name: name || `Instamart Product ${index + 1}`,
              price: price || 'Price not available',
              unit: unit || '',
              url: productUrl || `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(query)}`,
              imageUrl: imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg',
              source: 'instamart'
            });
          }
        } catch (err) {
          console.error(`[InstamartScraper] Error extracting Instamart product #${index}:`, err);
        }
      });
      
      console.log(`[InstamartScraper] Successfully extracted ${products.length} Instamart products`);
      return products;
    } catch (error) {
      this.logError('Instamart', error);
      return [];
    }
  }

  getFallbackProducts(query: string): ScrapedResult[] {
    console.log('[InstamartScraper] Fallback requested but returning empty array as per backend logic.');
    return [];
  }
}
