
import { ScrapedResult } from '../types';
import { BaseScraper } from './baseScraper';

export class ZeptoScraper extends BaseScraper {
  async scrapeProducts(query: string): Promise<ScrapedResult[]> {
    try {
      console.log(`[ZeptoScraper] Scraping Zepto for "${query}"...`);
      const url = `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`;
      
      const result = await this.scraperClient.fetch(url);
      if (!result.success || !result.data) {
        throw new Error(`Failed to fetch Zepto data: ${result.error}`);
      }
      
      // Check if we got mock data due to network issues
      if (result.error && result.error.includes('mock data')) {
        console.log(`[ZeptoScraper] Received mock data due to network issues`);
        throw new Error('Network error: Unable to fetch real data');
      }
      
      const $ = result.data;
      console.log(`[ZeptoScraper] Successfully fetched Zepto HTML`);
      
      // Selectors for product elements
      const productSelectors = [
        'div[data-testid="product-card"]', 
        '[class*="ProductCard"]', 
        '[class*="product-card"]', 
        '.product-item', 
        '.product-container',
        '.items-container > div'
      ];
      
      let productElements: any[] = [];
      
      // Try each selector until we find products
      for (const selector of productSelectors) {
        const elements = $(selector).toArray();
        if (elements.length > 0) {
          console.log(`[ZeptoScraper] Found ${elements.length} Zepto products with selector: ${selector}`);
          productElements = elements;
          break;
        }
      }
      
      // If no products found with specific selectors, try a more generic approach
      if (productElements.length === 0) {
        console.log('[ZeptoScraper] No products found with specific selectors, trying generic approach');
        const allDivs = $('div').toArray();
        productElements = allDivs.filter(el => {
          const html = $(el).html() || '';
          // Look for divs that likely contain product info
          return (html.includes('price') || html.includes('₹') || html.includes('rs')) && 
                 (html.includes('kg') || html.includes('g') || html.includes('ml') || html.includes('l'));
        });
        console.log(`[ZeptoScraper] Found ${productElements.length} potential Zepto products with generic approach`);
      }
      
      if (productElements.length === 0) {
        console.log('[ZeptoScraper] No Zepto products found');
        return [];
      }
      
      // Extract product information
      const products: ScrapedResult[] = [];
      
      productElements.forEach((el, index) => {
        try {
          const $el = $(el);
          
          // Extract product name
          let name = '';
          const nameSelectors = ['h3', 'h2', '[class*="name"]', '[class*="title"]'];
          for (const selector of nameSelectors) {
            const text = $el.find(selector).first().text().trim();
            if (text) {
              name = text;
              break;
            }
          }
          
          // Extract product price
          let price = '';
          const priceSelectors = ['[class*="price"]', '[class*="amount"]'];
          for (const selector of priceSelectors) {
            const text = $el.find(selector).first().text().trim();
            if (text && (text.includes('₹') || text.includes('Rs'))) {
              price = text;
              break;
            }
          }
          
          // Extract product unit/quantity
          let unit = '';
          const unitSelectors = ['[class*="weight"]', '[class*="quantity"]', '[class*="unit"]'];
          for (const selector of unitSelectors) {
            const text = $el.find(selector).first().text().trim();
            if (text) {
              unit = text;
              break;
            }
          }
          
          // Extract product URL
          let url = '';
          const anchor = $el.find('a').first();
          if (anchor.length) {
            const href = anchor.attr('href');
            if (href) {
              url = href.startsWith('http') ? href : `https://www.zeptonow.com${href.startsWith('/') ? '' : '/'}${href}`;
            }
          }
          
          // Extract image URL
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
              url: url || `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`,
              imageUrl: imageUrl || '',
              source: 'zepto'
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
  
  // Implement the abstract method getFallbackProducts
  getFallbackProducts(query: string): ScrapedResult[] {
    return [];
  }
}
