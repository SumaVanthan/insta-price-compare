// backend/src/utils/httpClient.ts
import axios, { AxiosRequestConfig } from 'axios'; // Modified import

interface FetchResult {
  success: boolean;
  data?: string; // HTML content as string
  error?: string;
}

// Added ProxyConfig interface
interface ProxyConfig {
  protocol?: 'http' | 'https';
  host?: string;
  port?: number;
  auth?: {
    username?: string;
    password?: string;
  };
}

export const fetchHtml = async (url: string, proxy?: ProxyConfig): Promise<FetchResult> => {
  try {
    const logMessage = `[HttpClient] Fetching URL: ${url}` + 
                       (proxy && proxy.host && proxy.port ? ` via proxy ${proxy.host}:${proxy.port}` : ' (direct)');
    console.log(logMessage);
    
    const axiosConfig: AxiosRequestConfig = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36', // A generic user-agent
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000, // 15 seconds timeout
    };

    if (proxy && proxy.host && proxy.port) {
      axiosConfig.proxy = {
        protocol: proxy.protocol || 'http', // Default to http if not specified
        host: proxy.host,
        port: proxy.port,
      };
      if (proxy.auth && proxy.auth.username && proxy.auth.password) {
        axiosConfig.proxy.auth = { // Axios basic auth for proxy
          username: proxy.auth.username,
          password: proxy.auth.password,
        };
      }
    }

    const response = await axios.get(url, axiosConfig);

    if (response.status === 200 && response.data) {
      return { success: true, data: response.data };
    } else {
      console.error(`[HttpClient] Failed to fetch ${url}. Status: ${response.status}`);
      return { success: false, error: `Failed with status ${response.status}` };
    }
  } catch (error: any) {
    console.error(`[HttpClient] Error fetching ${url}:`, error.message);
    // If error.isAxiosError, more details might be available in error.response or error.request
    return { success: false, error: error.message };
  }
};
