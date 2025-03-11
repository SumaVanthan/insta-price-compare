
/**
 * Utility function to fetch HTML content from a URL using a CORS proxy
 */
export async function fetchWithCorsProxy(url: string): Promise<string> {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${url}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching with CORS proxy: ${url}`, error);
    throw error;
  }
}
