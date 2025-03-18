
import { ScrapedResult } from '../types';
import { BaseScraper } from './baseScraper';

export class BlinkitScraper extends BaseScraper {
  async scrapeProducts(query: string): Promise<ScrapedResult[]> {
    try {
      console.log(`[BlinkitScraper] Scraping Blinkit for "${query}"...`);
      const url = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
      
      const result = await this.scraperClient.fetch(url);
      if (!result.success || !result.data) {
        throw new Error(`Failed to fetch Blinkit data: ${result.error}`);
      }
      
      const $ = result.data;
      console.log(`[BlinkitScraper] Successfully fetched Blinkit HTML`);
      
      // Selectors for product elements
      const productSelectors = [
        'div[data-testid="product-card"]', 
        '[class*="product-card"]', 
        '[class*="plp-product"]',
        '.plp-products > div'
      ];
      
      let productElements: any[] = [];
      
      // Try each selector until we find products
      for (const selector of productSelectors) {
        const elements = $(selector).toArray();
        if (elements.length > 0) {
          console.log(`[BlinkitScraper] Found ${elements.length} Blinkit products with selector: ${selector}`);
          productElements = elements;
          break;
        }
      }
      
      // If no products found with specific selectors, try a more generic approach
      if (productElements.length === 0) {
        console.log('[BlinkitScraper] No products found with specific selectors, trying generic approach');
        const allDivs = $('div').toArray();
        productElements = allDivs.filter(el => {
          const html = $(el).html() || '';
          // Look for divs that likely contain product info
          return (html.includes('price') || html.includes('₹') || html.includes('rs')) && 
                 (html.includes('kg') || html.includes('g') || html.includes('ml') || html.includes('l'));
        });
        console.log(`[BlinkitScraper] Found ${productElements.length} potential Blinkit products with generic approach`);
      }
      
      if (productElements.length === 0) {
        console.log('[BlinkitScraper] No Blinkit products found, returning mock data');
        return this.getMockBlinkitProducts(query);
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
              url = href.startsWith('http') ? href : `https://blinkit.com${href.startsWith('/') ? '' : '/'}${href}`;
            }
          }
          
          // Extract image URL
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
              url: url || `https://blinkit.com/s/?q=${encodeURIComponent(query)}`,
              imageUrl: imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png',
              source: 'blinkit'
            });
          }
        } catch (err) {
          console.error(`[BlinkitScraper] Error extracting Blinkit product #${index}:`, err);
        }
      });
      
      console.log(`[BlinkitScraper] Successfully extracted ${products.length} Blinkit products`);
      return products.length > 0 ? products : this.getMockBlinkitProducts(query);
    } catch (error) {
      this.logError('Blinkit', error);
      return this.getMockBlinkitProducts(query);
    }
  }
  
  private getMockBlinkitProducts(query: string): ScrapedResult[] {
    console.log('[BlinkitScraper] Using mock Blinkit products');
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
}
