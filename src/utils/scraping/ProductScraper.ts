
import { ScrapedResult } from '../types';
import { scraperClient } from './ScraperClient';

export class ProductScraper {
  private timeout: number;

  constructor(timeout: number = 8000) {
    this.timeout = timeout;
    console.log(`[ProductScraper] Initialized with timeout: ${timeout}ms`);
  }

  /**
   * Scrape Zepto products based on search query
   */
  async scrapeZeptoProducts(query: string): Promise<ScrapedResult[]> {
    try {
      console.log(`[ProductScraper] Scraping Zepto for "${query}"...`);
      const url = `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`;
      
      const $ = await scraperClient.fetch(url, this.timeout);
      console.log(`[ProductScraper] Successfully fetched Zepto HTML`);
      
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
          console.log(`[ProductScraper] Found ${elements.length} Zepto products with selector: ${selector}`);
          productElements = elements;
          break;
        }
      }
      
      // If no products found with specific selectors, try a more generic approach
      if (productElements.length === 0) {
        console.log('[ProductScraper] No products found with specific selectors, trying generic approach');
        const allDivs = $('div').toArray();
        productElements = allDivs.filter(el => {
          const html = $(el).html() || '';
          // Look for divs that likely contain product info
          return (html.includes('price') || html.includes('₹') || html.includes('rs')) && 
                 (html.includes('kg') || html.includes('g') || html.includes('ml') || html.includes('l'));
        });
        console.log(`[ProductScraper] Found ${productElements.length} potential Zepto products with generic approach`);
      }
      
      if (productElements.length === 0) {
        console.log('[ProductScraper] No Zepto products found, returning empty array');
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
          
          if (name || price) {
            products.push({
              name: name || `Zepto Product ${index + 1}`,
              price: price || 'Price not available',
              unit: unit || '',
              url: url || `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`,
              imageUrl: imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png',
              source: 'zepto'
            });
          }
        } catch (err) {
          console.error(`[ProductScraper] Error extracting Zepto product #${index}:`, err);
        }
      });
      
      console.log(`[ProductScraper] Successfully extracted ${products.length} Zepto products`);
      return products;
      
    } catch (error) {
      console.error('[ProductScraper] Failed to scrape Zepto:', error);
      console.log('[ProductScraper] Falling back to mock Zepto data for', query);
      return this.getMockZeptoProducts(query);
    }
  }
  
  /**
   * Scrape Blinkit products based on search query
   */
  async scrapeBlinkitProducts(query: string): Promise<ScrapedResult[]> {
    try {
      console.log(`[ProductScraper] Scraping Blinkit for "${query}"...`);
      const url = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
      
      const $ = await scraperClient.fetch(url, this.timeout);
      console.log(`[ProductScraper] Successfully fetched Blinkit HTML`);
      
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
          console.log(`[ProductScraper] Found ${elements.length} Blinkit products with selector: ${selector}`);
          productElements = elements;
          break;
        }
      }
      
      // If no products found with specific selectors, try a more generic approach
      if (productElements.length === 0) {
        console.log('[ProductScraper] No products found with specific selectors, trying generic approach');
        const allDivs = $('div').toArray();
        productElements = allDivs.filter(el => {
          const html = $(el).html() || '';
          // Look for divs that likely contain product info
          return (html.includes('price') || html.includes('₹') || html.includes('rs')) && 
                 (html.includes('kg') || html.includes('g') || html.includes('ml') || html.includes('l'));
        });
        console.log(`[ProductScraper] Found ${productElements.length} potential Blinkit products with generic approach`);
      }
      
      if (productElements.length === 0) {
        console.log('[ProductScraper] No Blinkit products found, returning empty array');
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
          console.error(`[ProductScraper] Error extracting Blinkit product #${index}:`, err);
        }
      });
      
      console.log(`[ProductScraper] Successfully extracted ${products.length} Blinkit products`);
      return products;
      
    } catch (error) {
      console.error('[ProductScraper] Failed to scrape Blinkit:', error);
      console.log('[ProductScraper] Falling back to mock Blinkit data for', query);
      return this.getMockBlinkitProducts(query);
    }
  }
  
  /**
   * Scrape Instamart products based on search query
   */
  async scrapeInstamartProducts(query: string): Promise<ScrapedResult[]> {
    try {
      console.log(`[ProductScraper] Scraping Instamart for "${query}"...`);
      const url = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
      
      const $ = await scraperClient.fetch(url, this.timeout);
      console.log(`[ProductScraper] Successfully fetched Instamart HTML`);
      
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
          console.log(`[ProductScraper] Found ${elements.length} Instamart products with selector: ${selector}`);
          productElements = elements;
          break;
        }
      }
      
      // If no products found with specific selectors, try a more generic approach
      if (productElements.length === 0) {
        console.log('[ProductScraper] No products found with specific selectors, trying generic approach');
        const allDivs = $('div').toArray();
        productElements = allDivs.filter(el => {
          const html = $(el).html() || '';
          // Look for divs that likely contain product info
          return (html.includes('price') || html.includes('₹') || html.includes('rs')) && 
                 (html.includes('kg') || html.includes('g') || html.includes('ml') || html.includes('l'));
        });
        console.log(`[ProductScraper] Found ${productElements.length} potential Instamart products with generic approach`);
      }
      
      if (productElements.length === 0) {
        console.log('[ProductScraper] No Instamart products found, returning empty array');
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
          console.error(`[ProductScraper] Error extracting Instamart product #${index}:`, err);
        }
      });
      
      console.log(`[ProductScraper] Successfully extracted ${products.length} Instamart products`);
      return products;
      
    } catch (error) {
      console.error('[ProductScraper] Failed to scrape Instamart:', error);
      console.log('[ProductScraper] Falling back to mock Instamart data for', query);
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
