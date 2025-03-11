
import { ProductData } from '@/components/ProductCard';

export interface ScrapedResult {
  name: string;
  price: string;
  imageUrl: string;
  unit: string;
  url: string;
  numericPrice?: number;
}

export interface PlatformInfo {
  name: string;
  logo: string;
  color: string;
  baseUrl: string;
}

export interface SearchResultResponse {
  products: ProductData[];
}
