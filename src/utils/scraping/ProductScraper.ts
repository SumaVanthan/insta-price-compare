import { ScrapedResult } from '../types';
import { ScraperClient } from './ScraperClient';
import cheerio from 'cheerio';

export class ProductScraper {
  private client: ScraperClient;
  
  constructor(timeout: number = 8000) {
    this.client = new ScraperClient(timeout);
  }
  
  async scrapeZeptoProducts(query: string): Promise<ScrapedResult[]> {
    const searchUrl = `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`;
    const result = await this.client.fetch(searchUrl);
    
    if (!result.success) {
      console.error(`Failed to scrape Zepto: ${result.error}`);
      return this.getMockZeptoProducts(query);
    }
    
    try {
      const html = result.data;
      const $ = cheerio.load(html);
      const products: ScrapedResult[] = [];
      
      // Multiple selectors for product cards
      const productSelectors = [
        'div[data-testid="product-card"]', 
        '[class*="ProductCard"]', 
        '[class*="product-card"]',
        '.items-container > div'
      ];
      
      let productElements: cheerio.Element[] = [];
      
      // Try each selector until we find products
      for (const selector of productSelectors) {
        productElements = $(selector).toArray();
        if (productElements.length > 0) {
          console.log(`Found ${productElements.length} Zepto products with selector: ${selector}`);
          break;
        }
      }
      
      if (productElements.length === 0) {
        console.log('No Zepto products found, using mock data');
        return this.getMockZeptoProducts(query);
      }
      
      // Extract product data using cheerio
      productElements.forEach((element, index) => {
        try {
          const $el = $(element);
          
          // Extract image
          let imageUrl = '';
          const img = $el.find('img').first();
          imageUrl = img.attr('src') || img.attr('data-src') || '';
          
          if (!imageUrl || imageUrl.includes('data:image')) {
            imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png';
          }
          
          // Extract name
          const name = $el.find('h3, h2, [class*="name"], [class*="title"]').first().text().trim() 
            || `Product ${index + 1}`;
          
          // Extract price
          let price = '';
          const priceElement = $el.find('[class*="price"], [class*="Price"]').first();
          price = priceElement.text().trim() || 'Price not available';
          
          // Extract unit
          let unit = '';
          const unitElement = $el.find('[class*="weight"], [class*="unit"], [class*="quantity"]').first();
          unit = unitElement.text().trim() || '';
          
          // Extract URL
          let url = '';
          const linkElement = $el.find('a').first();
          url = linkElement.attr('href') || '';
          
          if (url && !url.startsWith('http')) {
            url = `https://www.zeptonow.com${url.startsWith('/') ? '' : '/'}${url}`;
          } else if (!url) {
            url = searchUrl;
          }
          
          products.push({
            name,
            price,
            imageUrl,
            unit,
            url
          });
        } catch (err) {
          console.error(`Error extracting Zepto product data:`, err);
        }
      });
      
      return products.length > 0 ? products : this.getMockZeptoProducts(query);
    } catch (error) {
      console.error('Error parsing Zepto HTML:', error);
      return this.getMockZeptoProducts(query);
    }
  }
  
  async scrapeBlinkitProducts(query: string): Promise<ScrapedResult[]> {
    const searchUrl = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
    const result = await this.client.fetch(searchUrl);
    
    if (!result.success) {
      console.error(`Failed to scrape Blinkit: ${result.error}`);
      return this.getMockBlinkitProducts(query);
    }
    
    try {
      const html = result.data;
      const $ = cheerio.load(html);
      const products: ScrapedResult[] = [];
      
      // Multiple selectors for product cards
      const productSelectors = [
        'div[data-testid="product-card"]', 
        '[class*="product-card"]', 
        '[class*="ProductCard"]',
        '.plp-products > div'
      ];
      
      let productElements: cheerio.Element[] = [];
      
      // Try each selector until we find products
      for (const selector of productSelectors) {
        productElements = $(selector).toArray();
        if (productElements.length > 0) {
          console.log(`Found ${productElements.length} Blinkit products with selector: ${selector}`);
          break;
        }
      }
      
      if (productElements.length === 0) {
        console.log('No Blinkit products found, using mock data');
        return this.getMockBlinkitProducts(query);
      }
      
      // Extract product data using cheerio
      productElements.forEach((element, index) => {
        try {
          const $el = $(element);
          
          // Extract image
          let imageUrl = '';
          const img = $el.find('img').first();
          imageUrl = img.attr('src') || img.attr('data-src') || '';
          
          if (!imageUrl || imageUrl.includes('data:image')) {
            imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png';
          }
          
          // Extract name
          const name = $el.find('h3, h2, [class*="name"], [class*="title"]').first().text().trim() 
            || `Product ${index + 1}`;
          
          // Extract price
          let price = '';
          const priceElement = $el.find('[class*="price"], [class*="Price"]').first();
          price = priceElement.text().trim() || 'Price not available';
          
          // Extract unit
          let unit = '';
          const unitElement = $el.find('[class*="weight"], [class*="unit"], [class*="quantity"]').first();
          unit = unitElement.text().trim() || '';
          
          // Extract URL
          let url = '';
          const linkElement = $el.find('a').first();
          url = linkElement.attr('href') || '';
          
          if (url && !url.startsWith('http')) {
            url = `https://blinkit.com${url.startsWith('/') ? '' : '/'}${url}`;
          } else if (!url) {
            url = searchUrl;
          }
          
          products.push({
            name,
            price,
            imageUrl,
            unit,
            url
          });
        } catch (err) {
          console.error(`Error extracting Blinkit product data:`, err);
        }
      });
      
      return products.length > 0 ? products : this.getMockBlinkitProducts(query);
    } catch (error) {
      console.error('Error parsing Blinkit HTML:', error);
      return this.getMockBlinkitProducts(query);
    }
  }
  
  async scrapeInstamartProducts(query: string): Promise<ScrapedResult[]> {
    const searchUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
    const result = await this.client.fetch(searchUrl);
    
    if (!result.success) {
      console.error(`Failed to scrape Instamart: ${result.error}`);
      return this.getMockInstamartProducts(query);
    }
    
    try {
      const html = result.data;
      const $ = cheerio.load(html);
      const products: ScrapedResult[] = [];
      
      // Multiple selectors for product cards
      const productSelectors = [
        '[class*="ProductCard"]', 
        '[class*="product-card"]', 
        '[class*="ProductDetail"]',
        '.search-items-container > div'
      ];
      
      let productElements: cheerio.Element[] = [];
      
      // Try each selector until we find products
      for (const selector of productSelectors) {
        productElements = $(selector).toArray();
        if (productElements.length > 0) {
          console.log(`Found ${productElements.length} Instamart products with selector: ${selector}`);
          break;
        }
      }
      
      if (productElements.length === 0) {
        console.log('No Instamart products found, using mock data');
        return this.getMockInstamartProducts(query);
      }
      
      // Extract product data using cheerio
      productElements.forEach((element, index) => {
        try {
          const $el = $(element);
          
          // Extract image
          let imageUrl = '';
          const img = $el.find('img').first();
          imageUrl = img.attr('src') || img.attr('data-src') || '';
          
          if (!imageUrl || imageUrl.includes('data:image')) {
            imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg';
          }
          
          // Extract name
          const name = $el.find('h3, h2, [class*="name"], [class*="title"]').first().text().trim() 
            || `Product ${index + 1}`;
          
          // Extract price
          let price = '';
          const priceElement = $el.find('[class*="price"], [class*="Price"]').first();
          price = priceElement.text().trim() || 'Price not available';
          
          // Extract unit
          let unit = '';
          const unitElement = $el.find('[class*="weight"], [class*="unit"], [class*="quantity"]').first();
          unit = unitElement.text().trim() || '';
          
          // Extract URL
          let url = '';
          const linkElement = $el.find('a').first();
          url = linkElement.attr('href') || '';
          
          if (url && !url.startsWith('http')) {
            url = `https://www.swiggy.com${url.startsWith('/') ? '' : '/'}${url}`;
          } else if (!url) {
            url = searchUrl;
          }
          
          products.push({
            name,
            price,
            imageUrl,
            unit,
            url
          });
        } catch (err) {
          console.error(`Error extracting Instamart product data:`, err);
        }
      });
      
      return products.length > 0 ? products : this.getMockInstamartProducts(query);
    } catch (error) {
      console.error('Error parsing Instamart HTML:', error);
      return this.getMockInstamartProducts(query);
    }
  }
  
  // Mock data methods
  private getMockZeptoProducts(query: string): ScrapedResult[] {
    console.log('Using mock Zepto products');
    return [
      {
        name: "Daawat Hyderabadi Biryani Kit (Biryani Kit)",
        price: "₹140",
        imageUrl: "https://cdn.zeptonow.com/production/_next/static/images/products/placeholder.png",
        unit: "334 g",
        url: `https://www.zeptonow.com/product/daawat-hyderabadi-biryani-kit`
      },
      {
        name: "VKR Sivaji Premium (Medium Grain) Boiled Ponni Rice 5 kg",
        price: "₹398",
        imageUrl: "https://cdn.zeptonow.com/production/_next/static/images/products/placeholder.png",
        unit: "5 kg",
        url: `https://www.zeptonow.com/product/vkr-sivaji-premium-medium-grain-boiled-ponni-rice-5-kg`
      },
      {
        name: "Udhaiyam (Medium Grain) Idli Rice (Idli Arisi)",
        price: "₹294",
        imageUrl: "https://cdn.zeptonow.com/production/_next/static/images/products/placeholder.png",
        unit: "5 kg",
        url: `https://www.zeptonow.com/product/udhaiyam-medium-grain-idli-rice-idli-arisi`
      },
      {
        name: "India Gate Classic Basmati Rice (Basmati)",
        price: "₹232",
        imageUrl: "https://cdn.zeptonow.com/production/_next/static/images/products/placeholder.png",
        unit: "1 kg",
        url: `https://www.zeptonow.com/product/india-gate-classic-basmati-rice-basmati`
      },
      {
        name: "India Gate Everyday Basmati Rice (Basmati)",
        price: "₹376",
        imageUrl: "https://cdn.zeptonow.com/production/_next/static/images/products/placeholder.png",
        unit: "5 kg",
        url: `https://www.zeptonow.com/product/india-gate-everyday-basmati-rice-basmati`
      },
      {
        name: "India Gate (Short Grain) Jeera Rice (Jeeragasamba Rice)",
        price: "₹148",
        imageUrl: "https://cdn.zeptonow.com/production/_next/static/images/products/placeholder.png",
        unit: "1 kg",
        url: `https://www.zeptonow.com/product/india-gate-short-grain-jeera-rice-jeeragasamba-rice`
      }
    ];
  }
  
  private getMockBlinkitProducts(query: string): ScrapedResult[] {
    console.log('Using mock Blinkit products');
    return [
      {
        name: "Daawat Rozana Basmati Rice Gold | Medium Grain",
        price: "₹423",
        imageUrl: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=225/app/images/products/sliding_image/3/423.jpg",
        unit: "5 kg",
        url: `https://blinkit.com/prn/daawat-rozana-basmati-rice-gold-medium-grain/prid/423`
      },
      {
        name: "India Gate All Rounder Feast Rozzana Basmati Rice",
        price: "₹110",
        imageUrl: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=225/app/images/products/sliding_image/110110/110.jpg",
        unit: "1 kg",
        url: `https://blinkit.com/prn/india-gate-all-rounder-feast-rozzana-basmati-rice/prid/110110`
      },
      {
        name: "Udhaiyam Ponni Rice 5 Kgs, Goldwinner Refined Sunflower Oil 1 Ltr, Udhaiyam Urad Dal 1 Kg",
        price: "₹1186",
        imageUrl: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=225/app/images/products/sliding_image/1186/1186.jpg",
        unit: "3 Combo",
        url: `https://blinkit.com/prn/udhaiyam-ponni-rice-5-kgs-goldwinner-refined-sunflower-oil-1-ltr-udhaiyam-urad-dal-1-kg/prid/1186`
      },
      {
        name: "Smart One Ponni Steam Rice",
        price: "₹499",
        imageUrl: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=225/app/images/products/sliding_image/499/499.jpg",
        unit: "10 kg",
        url: `https://blinkit.com/prn/smart-one-ponni-steam-rice/prid/499`
      },
      {
        name: "Smart One Kurnool Sona Masoori Raw Rice",
        price: "₹1544",
        imageUrl: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=225/app/images/products/sliding_image/1544/1544.jpg",
        unit: "26 kg",
        url: `https://blinkit.com/prn/smart-one-kurnool-sona-masoori-raw-rice/prid/1544`
      },
      {
        name: "Popular Essentials Idli Rice",
        price: "₹373",
        imageUrl: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=225/app/images/products/sliding_image/373/373.jpg",
        unit: "5 kg",
        url: `https://blinkit.com/prn/popular-essentials-idli-rice/prid/373`
      }
    ];
  }
  
  private getMockInstamartProducts(query: string): ScrapedResult[] {
    console.log('Using mock Instamart products');
    return [
      {
        name: "Daawat Basmati Rice - Super",
        price: "₹159",
        imageUrl: "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1000/f5f68bbafa8f14fdbe85f7bfc0030e8b",
        unit: "1 kg",
        url: `https://www.swiggy.com/instamart/product/daawat-basmati-rice-super`
      },
      {
        name: "Sivaji Vkr Boiled Rice",
        price: "₹1819",
        imageUrl: "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1000/d5f68bbafa8f14fdbe85f7bfc0030e8b",
        unit: "25 kg",
        url: `https://www.swiggy.com/instamart/product/sivaji-vkr-boiled-rice`
      },
      {
        name: "Supreme Harvest Ponni Raw Rice",
        price: "₹66",
        imageUrl: "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1000/c5f68bbafa8f14fdbe85f7bfc0030e8b",
        unit: "1 kg",
        url: `https://www.swiggy.com/instamart/product/supreme-harvest-ponni-raw-rice`
      },
      {
        name: "Daawat Basmati Rice - Pulav",
        price: "₹139",
        imageUrl: "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1000/b5f68bbafa8f14fdbe85f7bfc0030e8b",
        unit: "1 kg",
        url: `https://www.swiggy.com/instamart/product/daawat-basmati-rice-pulav`
      },
      {
        name: "Fortune Everyday Basmati Rice",
        price: "₹125",
        imageUrl: "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1000/a5f68bbafa8f14fdbe85f7bfc0030e8b",
        unit: "1 kg",
        url: `https://www.swiggy.com/instamart/product/fortune-everyday-basmati-rice`
      },
      {
        name: "India Gate Classic Basmati Rice",
        price: "₹232",
        imageUrl: "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1000/e5f68bbafa8f14fdbe85f7bfc0030e8b",
        unit: "1 kg",
        url: `https://www.swiggy.com/instamart/product/india-gate-classic-basmati-rice`
      }
    ];
  }
}
