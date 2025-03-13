
import { ScrapedResult } from '../types';
import { fetchWithCorsProxy } from '../fetchUtils';

export async function scrapeBlinkitProducts(query: string): Promise<ScrapedResult[]> {
  try {
    const searchUrl = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
    const html = await fetchWithCorsProxy(searchUrl);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const products: ScrapedResult[] = [];
    
    console.log(`Raw HTML from Blinkit length: ${html.length}`);
    
    // Improved product card selectors
    const productCards = Array.from(doc.querySelectorAll(
      'div[data-testid="product-card"], [class*="product-card"], [class*="ProductCard"], [class*="plp-product"], [class*="product-item"], [class*="sku-item"], [class*="product"]'
    ));
    
    console.log(`Found ${productCards.length} Blinkit product cards`);
    
    // If we don't find products with our selectors, create basic placeholder results
    if (productCards.length === 0) {
      // Ensure we at least return the search link
      return [{
        name: `${query} on Blinkit`,
        price: 'Click to view',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png',
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
        
        // Extract price
        const priceElements = card.querySelectorAll('[class*="price"], [class*="Price"]');
        let price = '';
        for (const el of Array.from(priceElements)) {
          const text = el.textContent?.trim();
          if (text && text.length > 0 && (text.includes('₹') || text.includes('Rs') || /\d+/.test(text))) {
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
            productUrl = href.startsWith('http') ? href : `https://blinkit.com${href.startsWith('/') ? '' : '/'}${href}`;
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
        console.error(`Error scraping Blinkit product #${index}:`, err);
      }
    });
    
    console.log(`Successfully scraped ${products.length} Blinkit products`);
    return products.length > 0 ? products : [{
      name: `${query} on Blinkit`,
      price: 'Click to view',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png',
      unit: 'Search result',
      url: searchUrl
    }];
  } catch (error) {
    console.error('Error scraping Blinkit:', error);
    // Return at least one fallback result
    return [{
      name: `${query} on Blinkit`,
      price: 'Click to view',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png',
      unit: 'Search result',
      url: `https://blinkit.com/s/?q=${encodeURIComponent(query)}`
    }];
  }
}
