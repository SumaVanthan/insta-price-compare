
/**
 * Utility function to fetch HTML content from a URL using a CORS proxy
 */
export async function fetchWithCorsProxy(url: string): Promise<string> {
  try {
    // Try with allorigins first
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    console.log(`Fetching with CORS proxy: ${url}`);
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${url} with status ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`Received HTML response of length: ${html.length}`);
    
    // Check if we got a valid HTML response
    if (html.length < 1000) {
      console.warn(`Very short HTML response (${html.length} chars), might be invalid`);
    }
    
    return html;
  } catch (error) {
    console.error(`Error fetching with CORS proxy: ${url}`, error);
    
    // Fallback to another CORS proxy if the first one fails
    try {
      const fallbackProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      console.log(`Attempting fallback CORS proxy: ${fallbackProxyUrl}`);
      
      const fallbackResponse = await fetch(fallbackProxyUrl);
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback proxy also failed with status ${fallbackResponse.status}`);
      }
      
      const fallbackHtml = await fallbackResponse.text();
      console.log(`Received fallback HTML response of length: ${fallbackHtml.length}`);
      return fallbackHtml;
    } catch (fallbackError) {
      console.error(`Fallback CORS proxy also failed: ${url}`, fallbackError);
      // Return empty HTML if all proxies fail
      return '<html><body><p>Failed to fetch content</p></body></html>';
    }
  }
}
