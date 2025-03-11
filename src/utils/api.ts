
import { ProductData } from '@/components/ProductCard';

const SEARCH_DELAY = 1000; // Reduced delay for better user experience

// Function to scrape product data from multiple platforms
export const searchProducts = async (
  query: string,
  location: { latitude: number; longitude: number }
): Promise<{ products: ProductData[] }> => {
  console.log(`Searching for "${query}" at location:`, location);
  
  try {
    // In a production environment, this would be a call to a backend API
    // that handles the scraping to avoid CORS issues and implement proper rate limiting
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.zeptonow.com/api/search?query=${query}`)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from scraping service');
    }
    
    // Parse the scraped data
    const data = await response.json();
    const products = parseScrapedData(data, query);
    
    return { products };
  } catch (error) {
    console.error('Scraping error:', error);
    // If scraping fails, use a fallback approach to show the expected structure
    // In a production app, you would implement proper error handling and retry logic
    return { products: getFallbackProducts(query) };
  }
};

// Function to parse the scraped data into our ProductData format
const parseScrapedData = (data: any, query: string): ProductData[] => {
  try {
    // This would be a proper parser for the specific platform's HTML structure
    // For now, we'll attempt to extract data from the JSON response (if available)
    if (data.products && Array.isArray(data.products)) {
      return data.products.map((item: any, index: number) => ({
        id: item.id || `product-${index}`,
        name: item.name || `Product ${index + 1}`,
        imageUrl: item.image_url || 'https://placehold.co/400x400?text=Product+Image',
        prices: {
          zepto: item.zepto_price ? {
            price: `₹${item.zepto_price}`,
            unit: item.quantity || '1 unit',
            url: `https://www.zeptonow.com/product/${item.slug || encodeURIComponent(item.name)}`
          } : undefined,
          blinkit: item.blinkit_price ? {
            price: `₹${item.blinkit_price}`,
            unit: item.quantity || '1 unit',
            url: `https://blinkit.com/prn/${item.slug || encodeURIComponent(item.name)}`
          } : undefined,
          instamart: item.instamart_price ? {
            price: `₹${item.instamart_price}`,
            unit: item.quantity || '1 unit',
            url: `https://www.swiggy.com/instamart-item/${item.slug || encodeURIComponent(item.name)}`
          } : undefined,
        },
        unit: item.quantity || '1 unit'
      }));
    }
    
    return getFallbackProducts(query);
  } catch (error) {
    console.error('Error parsing scraped data:', error);
    return getFallbackProducts(query);
  }
};

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
