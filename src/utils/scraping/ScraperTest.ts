
import { ProductScraper } from './ProductScraper';
import { ScraperClient } from './ScraperClient';

/**
 * Unit test for the scraper
 * This can be run in the browser console to test the scraper
 */
export async function testScraper() {
  console.log('Starting scraper test...');
  
  try {
    const client = new ScraperClient(5000);
    console.log('Testing direct fetch...');
    
    // Test direct fetch
    const testUrl = 'https://www.example.com';
    const fetchResult = await client.fetch(testUrl);
    console.log('Fetch result:', {
      success: fetchResult.success,
      dataLength: fetchResult.data ? fetchResult.data.length : 0,
      duration: fetchResult.duration,
      error: fetchResult.error
    });
    
    // Test product scraper
    console.log('Testing product scraper...');
    const scraper = new ProductScraper(5000);
    
    console.log('Testing Zepto scraper...');
    const zeptoStartTime = Date.now();
    const zeptoResults = await scraper.scrapeZeptoProducts('rice');
    const zeptoDuration = Date.now() - zeptoStartTime;
    
    console.log('Zepto results:', {
      count: zeptoResults.length,
      duration: zeptoDuration,
      sample: zeptoResults.slice(0, 2)
    });
    
    console.log('Testing Blinkit scraper...');
    const blinkitStartTime = Date.now();
    const blinkitResults = await scraper.scrapeBlinkitProducts('rice');
    const blinkitDuration = Date.now() - blinkitStartTime;
    
    console.log('Blinkit results:', {
      count: blinkitResults.length,
      duration: blinkitDuration,
      sample: blinkitResults.slice(0, 2)
    });
    
    console.log('Testing Instamart scraper...');
    const instamartStartTime = Date.now();
    const instamartResults = await scraper.scrapeInstamartProducts('rice');
    const instamartDuration = Date.now() - instamartStartTime;
    
    console.log('Instamart results:', {
      count: instamartResults.length,
      duration: instamartDuration,
      sample: instamartResults.slice(0, 2)
    });
    
    console.log('Test completed successfully!');
    return {
      success: true,
      results: {
        zepto: { count: zeptoResults.length, duration: zeptoDuration },
        blinkit: { count: blinkitResults.length, duration: blinkitDuration },
        instamart: { count: instamartResults.length, duration: instamartDuration }
      }
    };
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Make the test function available in the global scope for browser testing
(window as any).testScraper = testScraper;
