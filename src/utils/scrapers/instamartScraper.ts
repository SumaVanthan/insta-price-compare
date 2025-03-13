
import { ScrapedResult } from '../types';
import { fetchWithCorsProxy } from '../fetchUtils';

export async function scrapeInstamartProducts(query: string): Promise<ScrapedResult[]> {
  try {
    const searchUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
    const html = await fetchWithCorsProxy(searchUrl);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const products: ScrapedResult[] = [];
    
    // Find product containers - expanded selectors to capture all product types
    const productCards = Array.from(doc.querySelectorAll(
      '.sc-dcJsrY, .product-card, .product-item, [class*="ProductCard"], [class*="product-container"]'
    ));
    
    console.log(`Found ${productCards.length} Instamart product cards`);
    
    productCards.forEach((card, index) => {
      try {
        // Extract image - expanded selectors
        const imageElement = card.querySelector(
          '.sc-dcJsrY.ibghhT._1NxA5 img, img[class*="product-image"], img[loading="lazy"], img[data-testid*="product"]'
        );
        let imageUrl = '';
        if (imageElement) {
          imageUrl = imageElement.getAttribute('src') || imageElement.getAttribute('data-src') || '';
        }
        
        // Extract name - expanded selectors
        const nameElement = card.querySelector(
          '.sc-aXZVg.kyEzVU._1sPB0, [class*="product-name"], [class*="item-name"], h3, h2, [class*="title"]'
        );
        const name = nameElement ? nameElement.textContent?.trim() || '' : '';
        
        // Extract quantity - expanded selectors
        const quantityElement = card.querySelector(
          '.sc-aXZVg.entQHA._3eIPt, [class*="product-weight"], [class*="item-weight"], [class*="quantity"], [class*="product-unit"]'
        );
        const unit = quantityElement ? quantityElement.textContent?.trim() || '' : '';
        
        // Extract price - expanded selectors
        const priceElement = card.querySelector(
          '.sc-aXZVg.jLtxeJ.JZGfZ, [class*="price"], [class*="product-price"], [class*="item-price"]'
        );
        let price = '';
        if (priceElement) {
          // Try to get price from aria-label first, then fallback to text content
          price = priceElement.getAttribute('aria-label') || priceElement.textContent?.trim() || '';
        }
        
        // Extract product URL
        const linkElement = card.closest('a');
        const relativeUrl = linkElement ? linkElement.getAttribute('href') || '' : '';
        const productUrl = relativeUrl.startsWith('http') ? 
          relativeUrl : 
          `https://www.swiggy.com${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
        
        if (name && price) {
          products.push({
            name,
            price,
            imageUrl,
            unit,
            url: productUrl || searchUrl
          });
        }
      } catch (err) {
        console.error(`Error scraping Instamart product #${index}:`, err);
      }
    });
    
    console.log(`Successfully scraped ${products.length} Instamart products`);
    return products;
  } catch (error) {
    console.error('Error scraping Instamart:', error);
    return [];
  }
}
