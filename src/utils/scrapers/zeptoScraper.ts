
import { ScrapedResult } from '../types';
import { fetchWithCorsProxy } from '../fetchUtils';

export async function scrapeZeptoProducts(query: string): Promise<ScrapedResult[]> {
  try {
    const searchUrl = `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`;
    const html = await fetchWithCorsProxy(searchUrl);
    
    // Create a temporary DOM element to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const products: ScrapedResult[] = [];
    
    // Improved selector to find more product cards
    const productCards = Array.from(
      doc.querySelectorAll('div[data-testid="product-card"], [class*="ProductCard"], [class*="product-card"], .product-item, .product-container, .ProductCard')
    );
    
    console.log(`Raw HTML from Zepto length: ${html.length}`);
    console.log(`Found ${productCards.length} Zepto product cards`);
    
    // If we don't find products with our selectors, create basic placeholder results
    if (productCards.length === 0) {
      // Ensure we at least return the search link
      return [{
        name: `${query} on Zepto`,
        price: 'Click to view',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png',
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
          const srcset = img.getAttribute('srcset') || '';
          if (src && !src.includes('data:image') && src.includes('http')) {
            imageUrl = src;
            break;
          } else if (srcset) {
            const firstSrc = srcset.split(' ')[0];
            if (firstSrc && firstSrc.includes('http')) {
              imageUrl = firstSrc;
              break;
            }
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
            productUrl = href.startsWith('http') ? href : `https://www.zeptonow.com${href.startsWith('/') ? '' : '/'}${href}`;
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
        console.error(`Error scraping Zepto product #${index}:`, err);
      }
    });
    
    console.log(`Successfully scraped ${products.length} Zepto products`);
    return products.length > 0 ? products : [{
      name: `${query} on Zepto`,
      price: 'Click to view',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png',
      unit: 'Search result',
      url: searchUrl
    }];
  } catch (error) {
    console.error('Error scraping Zepto:', error);
    // Return at least one fallback result
    return [{
      name: `${query} on Zepto`,
      price: 'Click to view',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png',
      unit: 'Search result',
      url: `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`
    }];
  }
}
