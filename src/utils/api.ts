
import { ProductData } from '@/components/ProductCard';
import { string_similarity } from './string_similarity';

interface ScrapedResult {
  name: string;
  price: string;
  imageUrl: string;
  unit: string;
  url: string;
}

// Function to scrape product data from multiple platforms
export const searchProducts = async (
  query: string,
  location: { latitude: number; longitude: number }
): Promise<{ products: ProductData[] }> => {
  console.log(`Searching for "${query}" at location:`, location);
  
  try {
    // Fetch from multiple platforms in parallel
    const [zeptoProducts, blinkitProducts, instamartProducts] = await Promise.all([
      scrapeZeptoProducts(query),
      scrapeBlinkitProducts(query),
      scrapeInstamartProducts(query)
    ]);

    console.log('Scraped products:', { zeptoProducts, blinkitProducts, instamartProducts });
    
    // Merge similar products across platforms
    const mergedProducts = mergeProducts(zeptoProducts, blinkitProducts, instamartProducts, query);
    
    return { products: mergedProducts };
  } catch (error) {
    console.error('Scraping error:', error);
    // If scraping fails, use a fallback approach to show the expected structure
    return { products: getFallbackProducts(query) };
  }
};

async function fetchWithCorsProxy(url: string): Promise<string> {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${url}`);
  }
  return await response.text();
}

async function scrapeZeptoProducts(query: string): Promise<ScrapedResult[]> {
  try {
    const searchUrl = `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`;
    const html = await fetchWithCorsProxy(searchUrl);
    
    // Create a temporary DOM element to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const products: ScrapedResult[] = [];
    
    // Find product containers
    const productCards = doc.querySelectorAll('[data-testid="product-card"]');
    
    productCards.forEach(card => {
      try {
        // Extract image
        const imageContainer = card.querySelector('.relative.z-0.rounded-xl.bg-gray-200');
        let imageUrl = '';
        if (imageContainer) {
          const img = imageContainer.querySelector('img');
          if (img) {
            // Try to get srcset or src
            imageUrl = img.getAttribute('srcset')?.split(' ')[0] || 
                      img.getAttribute('src') || '';
          }
        }
        
        // Extract name
        const nameElement = card.querySelector('.mt-2.\\!h-12.lg\\:\\!h-16');
        const name = nameElement ? nameElement.textContent?.trim() || '' : '';
        
        // Extract quantity
        const quantityElement = card.querySelector('[class*="font-subtitle"][class*="text-lg"]');
        const unit = quantityElement ? quantityElement.textContent?.trim() || '' : '';
        
        // Extract price
        const priceElement = card.querySelector('[data-testid="product-card-price"]');
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
        console.error('Error scraping Zepto product:', err);
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error scraping Zepto:', error);
    return [];
  }
}

async function scrapeBlinkitProducts(query: string): Promise<ScrapedResult[]> {
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

async function scrapeInstamartProducts(query: string): Promise<ScrapedResult[]> {
  try {
    const searchUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
    const html = await fetchWithCorsProxy(searchUrl);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const products: ScrapedResult[] = [];
    
    // Find product containers
    const productCards = doc.querySelectorAll('.sc-dcJsrY');
    
    productCards.forEach(card => {
      try {
        // Extract image
        const imageElement = card.querySelector('.sc-dcJsrY.ibghhT._1NxA5 img');
        let imageUrl = '';
        if (imageElement) {
          imageUrl = imageElement.getAttribute('src') || '';
        }
        
        // Extract name
        const nameElement = card.querySelector('.sc-aXZVg.kyEzVU._1sPB0');
        const name = nameElement ? nameElement.textContent?.trim() || '' : '';
        
        // Extract quantity
        const quantityElement = card.querySelector('.sc-aXZVg.entQHA._3eIPt');
        const unit = quantityElement ? quantityElement.textContent?.trim() || '' : '';
        
        // Extract price
        const priceElement = card.querySelector('.sc-aXZVg.jLtxeJ.JZGfZ');
        const price = priceElement ? 
          priceElement.getAttribute('aria-label') || priceElement.textContent?.trim() || '' : '';
        
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

function mergeProducts(
  zeptoProducts: ScrapedResult[], 
  blinkitProducts: ScrapedResult[], 
  instamartProducts: ScrapedResult[],
  query: string
): ProductData[] {
  const mergedProducts: ProductData[] = [];
  const processedProducts = new Set<string>();
  
  // Process all Zepto products first
  zeptoProducts.forEach((zeptoProduct, index) => {
    const productId = `product-${index}`;
    
    // Find matching products in other platforms
    const blinkitMatch = findMatchingProduct(zeptoProduct.name, blinkitProducts);
    const instamartMatch = findMatchingProduct(zeptoProduct.name, instamartProducts);
    
    // Create product data with prices from all platforms
    const productData: ProductData = {
      id: productId,
      name: zeptoProduct.name,
      imageUrl: zeptoProduct.imageUrl || '/placeholder.svg',
      prices: {
        zepto: { 
          price: zeptoProduct.price, 
          unit: zeptoProduct.unit,
          url: zeptoProduct.url
        }
      },
      unit: zeptoProduct.unit
    };
    
    // Add Blinkit price if matched
    if (blinkitMatch) {
      productData.prices.blinkit = {
        price: blinkitMatch.price,
        unit: blinkitMatch.unit,
        url: blinkitMatch.url
      };
      processedProducts.add(blinkitMatch.name);
    }
    
    // Add Instamart price if matched
    if (instamartMatch) {
      productData.prices.instamart = {
        price: instamartMatch.price,
        unit: instamartMatch.unit,
        url: instamartMatch.url
      };
      processedProducts.add(instamartMatch.name);
    }
    
    mergedProducts.push(productData);
    processedProducts.add(zeptoProduct.name);
  });
  
  // Add remaining products from Blinkit that weren't matched
  blinkitProducts
    .filter(product => !isProductProcessed(product.name, processedProducts))
    .forEach((product, index) => {
      const productId = `blinkit-${index}`;
      const instamartMatch = findMatchingProduct(product.name, instamartProducts);
      
      const productData: ProductData = {
        id: productId,
        name: product.name,
        imageUrl: product.imageUrl || '/placeholder.svg',
        prices: {
          blinkit: {
            price: product.price,
            unit: product.unit,
            url: product.url
          }
        },
        unit: product.unit
      };
      
      // Add Instamart price if matched
      if (instamartMatch) {
        productData.prices.instamart = {
          price: instamartMatch.price,
          unit: instamartMatch.unit,
          url: instamartMatch.url
        };
        processedProducts.add(instamartMatch.name);
      }
      
      mergedProducts.push(productData);
      processedProducts.add(product.name);
    });
  
  // Add remaining products from Instamart that weren't matched
  instamartProducts
    .filter(product => !isProductProcessed(product.name, processedProducts))
    .forEach((product, index) => {
      const productId = `instamart-${index}`;
      
      mergedProducts.push({
        id: productId,
        name: product.name,
        imageUrl: product.imageUrl || '/placeholder.svg',
        prices: {
          instamart: {
            price: product.price,
            unit: product.unit,
            url: product.url
          }
        },
        unit: product.unit
      });
    });
  
  // If no products were found, fall back to direct links
  if (mergedProducts.length === 0) {
    return getFallbackProducts(query);
  }
  
  return mergedProducts;
}

function findMatchingProduct(productName: string, products: ScrapedResult[]): ScrapedResult | null {
  for (const product of products) {
    const similarity = string_similarity(productName.toLowerCase(), product.name.toLowerCase());
    if (similarity >= 0.8) {
      return product;
    }
  }
  return null;
}

function isProductProcessed(productName: string, processedNames: Set<string>): boolean {
  for (const name of processedNames) {
    if (string_similarity(productName.toLowerCase(), name.toLowerCase()) >= 0.8) {
      return true;
    }
  }
  return false;
}

// Fallback products to show when scraping fails
const getFallbackProducts = (query: string): ProductData[] => {
  console.log('Using fallback products for query:', query);
  
  // Instead of using hardcoded mock data, we'll redirect users to the actual sites
  return [
    {
      id: '1',
      name: `${query} - View on Zepto`,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png',
      prices: {
        zepto: { 
          price: 'Click to view', 
          unit: 'Live price',
          url: `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`
        }
      },
      unit: 'Search result'
    },
    {
      id: '2',
      name: `${query} - View on Blinkit`,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png',
      prices: {
        blinkit: { 
          price: 'Click to view', 
          unit: 'Live price',
          url: `https://blinkit.com/s/?q=${encodeURIComponent(query)}`
        }
      },
      unit: 'Search result'
    },
    {
      id: '3',
      name: `${query} - View on Swiggy Instamart`,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg',
      prices: {
        instamart: { 
          price: 'Click to view', 
          unit: 'Live price',
          url: `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`
        }
      },
      unit: 'Search result'
    }
  ];
};

// Individual product scraping function (more detailed version for single products)
export const scrapeProductPrices = async (productId: string, location: { latitude: number; longitude: number }) => {
  // In a real implementation, this would call your backend API which handles the scraping
  // For demo purposes, we're returning a synthetic response
  try {
    // Simulate a delay to represent the scraping process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      prices: {
        zepto: { 
          price: 'Live Price', 
          unit: 'Check website',
          url: 'https://www.zeptonow.com/product/sample-product/prid/12345'
        },
        blinkit: { 
          price: 'Live Price', 
          unit: 'Check website',
          url: 'https://blinkit.com/prn/sample-product/prid/54321'
        },
        instamart: { 
          price: 'Live Price', 
          unit: 'Check website',
          url: 'https://www.swiggy.com/instamart-item/sample-product-123456'
        },
      }
    };
  } catch (error) {
    console.error('Error scraping product prices:', error);
    throw new Error('Failed to retrieve live price data');
  }
};
