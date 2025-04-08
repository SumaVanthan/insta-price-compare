
import { ScrapedResult } from '../types';
import { BaseScraper } from './baseScraper';

export class InstamartScraper extends BaseScraper {
  async scrapeProducts(query: string): Promise<ScrapedResult[]> {
    try {
      console.log(`[InstamartScraper] Scraping Instamart for "${query}"...`);
      const url = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
      
      const result = await this.scraperClient.fetch(url);
      if (!result.success || !result.data) {
        throw new Error(`Failed to fetch Instamart data: ${result.error}`);
      }
      
      const $ = result.data;
      console.log(`[InstamartScraper] Successfully fetched Instamart HTML`);
      
      // Selectors for product elements
      const productSelectors = [
        '[class*="ProductCard"]', 
        '[class*="product-card"]', 
        '[class*="ProductDetail"]',
        '.search-items-container > div'
      ];
      
      let productElements: any[] = [];
      
      // Try each selector until we find products
      for (const selector of productSelectors) {
        const elements = $(selector).toArray();
        if (elements.length > 0) {
          console.log(`[InstamartScraper] Found ${elements.length} Instamart products with selector: ${selector}`);
          productElements = elements;
          break;
        }
      }
      
      // If no products found with specific selectors, try a more generic approach
      if (productElements.length === 0) {
        console.log('[InstamartScraper] No products found with specific selectors, trying generic approach');
        const allDivs = $('div').toArray();
        productElements = allDivs.filter(el => {
          const html = $(el).html() || '';
          // Look for divs that likely contain product info
          return (html.includes('price') || html.includes('₹') || html.includes('rs')) && 
                 (html.includes('kg') || html.includes('g') || html.includes('ml') || html.includes('l'));
        });
        console.log(`[InstamartScraper] Found ${productElements.length} potential Instamart products with generic approach`);
      }
      
      if (productElements.length === 0) {
        console.log('[InstamartScraper] No Instamart products found, returning mock data');
        return this.getFallbackProducts(query);
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
              url = href.startsWith('http') ? href : `https://www.swiggy.com${href.startsWith('/') ? '' : '/'}${href}`;
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
              name: name || `Instamart Product ${index + 1}`,
              price: price || 'Price not available',
              unit: unit || '',
              url: url || `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(query)}`,
              imageUrl: imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg',
              source: 'instamart'
            });
          }
        } catch (err) {
          console.error(`[InstamartScraper] Error extracting Instamart product #${index}:`, err);
        }
      });
      
      console.log(`[InstamartScraper] Successfully extracted ${products.length} Instamart products`);
      return products.length > 0 ? products : this.getFallbackProducts(query);
    } catch (error) {
      this.logError('Instamart', error);
      return this.getFallbackProducts(query);
    }
  }
  
  // Implement the abstract method getFallbackProducts
  getFallbackProducts(query: string): ScrapedResult[] {
    console.log('[InstamartScraper] Using mock Instamart products');
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
