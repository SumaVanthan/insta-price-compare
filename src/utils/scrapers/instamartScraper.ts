
import { ScrapedResult } from '../types';
import { fetchWithCorsProxy } from '../fetchUtils';

export async function scrapeInstamartProducts(query: string): Promise<ScrapedResult[]> {
  try {
    const searchUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
    const html = await fetchWithCorsProxy(searchUrl);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const products: ScrapedResult[] = [];
    
    console.log(`Raw HTML from Instamart length: ${html.length}`);
    
    // Improved product card selectors
    const productCards = Array.from(doc.querySelectorAll(
      '[class*="ProductCard"], [class*="product-card"], [class*="ProductDetail"], [class*="product-detail"], [class*="product-item"], [class*="item"], div[data-testid*="product"], div[data-testid*="item"]'
    ));
    
    console.log(`Found ${productCards.length} Instamart product cards`);
    
    // If we don't find products with our selectors, create basic placeholder results
    if (productCards.length === 0) {
      // Ensure we at least return the search link
      return [{
        name: `${query} on Instamart`,
        price: 'Click to view',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg',
        unit: 'Search result',
        url: searchUrl
      }];
    }
    
    productCards.forEach((card, index) => {
      try {
        // More flexible image extraction
        const allImages = card.querySelectorAll('img');
        let imageUrl = '';
        for (const img of Array.from(allImages)) {
          const src = img.getAttribute('src') || '';
          const dataSrc = img.getAttribute('data-src') || '';
          if (src && !src.includes('data:image') && src.includes('http')) {
            imageUrl = src;
            break;
          } else if (dataSrc && dataSrc.includes('http')) {
            imageUrl = dataSrc;
            break;
          }
        }
        
        // Extract name - try multiple selectors
        const nameElements = card.querySelectorAll('h3, h2, [class*="name"], [class*="title"], [class*="Name"], [class*="Title"]');
        let name = '';
        for (const el of Array.from(nameElements)) {
          const text = el.textContent?.trim();
          if (text && text.length > 2) {
            name = text;
            break;
          }
        }
        
        // Extract quantity/unit
        const quantityElements = card.querySelectorAll('[class*="weight"], [class*="unit"], [class*="quantity"], [class*="Unit"], [class*="Quantity"]');
        let unit = '';
        for (const el of Array.from(quantityElements)) {
          const text = el.textContent?.trim();
          if (text && text.length > 0) {
            unit = text;
            break;
          }
        }
        
        // Extract price with various selectors
        const priceElements = card.querySelectorAll('[class*="price"], [class*="Price"], [aria-label*="rupees"], [aria-label*="Rupees"]');
        let price = '';
        for (const el of Array.from(priceElements)) {
          const ariaLabel = el.getAttribute('aria-label');
          const text = el.textContent?.trim();
          if (ariaLabel && (ariaLabel.includes('rupees') || ariaLabel.includes('Rupees'))) {
            price = ariaLabel;
            break;
          } else if (text && text.length > 0 && (text.includes('₹') || text.includes('Rs') || /\d+/.test(text))) {
            price = text;
            break;
          }
        }
        
        // Extract product URL
        const links = card.querySelectorAll('a');
        let productUrl = searchUrl;
        for (const link of Array.from(links)) {
          const href = link.getAttribute('href');
          if (href && href.length > 1) {
            productUrl = href.startsWith('http') ? href : `https://www.swiggy.com${href.startsWith('/') ? '' : '/'}${href}`;
            break;
          }
        }
        
        if (name || price) {
          // Even if we only have partial data, include it
          products.push({
            name: name || `${query} product ${index + 1}`,
            price: price || 'Click to view price',
            imageUrl,
            unit,
            url: productUrl
          });
        }
      } catch (err) {
        console.error(`Error scraping Instamart product #${index}:`, err);
      }
    });
    
    console.log(`Successfully scraped ${products.length} Instamart products`);
    return products.length > 0 ? products : [{
      name: `${query} on Instamart`,
      price: 'Click to view',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg',
      unit: 'Search result',
      url: searchUrl
    }];
  } catch (error) {
    console.error('Error scraping Instamart:', error);
    // Return at least one fallback result
    return [{
      name: `${query} on Instamart`,
      price: 'Click to view',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg',
      unit: 'Search result',
      url: `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`
    }];
  }
}
