
export interface ScrapedResult {
  name: string;
  price: string;
  unit: string;
  url: string;
  imageUrl: string;
  source?: string;
}

export interface SearchResultResponse {
  products: any[];
}

export interface PlatformInfo {
  name: string;
  logo: string;
  color: string;
  baseUrl: string;
}
