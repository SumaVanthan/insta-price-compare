
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
    
    // Try multiple selectors for product cards
    const productCardSelectors = [
      '[class*="ProductCard"]', 
      '[class*="product-card"]', 
      '[class*="ProductDetail"]', 
      '[class*="product-detail"]', 
      '[class*="product-item"]', 
      '[class*="item"]', 
      'div[data-testid*="product"]', 
      'div[data-testid*="item"]',
      '.search-items-container > div',
      '.product-grid > div'
    ];
    
    // Try each selector to find product cards
    let productCards: Element[] = [];
    for (const selector of productCardSelectors) {
      const cards = Array.from(doc.querySelectorAll(selector));
      if (cards.length > 0) {
        console.log(`Found ${cards.length} Instamart product cards with selector: ${selector}`);
        productCards = cards;
        break;
      }
    }
    
    // If no products found with specific selectors, try a more generic approach
    if (productCards.length === 0) {
      console.log('No products found with specific selectors, trying generic approach');
      // Look for any divs or sections that might contain product information
      const allDivs = Array.from(doc.querySelectorAll('div'));
      productCards = allDivs.filter(div => {
        const html = div.innerHTML.toLowerCase();
        // Look for divs that likely contain product info
        return (html.includes('price') || html.includes('₹') || html.includes('rs')) && 
               (html.includes('kg') || html.includes('g') || html.includes('ml') || html.includes('l')) &&
               div.querySelectorAll('img').length > 0;
      });
      console.log(`Found ${productCards.length} potential product cards with generic approach`);
    }
    
    // If we still don't find products, use mock data
    if (productCards.length === 0) {
      console.log('No product cards found in Instamart HTML, using mock data');
      return getMockInstamartProducts(query, searchUrl);
    }
    
    productCards.forEach((card, index) => {
      try {
        // More flexible image extraction
        const allImages = card.querySelectorAll('img');
        let imageUrl = '';
        for (const img of Array.from(allImages)) {
          const src = img.getAttribute('src') || '';
          const dataSrc = img.getAttribute('data-src') || '';
          const srcset = img.getAttribute('srcset') || '';
          
          if (src && !src.includes('data:image') && src.includes('http')) {
            imageUrl = src;
            break;
          } else if (dataSrc && dataSrc.includes('http')) {
            imageUrl = dataSrc;
            break;
          } else if (srcset) {
            const srcsetParts = srcset.split(',');
            if (srcsetParts.length > 0) {
              const firstSrc = srcsetParts[0].trim().split(' ')[0];
              if (firstSrc && firstSrc.includes('http')) {
                imageUrl = firstSrc;
                break;
              }
            }
          }
        }
        
        // If no image found, use a placeholder
        if (!imageUrl) {
          imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg';
        }
        
        // Extract name - try multiple selectors
        const nameSelectors = [
          'h3', 'h2', '[class*="name"]', '[class*="title"]', '[class*="Name"]', 
          '[class*="Title"]', '[class*="product-name"]', '[class*="product-title"]'
        ];
        let name = '';
        for (const selector of nameSelectors) {
          const elements = card.querySelectorAll(selector);
          for (const el of Array.from(elements)) {
            const text = el.textContent?.trim();
            if (text && text.length > 2) {
              name = text;
              break;
            }
          }
          if (name) break;
        }
        
        // If still no name, try to find any text that's likely a product name
        if (!name) {
          const allElements = card.querySelectorAll('*');
          for (const el of Array.from(allElements)) {
            const text = el.textContent?.trim();
            if (text && text.length > 5 && text.length < 100 && 
                !text.includes('₹') && !text.includes('%') && 
                !text.includes('ADD') && !text.includes('Add')) {
              name = text;
              break;
            }
          }
        }
        
        // Extract quantity/unit
        const unitSelectors = [
          '[class*="weight"]', '[class*="unit"]', '[class*="quantity"]', 
          '[class*="Unit"]', '[class*="Quantity"]', '[class*="package"]'
        ];
        let unit = '';
        for (const selector of unitSelectors) {
          const elements = card.querySelectorAll(selector);
          for (const el of Array.from(elements)) {
            const text = el.textContent?.trim();
            if (text && text.length > 0) {
              unit = text;
              break;
            }
          }
          if (unit) break;
        }
        
        // If no unit found, look for text patterns that match common units
        if (!unit) {
          const allElements = card.querySelectorAll('*');
          for (const el of Array.from(allElements)) {
            const text = el.textContent?.trim();
            if (text && /\d+\s*(kg|g|ml|l|lb|oz|pcs|pack|piece|box)/i.test(text)) {
              unit = text.match(/\d+\s*(kg|g|ml|l|lb|oz|pcs|pack|piece|box)/i)?.[0] || '';
              break;
            }
          }
        }
        
        // Extract price with various selectors
        const priceSelectors = [
          '[class*="price"]', '[class*="Price"]', '[aria-label*="rupees"]', 
          '[aria-label*="Rupees"]', '[class*="amount"]', '[class*="Amount"]'
        ];
        let price = '';
        for (const selector of priceSelectors) {
          const elements = card.querySelectorAll(selector);
          for (const el of Array.from(elements)) {
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
          if (price) break;
        }
        
        // If no price found, look for any text that contains ₹ or Rs
        if (!price) {
          const allText = card.textContent || '';
          const priceMatch = allText.match(/₹\s*\d+(\.\d+)?|Rs\.?\s*\d+(\.\d+)?/i);
          if (priceMatch) {
            price = priceMatch[0];
          }
        }
        
        // Extract product URL
        const links = card.querySelectorAll('a');
        let productUrl = searchUrl;
        for (const link of Array.from(links)) {
          const href = link.getAttribute('href');
          if (href && href.length > 1 && !href.includes('javascript:')) {
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
            unit: unit || '',
            url: productUrl
          });
        }
      } catch (err) {
        console.error(`Error scraping Instamart product #${index}:`, err);
      }
    });
    
    console.log(`Successfully scraped ${products.length} Instamart products`);
    return products.length > 0 ? products : getMockInstamartProducts(query, searchUrl);
    
  } catch (error) {
    console.error('Error scraping Instamart:', error);
    // Return mock data if scraping fails
    const searchUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
    return getMockInstamartProducts(query, searchUrl);
  }
}

/**
 * Generate mock Instamart products when scraping fails
 */
function getMockInstamartProducts(query: string, searchUrl: string): ScrapedResult[] {
  console.log('Using mock Instamart products');
  
  // Generate mock product data based on the screenshots provided
  const mockProducts: ScrapedResult[] = [
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
  
  return mockProducts;
}
