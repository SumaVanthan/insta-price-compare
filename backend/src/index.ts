// backend/src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { BackendScrapingService } from './services/scrapingService'; // Add this

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

const scrapingService = new BackendScrapingService(); // Initialize the service

// Placeholder for health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Placeholder for the search API endpoint
app.get('/api/search', async (req: Request, res: Response) => { // Make it async
  const query = req.query.query as string;
  const lat = parseFloat(req.query.lat as string); // Parse to number
  const lon = parseFloat(req.query.lon as string); // Parse to number

  if (!query || isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ 
      success: false, 
      error: { type: 'Validation Error', message: 'Missing or invalid required query parameters: query, lat, lon.' }
    });
  }

  try {
    const { mergedProducts, metadata } = await scrapingService.searchAllPlatforms(query, { latitude: lat, longitude: lon });

    // Case 1: Successfully found and merged products
    if (mergedProducts.length > 0) {
      return res.json({
        success: true,
        query,
        location: { latitude: lat, longitude: lon },
        products: mergedProducts,
        metadata
      });
    }

    // Case 2: All scrapers attempted, but no products were found or merged
    const allScrapersAttempted = Object.values(metadata).every(m => m.status === 'success' || m.status === 'no_results' || m.status === 'failed');
    if (allScrapersAttempted && mergedProducts.length === 0) {
      // Check if any platform actually had an error vs. just no results
      const anyPlatformFailed = Object.values(metadata).some(m => m.status === 'failed');
      if (anyPlatformFailed && Object.values(metadata).every(m => m.status === 'failed' || m.status === 'no_results')) {
         // If at least one failed and others had no_results or also failed
         return res.status(503).json({
            success: false,
            query,
            location: { latitude: lat, longitude: lon },
            error: { type: 'Scraping Error', message: 'Failed to retrieve data from one or more grocery platforms.' },
            products: [],
            metadata
         });
      }
      // All platforms attempted, none had errors, but no products found/merged
      return res.json({
        success: true, // API call succeeded, even if no products
        query,
        location: { latitude: lat, longitude: lon },
        products: [],
        message: "No products found matching your query and location across the platforms.",
        metadata
      });
    }
    
    // Fallback for other scenarios (e.g., partial success but no merged products, should be rare if logic above is correct)
    // This indicates a potential gap or an unusual state.
    res.json({
      success: true, 
      query,
      location: { latitude: lat, longitude: lon },
      products: mergedProducts, // Will be empty
      message: "Search completed. No products available based on the current results.",
      metadata
    });

  } catch (error: any) {
    console.error('[API] Search handler error:', error);
    res.status(500).json({
      success: false,
      error: { type: 'Server Error', message: error.message || 'An unexpected error occurred.'}
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
