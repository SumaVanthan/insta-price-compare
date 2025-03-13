
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
    
    // Find product containers - modified selector to capture ALL product cards
    const productCards = Array.from(doc.querySelectorAll('[data-testid="product-card"], .product-card, .product-item, .product-container'));
    
    console.log(`Found ${productCards.length} Zepto product cards`);
    
    productCards.forEach((card, index) => {
      try {
        // Extract image
        const imageContainer = card.querySelector('.relative.z-0.rounded-xl.bg-gray-200, .product-image, img');
        let imageUrl = '';
        if (imageContainer) {
          const img = imageContainer.querySelector('img') || (imageContainer.tagName === 'IMG' ? imageContainer : null);
          if (img) {
            // Try to get srcset or src
            const srcset = img.getAttribute('srcset');
            if (srcset) {
              // Extract the first URL from srcset
              imageUrl = srcset.split(' ')[0];
            } else {
              imageUrl = img.getAttribute('src') || '';
            }
          }
        }
        
        // Extract name
        const nameElement = card.querySelector('.mt-2.\\!h-12.lg\\:\\!h-16, .product-name, [class*="product-title"], h3, h2');
        const name = nameElement ? nameElement.textContent?.trim() || '' : '';
        
        // Extract quantity
        const quantityElement = card.querySelector('[class*="font-subtitle"][class*="text-lg"], .product-weight, .product-quantity, .product-unit');
        const unit = quantityElement ? quantityElement.textContent?.trim() || '' : '';
        
        // Extract price
        const priceElement = card.querySelector('[data-testid="product-card-price"], .product-price, .price, [class*="price"]');
        const price = priceElement ? priceElement.textContent?.trim() || '' : '';
        
        // Extract product URL
        const linkElement = card.closest('a');
        const productUrl = linkElement ? 
          `https://www.zeptonow.com${linkElement.getAttribute('href')}` : 
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
        console.error(`Error scraping Zepto product #${index}:`, err);
      }
    });
    
    console.log(`Successfully scraped ${products.length} Zepto products`);
    return products;
  } catch (error) {
    console.error('Error scraping Zepto:', error);
    return [];
  }
}
