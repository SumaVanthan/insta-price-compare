
import { PlatformInfo } from './types';

/**
 * Configuration for supported e-commerce platforms
 */
export const platforms: Record<string, PlatformInfo> = {
  zepto: {
    name: 'Zepto',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png',
    color: 'bg-[#792FD6]/10 text-[#792FD6]',
    baseUrl: 'https://www.zeptonow.com/products/',
    searchUrl: 'https://www.zeptonow.com/search?query='
  },
  blinkit: {
    name: 'Blinkit',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png',
    color: 'bg-[#F3CF00]/10 text-[#000000]',
    baseUrl: 'https://blinkit.com/search/',
    searchUrl: 'https://blinkit.com/s/?q='
  },
  instamart: {
    name: 'Instamart',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg',
    color: 'bg-[#FC8019]/10 text-[#FC8019]',
    baseUrl: 'https://www.swiggy.com/instamart-search/',
    searchUrl: 'https://www.swiggy.com/instamart/search?custom_back=true&query='
  },
};
