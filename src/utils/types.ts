
export interface ScrapedResult {
  name: string;
  price: string;
  unit: string;
  url: string;
  imageUrl: string;
  source: string;
  searchQuery?: string;
  searchInfo?: string;
  isMock?: boolean; // Added to track if this is mock data
}

// Frontend Display Types (used by ProductCard and Index.tsx)
export interface PriceDetail { // Renamed from ProductCard's platform-specific price object
    price: string; // Raw price string
    unit?: string;
    url?: string;
    originalPrice?: string | null; // For strikethrough, from BackendPlatformPriceDetail
    discountPercentage?: number | null; // From BackendPlatformPriceDetail
}

export interface ProductData {
    id: string;
    name: string;
    imageUrl?: string; // Optional, with placeholder handling in UI
    unit?: string; // A general unit for the product, derived if possible
    prices: {
        zepto?: PriceDetail | null;
        blinkit?: PriceDetail | null;
        instamart?: PriceDetail | null;
    };
    sources?: string[]; // List of platforms where this product is available
}

export interface SearchPageResponse { // Replaces SearchResultResponse
  products: ProductData[];
  error?: string | null;
  message?: string | null;
  metadata?: BackendSearchResponse['metadata']; // Use the metadata type from backend response
}

export interface PlatformInfo {
  name: string;
  logo: string;
  color: string;
  baseUrl: string;
  searchUrl: string;
  status?: 'online' | 'offline' | 'unknown';
}

export const PLATFORMS: Record<string, PlatformInfo> = {
  zepto: {
    name: 'Zepto',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png',
    color: 'bg-purple-100 text-purple-800',
    baseUrl: 'www.zeptonow.com',
    searchUrl: 'https://www.zeptonow.com/search?query='
  },
  blinkit: {
    name: 'Blinkit',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png',
    color: 'bg-yellow-100 text-yellow-800',
    baseUrl: 'blinkit.com',
    searchUrl: 'https://blinkit.com/s/?q='
  },
  instamart: {
    name: 'Instamart',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg',
    color: 'bg-orange-100 text-orange-800',
    baseUrl: 'www.swiggy.com/instamart',
    searchUrl: 'https://www.swiggy.com/instamart/search?custom_back=true&query='
  }
};

// Helper function to get platform info by source name
export function getPlatformInfo(source: string): PlatformInfo | undefined {
  return PLATFORMS[source.toLowerCase()];
}

// Helper function to get all platforms as an array
export function getAllPlatforms(): PlatformInfo[] {
  return Object.values(PLATFORMS);
}

// Helper function to format source name for display
export function formatSourceName(source: string): string {
  const platform = getPlatformInfo(source);
  return platform ? platform.name : source;
}

// Backend Response Types
export interface BackendPlatformPriceDetail {
  price: string;
  unit?: string;
  url?: string;
  originalPrice?: string | null;
  discountPercentage?: number | null;
}

export interface BackendProduct {
  id: string;
  name: string;
  imageUrl?: string;
  category?: string;
  prices: {
    zepto?: BackendPlatformPriceDetail | null;
    blinkit?: BackendPlatformPriceDetail | null;
    instamart?: BackendPlatformPriceDetail | null;
  };
}

export interface BackendPlatformMetadata {
    status: 'success' | 'failed' | 'no_results';
    productsFound: number;
    error?: string;
    searchUrl?: string;
}

export interface BackendSearchResponse {
  success: boolean;
  query?: string;
  location?: { latitude: number; longitude: number };
  products?: BackendProduct[];
  metadata?: {
    zepto: BackendPlatformMetadata;
    blinkit: BackendPlatformMetadata;
    instamart: BackendPlatformMetadata;
  };
  message?: string;
  error?: {
    type: string;
    message: string;
  };
}
