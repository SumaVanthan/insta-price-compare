
import { ScrapedResult } from '../types';
import { fetchWithCorsProxy } from '../fetchUtils';

export async function scrapeInstamartProducts(query: string): Promise<ScrapedResult[]> {
  try {
    const searchUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
    const html = await fetchWithCorsProxy(searchUrl);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const products: ScrapedResult[] = [];
    
    // Find product containers - updated selector based on the class provided
    const productCards = Array.from(doc.querySelectorAll('.sc-dcJsrY') || []);
    
    productCards.forEach(card => {
      try {
        // Extract image - updated selector based on the class provided
        const imageElement = card.querySelector('.sc-dcJsrY.ibghhT._1NxA5 img');
        let imageUrl = '';
        if (imageElement) {
          imageUrl = imageElement.getAttribute('src') || '';
        }
        
        // Extract name - updated selector based on the class provided
        const nameElement = card.querySelector('.sc-aXZVg.kyEzVU._1sPB0');
        const name = nameElement ? nameElement.textContent?.trim() || '' : '';
        
        // Extract quantity - updated selector based on the class provided
        const quantityElement = card.querySelector('.sc-aXZVg.entQHA._3eIPt');
        const unit = quantityElement ? quantityElement.textContent?.trim() || '' : '';
        
        // Extract price - updated selector based on the class provided
        const priceElement = card.querySelector('.sc-aXZVg.jLtxeJ.JZGfZ');
        let price = '';
        if (priceElement) {
          // Try to get price from aria-label first, then fallback to text content
          price = priceElement.getAttribute('aria-label') || priceElement.textContent?.trim() || '';
        }
        
        // Extract product URL
        const linkElement = card.closest('a');
        const productUrl = linkElement ? 
          `https://www.swiggy.com${linkElement.getAttribute('href')}` : 
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
        console.error('Error scraping Instamart product:', err);
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error scraping Instamart:', error);
    return [];
  }
}
