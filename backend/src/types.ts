// backend/src/types.ts
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ScrapedResult {
  name: string;
  price: string; // This is the raw price string from the site
  unit?: string;
  url?: string;
  imageUrl?: string;
  source: string; // 'zepto', 'blinkit', 'instamart'
  isMock?: boolean;
  searchQuery?: string; // Specific to Zepto in frontend, useful for context
  searchInfo?: string;  // Specific to Zepto in frontend, useful for context
  // Potentially add originalPriceString if some scrapers can get it
}

export interface PlatformPriceDetail {
  price: string; // Raw price string
  unit?: string;
  url?: string;
  originalPrice?: string | null; // Raw original price string
  discountPercentage?: number | null;
  // name?: string; 
  // imageUrl?: string; 
}

export interface MergedBackendProduct {
  id: string; 
  name: string; 
  imageUrl?: string;
  category?: string; 
  prices: { 
    zepto?: PlatformPriceDetail | null;
    blinkit?: PlatformPriceDetail | null;
    instamart?: PlatformPriceDetail | null;
  };
  // sourceProducts?: ScrapedResult[]; // Optional: for debugging or detailed view
}

export interface PlatformScrapingMetadataEntry {
  status: 'success' | 'failed' | 'no_results';
  productsFound: number;
  error?: string;
  searchUrl?: string;
}

export interface AllPlatformsScrapingMetadata {
  zepto: PlatformScrapingMetadataEntry;
  blinkit: PlatformScrapingMetadataEntry;
  instamart: PlatformScrapingMetadataEntry;
}
