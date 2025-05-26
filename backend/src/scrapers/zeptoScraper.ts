// backend/src/scrapers/zeptoScraper.ts
import { ScrapedResult } from '../types';
import { BaseScraper } from './baseScraper';
import { fetchHtml } from '../utils/httpClient';
import * as cheerio from 'cheerio';

export class ZeptoScraper extends BaseScraper {
  constructor() {
    super(); // Call base constructor
  }

  async scrapeProducts(query: string, location?: { latitude: number; longitude: number }): Promise<ScrapedResult[]> {
    try {
      console.log(`[ZeptoScraper] Scraping Zepto for "${query}"...`);
      let url = `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`;
      if (location && location.latitude && location.longitude) {
        url += `&lat=${location.latitude}&lon=${location.longitude}`;
      }
      
      const fetchAttempt = await fetchHtml(url);
      if (!fetchAttempt.success || !fetchAttempt.data) {
        throw new Error(`Failed to fetch Zepto data: ${fetchAttempt.error}`);
      }
      
      const $ = cheerio.load(fetchAttempt.data);
      console.log(`[ZeptoScraper] Successfully fetched and parsed Zepto HTML`);
      
      let searchInfo = '';
      try {
        const searchInfoSelectors = [
          '.search-info', 
          '.search-term', 
          '[class*="SearchInfo"]',
          '.search-results-header'
        ];
        for (const selector of searchInfoSelectors) {
          const text = $(selector).first().text().trim();
          if (text) {
            searchInfo = text;
            break;
          }
        }
        if (!searchInfo) {
          const title = $('title').text().trim();
          if (title.includes(query)) {
            searchInfo = `Search for "${query}" on Zepto`;
          }
        }
        if (!searchInfo) {
          searchInfo = `Showing results for "${query}" on Zepto`;
        }
        console.log(`[ZeptoScraper] Search info: ${searchInfo}`);
      } catch (err) {
        console.error('[ZeptoScraper] Error extracting search info:', err);
        searchInfo = `Searched for "${query}" on Zepto`;
      }
      
      const productSelectors = [
        'div[data-testid="product-card"]', 
        '[class*="ProductCard"]', 
        '[class*="product-card"]', 
        '.product-item', 
        '.product-container',
        '.items-container > div'
      ];
      
      let productElements: any[] = [];
      
      for (const selector of productSelectors) {
        const elements = $(selector).toArray();
        if (elements.length > 0) {
          console.log(`[ZeptoScraper] Found ${elements.length} Zepto products with selector: ${selector}`);
          productElements = elements;
          break;
        }
      }
      
      if (productElements.length === 0) {
        console.log('[ZeptoScraper] No products found with specific selectors, trying generic approach');
        const allDivs = $('div').toArray();
        productElements = allDivs.filter(el => {
          const html = $(el).html() || '';
          return (html.includes('price') || html.includes('₹') || html.includes('rs')) && 
                 (html.includes('kg') || html.includes('g') || html.includes('ml') || html.includes('l'));
        });
        console.log(`[ZeptoScraper] Found ${productElements.length} potential Zepto products with generic approach`);
      }
      
      if (productElements.length === 0) {
        console.log('[ZeptoScraper] No Zepto products found');
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
          
          let productUrl = ''; // Renamed
          const anchor = $el.find('a').first();
          if (anchor.length) {
            const href = anchor.attr('href');
            if (href) {
              productUrl = href.startsWith('http') ? href : `https://www.zeptonow.com${href.startsWith('/') ? '' : '/'}${href}`;
            }
          }
          
          let imageUrl = '';
          const img = $el.find('img').first();
          if (img.length) {
            imageUrl = img.attr('src') || img.attr('data-src') || '';
          }
          
          if (name && price) {
            products.push({
              name: name,
              price: price,
              unit: unit || '',
              url: productUrl || `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`,
              imageUrl: imageUrl || '',
              source: 'zepto',
              searchQuery: query,
              searchInfo: searchInfo
            });
          }
        } catch (err) {
          console.error(`[ZeptoScraper] Error extracting Zepto product #${index}:`, err);
        }
      });
      
      console.log(`[ZeptoScraper] Successfully extracted ${products.length} Zepto products`);
      return products;
    } catch (error) {
      this.logError('Zepto', error);
      return [];
    }
  }

  getFallbackProducts(query: string): ScrapedResult[] {
    console.log('[ZeptoScraper] Fallback requested but returning empty array as per backend logic.');
    return [];
  }
}
