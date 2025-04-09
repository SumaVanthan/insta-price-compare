export interface ScrapedResult {
  name: string;
  price: string;
  unit: string;
  url: string;
  imageUrl: string;
  source: string;
  searchQuery?: string;
  searchInfo?: string;
}

export interface SearchResultResponse {
  products: any[];
}

export interface PlatformInfo {
  name: string;
  logo: string;
  color: string;
  baseUrl: string;
  searchUrl: string;
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
