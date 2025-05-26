// backend/src/services/scrapingService.ts
import { ZeptoScraper } from '../scrapers/zeptoScraper';
import { BlinkitScraper } from '../scrapers/blinkitScraper';
import { InstamartScraper } from '../scrapers/instamartScraper';
import { ScrapedResult, Coordinates, MergedBackendProduct, AllPlatformsScrapingMetadata, PlatformScrapingMetadataEntry } from '../types';
import { mergeProducts } from './productMatcher';

// Helper function (can be moved to utils if needed elsewhere)
function getPlatformBaseUrl(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'zepto': return 'www.zeptonow.com';
    case 'blinkit': return 'blinkit.com';
    case 'instamart': return 'www.swiggy.com/instamart';
    default: return '';
  }
}

export class BackendScrapingService {
  private zeptoScraper: ZeptoScraper;
  private blinkitScraper: BlinkitScraper;
  private instamartScraper: InstamartScraper;

  constructor() {
    this.zeptoScraper = new ZeptoScraper();
    this.blinkitScraper = new BlinkitScraper();
    this.instamartScraper = new InstamartScraper();
    console.log('[BackendScrapingService] Initialized');
  }

  async searchAllPlatforms(query: string, location: Coordinates): Promise<{ mergedProducts: MergedBackendProduct[]; metadata: AllPlatformsScrapingMetadata; }> {
    console.log(`[BackendScrapingService] Searching all platforms for "${query}" at lat: ${location.latitude}, lon: ${location.longitude}`);
    try {
      const scrapePromises = [
        this.zeptoScraper.scrapeProducts(query, location),
        this.blinkitScraper.scrapeProducts(query, location),
        this.instamartScraper.scrapeProducts(query, location),
      ];
      
      const results = await Promise.allSettled(scrapePromises);

      const metadata: Partial<AllPlatformsScrapingMetadata> = {};
      const platformResultsForMerging: { zepto: ScrapedResult[], blinkit: ScrapedResult[], instamart: ScrapedResult[] } = { zepto: [], blinkit: [], instamart: [] };
      const platformNames: (keyof AllPlatformsScrapingMetadata)[] = ['zepto', 'blinkit', 'instamart'];

      results.forEach((result, index) => {
        const platformName = platformNames[index];
        // Construct search URL (simplified, actual URL might be more complex or formed inside scraper)
        const platformBaseUrl = getPlatformBaseUrl(platformName);
        const searchUrl = platformBaseUrl ? `https://${platformBaseUrl}/search?q=${encodeURIComponent(query)}&lat=${location.latitude}&lon=${location.longitude}` : undefined;


        if (result.status === 'fulfilled') {
          const products = result.value;
          platformResultsForMerging[platformName] = products;
          metadata[platformName] = {
            status: products.length > 0 ? 'success' : 'no_results',
            productsFound: products.length,
            searchUrl
          };
          console.log(`[BackendScrapingService] ${platformName} scrape successful, found ${products.length} products.`);
        } else {
          console.error(`[BackendScrapingService] ${platformName} scrape failed:`, result.reason);
          metadata[platformName] = {
            status: 'failed',
            productsFound: 0,
            error: result.reason?.message || String(result.reason),
            searchUrl
          };
        }
      });
      
      const mergedProducts = mergeProducts(platformResultsForMerging, query);
      console.log(`[BackendScrapingService] Total products merged: ${mergedProducts.length}`);
      
      return { mergedProducts, metadata: metadata as AllPlatformsScrapingMetadata };

    } catch (error: any) {
      console.error('[BackendScrapingService] Error during parallel scraping:', error);
      // Construct metadata indicating failure for all platforms in case of a top-level error
      const platformNames: (keyof AllPlatformsScrapingMetadata)[] = ['zepto', 'blinkit', 'instamart'];
      const failedMetadata: Partial<AllPlatformsScrapingMetadata> = {};
      platformNames.forEach(platformName => {
        const platformBaseUrl = getPlatformBaseUrl(platformName);
        const searchUrl = platformBaseUrl ? `https://${platformBaseUrl}/search?q=${encodeURIComponent(query)}&lat=${location.latitude}&lon=${location.longitude}` : undefined;
        failedMetadata[platformName] = {
          status: 'failed',
          productsFound: 0,
          error: error.message || 'Top-level service error',
          searchUrl
        };
      });
      return { mergedProducts: [], metadata: failedMetadata as AllPlatformsScrapingMetadata };
    }
  }
}
