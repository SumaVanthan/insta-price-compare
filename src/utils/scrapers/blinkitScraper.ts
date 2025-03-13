
import { ScrapedResult } from '../types';
import { fetchWithCorsProxy } from '../fetchUtils';

export async function scrapeBlinkitProducts(query: string): Promise<ScrapedResult[]> {
  try {
    const searchUrl = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
    const html = await fetchWithCorsProxy(searchUrl);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const products: ScrapedResult[] = [];
    
    // Find product containers - expanded selectors to capture more product types
    const productCards = Array.from(doc.querySelectorAll(
      'div[data-testid="product-card"], .product-card, .plp-product, [class*="product-item"], [class*="ProductCard"]'
    ));
    
    console.log(`Found ${productCards.length} Blinkit product cards`);
    
    productCards.forEach((card, index) => {
      try {
        // Extract image - expanded selectors
        const imageElement = card.querySelector('.tw-h-full.tw-w-full.tw-transition-opacity, img[loading="lazy"], img.product-image, img[class*="ProductImage"]');
        let imageUrl = '';
        if (imageElement && imageElement instanceof HTMLImageElement) {
          imageUrl = imageElement.src || imageElement.getAttribute('data-src') || '';
        }
        
        // Extract name - expanded selectors
        const nameElement = card.querySelector('.tw-text-300.tw-font-semibold.tw-line-clamp-2, [class*="product-name"], [class*="ProductName"], h3, h2');
        const name = nameElement ? nameElement.textContent?.trim() || '' : '';
        
        // Extract quantity/unit - expanded selectors
        const quantityElement = card.querySelector('.tw-text-200.tw-font-medium.tw-line-clamp-1, [class*="product-weight"], [class*="ProductWeight"], [class*="UnitText"]');
        const unit = quantityElement ? quantityElement.textContent?.trim() || '' : '';
        
        // Extract price - expanded selectors
        const priceElement = card.querySelector('.tw-text-200.tw-font-semibold, [class*="product-price"], [class*="ProductPrice"], [class*="PriceText"]');
        const price = priceElement ? priceElement.textContent?.trim() || '' : '';
        
        // Extract product URL
        const linkElement = card.closest('a');
        const relativeUrl = linkElement ? linkElement.getAttribute('href') || '' : '';
        const productUrl = relativeUrl.startsWith('http') ? 
          relativeUrl : 
          `https://blinkit.com${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
        
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
        console.error(`Error scraping Blinkit product #${index}:`, err);
      }
    });
    
    console.log(`Successfully scraped ${products.length} Blinkit products`);
    return products;
  } catch (error) {
    console.error('Error scraping Blinkit:', error);
    return [];
  }
}
