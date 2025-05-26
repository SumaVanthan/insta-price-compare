
import { ProductData, SearchPageResponse, BackendSearchResponse, BackendProduct } from './types'; // Adjusted imports
// Removed scraperService import
// extractPrice might not be needed here if backend provides all price details

/**
 * Search for products across multiple platforms by calling the backend API
 * @param query Search query
 * @param location User's location
 * @returns Formatted product data for the frontend
 */
export const searchProducts = async (
  query: string,
  location: { latitude: number; longitude: number }
): Promise<SearchPageResponse> => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  const apiUrl = `${backendUrl}/api/search?query=${encodeURIComponent(query)}&lat=${location.latitude}&lon=${location.longitude}`;

  console.log(`[API] Calling backend API: ${apiUrl}`);
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorResult: BackendSearchResponse = await response.json();
        if (errorResult.error && errorResult.error.message) {
          errorMsg = errorResult.error.message;
        } else if (errorResult.message) {
          errorMsg = errorResult.message;
        }
      } catch (e) {
        // Could not parse error JSON, use default HTTP error
        console.error('[API] Could not parse error JSON from backend', e);
      }
      console.error(`[API] Backend request failed: ${errorMsg}`);
      return { products: [], error: errorMsg, metadata: undefined };
    }

    const result: BackendSearchResponse = await response.json();

    if (!result.success) {
      const errorMsg = result.error?.message || result.message || 'Backend indicated failure.';
      console.error(`[API] Backend returned success=false: ${errorMsg}`);
      return { products: [], error: errorMsg, metadata: result.metadata };
    }

    if (!result.products || result.products.length === 0) {
      console.log('[API] No products found or returned from backend.');
      return { products: [], message: result.message || 'No products found.', metadata: result.metadata };
    }

    // Map BackendProduct[] to ProductData[]
    const mappedProducts: ProductData[] = result.products.map((p: BackendProduct): ProductData => {
      const sources: string[] = [];
      if (p.prices.zepto) sources.push('zepto');
      if (p.prices.blinkit) sources.push('blinkit');
      if (p.prices.instamart) sources.push('instamart');

      // The PriceDetail interface is compatible with BackendPlatformPriceDetail
      // as per the definitions in types.ts (Turn 43 for PriceDetail, Turn 42 for BackendPlatformPriceDetail)
      return {
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl || '/placeholder.svg',
        prices: { 
          zepto: p.prices.zepto,
          blinkit: p.prices.blinkit,
          instamart: p.prices.instamart,
        },
        sources: sources,
        // unit: p.unit, // BackendProduct does not have a top-level unit.
                       // ProductData's top-level unit will be derived by ProductCard if needed,
                       // or this mapping could try to find a common one.
      };
    });
    
    console.log(`[API] Successfully fetched and mapped ${mappedProducts.length} products.`);
    return { products: mappedProducts, error: null, message: null, metadata: result.metadata };

  } catch (error: any) {
    console.error('[API] Network or unexpected error calling backend:', error);
    return { products: [], error: error.message || 'Failed to connect to the backend.', metadata: undefined };
  }
};

/**
 * Scrape detailed prices for a specific product
 * Note: This is a placeholder for a more detailed implementation
 */
export const scrapeProductPrices = async (
  productId: string, 
  location: { latitude: number; longitude: number }
) => {
  console.log(`[API] Scraping detailed prices for product ID: ${productId}`);
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
    console.error('[API] Error scraping product prices:', error);
    throw new Error('Failed to retrieve live price data');
  }
};
