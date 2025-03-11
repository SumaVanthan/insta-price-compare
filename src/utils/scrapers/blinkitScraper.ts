
import { ScrapedResult } from '../types';
import { fetchWithCorsProxy } from '../fetchUtils';

export async function scrapeBlinkitProducts(query: string): Promise<ScrapedResult[]> {
  try {
    const searchUrl = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
    const html = await fetchWithCorsProxy(searchUrl);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const products: ScrapedResult[] = [];
    
    // Find product containers
    const productCards = doc.querySelectorAll('div[data-testid="product-card"]');
    
    productCards.forEach(card => {
      try {
        // Extract image
        const imageElement = card.querySelector('.tw-h-full.tw-w-full.tw-transition-opacity');
        let imageUrl = '';
        if (imageElement && imageElement instanceof HTMLImageElement) {
          imageUrl = imageElement.src || '';
        }
        
        // Extract name
        const nameElement = card.querySelector('.tw-text-300.tw-font-semibold.tw-line-clamp-2');
        const name = nameElement ? nameElement.textContent?.trim() || '' : '';
        
        // Extract quantity/unit
        const quantityElement = card.querySelector('.tw-text-200.tw-font-medium.tw-line-clamp-1');
        const unit = quantityElement ? quantityElement.textContent?.trim() || '' : '';
        
        // Extract price
        const priceElement = card.querySelector('.tw-text-200.tw-font-semibold');
        const price = priceElement ? priceElement.textContent?.trim() || '' : '';
        
        // Extract product URL
        const linkElement = card.closest('a');
        const productUrl = linkElement ? 
          `https://blinkit.com${linkElement.getAttribute('href')}` : 
          searchUrl;
        
        if (name && price) {
          products.push({
            name,
            price,
            imageUrl,
            unit,
            url: productUrl
          });
        }
      } catch (err) {
        console.error('Error scraping Blinkit product:', err);
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error scraping Blinkit:', error);
    return [];
  }
}
