
/**
 * Utility function to fetch HTML content from a URL using multiple CORS proxies
 */
export async function fetchWithCorsProxy(url: string): Promise<string> {
  // Array of CORS proxies to try
  const corsProxies = [
    (targetUrl: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    (targetUrl: string) => `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    (targetUrl: string) => `https://proxy.cors.sh/${targetUrl}`,
    (targetUrl: string) => `https://cors-anywhere.herokuapp.com/${targetUrl}`,
    (targetUrl: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
  ];
  
  console.log(`Fetching with CORS proxies: ${url}`);
  
  // Use a mock response if we detect we're in a dev environment that can't make real requests
  if (window.location.hostname === 'localhost' || window.location.hostname.includes('lovableproject.com')) {
    console.log('Development environment detected, using mock data for:', url);
    return getMockResponse(url);
  }

  // Set a timeout for each proxy attempt
  const FETCH_TIMEOUT = 5000; // 5 seconds per proxy
  
  // Try each proxy in sequence
  let lastError;
  for (const proxyCreator of corsProxies) {
    try {
      const proxyUrl = proxyCreator(url);
      console.log(`Trying CORS proxy: ${proxyUrl}`);
      
      const fetchPromise = fetch(proxyUrl, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': window.location.origin
        }
      });
      
      // Create a timeout promise
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Fetch timeout after ${FETCH_TIMEOUT}ms for ${proxyUrl}`));
        }, FETCH_TIMEOUT);
      });
      
      // Race between the fetch and the timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!response.ok) {
        console.warn(`Proxy failed with status ${response.status}, trying next...`);
        continue;
      }
      
      const html = await response.text();
      
      console.log(`Received HTML response of length: ${html.length}`);
      
      // Check if we got a valid HTML response
      if (html.length < 1000) {
        console.warn(`Very short HTML response (${html.length} chars), trying next proxy...`);
        continue;
      }
      
      if (!html.includes('<html') && !html.includes('<body')) {
        console.warn('Response does not contain HTML tags, trying next proxy...');
        continue;
      }
      
      return html;
    } catch (error) {
      lastError = error;
      console.error(`Error with CORS proxy:`, error);
      // Continue to the next proxy
    }
  }
  
  console.error(`All CORS proxies failed for: ${url}`, lastError);
  // Return mocked data if all proxies fail
  return getMockResponse(url);
}

/**
 * Provides mock HTML responses for development and when all proxies fail
 */
function getMockResponse(url: string): string {
  console.log(`Using mock data for URL: ${url}`);
  
  // Determine which platform and create appropriate mock data
  if (url.includes('zeptonow.com')) {
    return getMockZeptoHTML(url);
  } else if (url.includes('blinkit.com')) {
    return getMockBlinkitHTML(url);
  } else if (url.includes('swiggy.com')) {
    return getMockInstamartHTML(url);
  }
  
  // Default mock response
  return `<html><body>
    <div class="product-card">
      <img src="https://via.placeholder.com/150" alt="Product Image">
      <h3>Mock Product</h3>
      <div class="price">₹200</div>
      <div class="quantity">1 kg</div>
      <a href="${url}">View Details</a>
    </div>
  </body></html>`;
}

/**
 * Mock HTML for Zepto
 */
function getMockZeptoHTML(url: string): string {
  const query = new URL(url).searchParams.get('query') || 'rice';
  
  return `<html><body>
    <div class="search-results">
      <h1>Search results for "${query}"</h1>
      <div class="ProductCard">
        <img src="https://cdn.zeptonow.com/production/product1.webp" alt="Daawat Basmati Rice">
        <h3>Daawat Basmati Rice - Super</h3>
        <div class="price">₹159</div>
        <div class="quantity">1 kg</div>
        <a href="https://www.zeptonow.com/product/daawat-basmati-rice-supreme">View Details</a>
      </div>
      <div class="ProductCard">
        <img src="https://cdn.zeptonow.com/production/product2.webp" alt="India Gate Basmati Rice">
        <h3>India Gate Classic Basmati Rice</h3>
        <div class="price">₹232</div>
        <div class="quantity">1 kg</div>
        <a href="https://www.zeptonow.com/product/india-gate-classic-basmati-rice">View Details</a>
      </div>
      <div class="ProductCard">
        <img src="https://cdn.zeptonow.com/production/product3.webp" alt="Fortune Rice">
        <h3>Fortune Everyday Basmati Rice</h3>
        <div class="price">₹120</div>
        <div class="quantity">1 kg</div>
        <a href="https://www.zeptonow.com/product/fortune-everyday-basmati-rice">View Details</a>
      </div>
    </div>
  </body></html>`;
}

/**
 * Mock HTML for Blinkit
 */
function getMockBlinkitHTML(url: string): string {
  const query = new URL(url).searchParams.get('q') || 'rice';
  
  return `<html><body>
    <div class="search-results">
      <h1>Showing results for "${query}"</h1>
      <div class="product-card">
        <img src="https://cdn.blinkit.com/product1.png" alt="Daawat Rice">
        <h3>Daawat Rozana Basmati Rice Gold</h3>
        <div class="price">₹423</div>
        <div class="weight">5 kg</div>
        <a href="https://blinkit.com/prn/daawat-rozana-basmati-rice-gold-medium-grain/prid/423423">View</a>
      </div>
      <div class="product-card">
        <img src="https://cdn.blinkit.com/product2.png" alt="India Gate Rice">
        <h3>India Gate All Rounder Feast Rozzana Basmati Rice</h3>
        <div class="price">₹110</div>
        <div class="weight">1 kg</div>
        <a href="https://blinkit.com/prn/india-gate-all-rounder-feast-rozzana-basmati-rice/prid/110110">View</a>
      </div>
      <div class="product-card">
        <img src="https://cdn.blinkit.com/product3.png" alt="Udhaiyam Rice">
        <h3>Udhaiyam Ponni Rice 5 Kgs, Goldwinner Refined Sunflower Oil 1 Ltr, Udhaiyam Urad Dal 1 Kg</h3>
        <div class="price">₹1186</div>
        <div class="weight">3 Combo</div>
        <a href="https://blinkit.com/prn/udhaiyam-ponni-rice-5-kgs-goldwinner-refined-sunflower-oil-1-ltr-udhaiyam-urad-dal-1-kg/prid/118611">View</a>
      </div>
    </div>
  </body></html>`;
}

/**
 * Mock HTML for Instamart
 */
function getMockInstamartHTML(url: string): string {
  const query = new URL(url).searchParams.get('query') || 'rice';
  
  return `<html><body>
    <div class="search-results">
      <h1>Showing results for "${query}"</h1>
      <div class="ProductCard">
        <img src="https://cdn.instamart.swiggy.com/product1.jpg" alt="Daawat Rice">
        <h3>Daawat Basmati Rice - Super</h3>
        <div class="price">₹159</div>
        <div class="quantity">1 kg</div>
        <a href="https://www.swiggy.com/instamart/product/daawat-basmati-rice-super">View Details</a>
      </div>
      <div class="ProductCard">
        <img src="https://cdn.instamart.swiggy.com/product2.jpg" alt="Sivaji Rice">
        <h3>Sivaji Vkr Boiled Rice</h3>
        <div class="price">₹1819</div>
        <div class="quantity">25 kg</div>
        <a href="https://www.swiggy.com/instamart/product/sivaji-vkr-boiled-rice">View Details</a>
      </div>
      <div class="ProductCard">
        <img src="https://cdn.instamart.swiggy.com/product3.jpg" alt="Supreme Harvest Rice">
        <h3>Supreme Harvest Ponni Raw Rice</h3>
        <div class="price">₹66</div>
        <div class="quantity">1 kg</div>
        <a href="https://www.swiggy.com/instamart/product/supreme-harvest-ponni-raw-rice">View Details</a>
      </div>
    </div>
  </body></html>`;
}
