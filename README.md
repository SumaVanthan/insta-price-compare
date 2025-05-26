## Project Overview and Components

This project is a grocery price comparison tool that allows users to search for products and compare their prices across different online grocery platforms. It consists of a React-based frontend and a Node.js/Express.js backend.

### Frontend

The frontend provides the user interface for searching products, handling location permissions, and displaying the aggregated search results. It communicates with the backend to fetch product data.

**Key Directories and Files:**

*   `src/pages/Index.tsx`: The main page component that handles user input, location services, and displays search results or error/loading states.
*   `src/components/`: This directory contains various reusable UI components.
    *   `SearchBar.tsx`: Component for user search input.
    *   `ProductGrid.tsx`: Component to display the grid of product results.
    *   `ProductCard.tsx`: Component for rendering individual product details and their prices across platforms.
    *   `ErrorState.tsx`: Component to display error messages.
    *   `LoadingState.tsx`: Component to show loading indicators during data fetching.
    *   `LocationPermission.tsx`: Component to handle browser geolocation permissions.
*   `src/utils/api.ts`: Contains the `searchProducts` function responsible for making API calls to the backend.
*   `src/utils/location.ts`: Utilities for handling browser geolocation services.
*   `src/utils/types.ts`: Contains TypeScript type definitions and interfaces specific to the frontend, including those for backend responses and UI data structures.
*   `src/utils/priceUtils.ts`: Utility functions for parsing and formatting price strings.
*   `src/utils/stringComparison.ts` & `src/utils/string_similarity.ts`: Utilities for comparing product names (though primary matching now happens on backend).

**Running the Frontend:**

The frontend development server can be started from the project's root directory:
```sh
npm run dev
```
This usually makes the application available at `http://localhost:5173`.

### Backend

The backend is a Node.js application using Express.js. Its primary role is to receive search requests from the frontend, orchestrate the scraping of product data from various grocery platforms (Zepto, Blinkit, Instamart), merge and normalize this data, and then return the consolidated results to the frontend.

**Key Directories and Files (within `backend/`):**

*   `backend/src/index.ts`: The main entry point for the backend server. It sets up the Express application, middleware (CORS, JSON parsing), and defines API routes, primarily `/api/search`.
*   `backend/src/services/scrapingService.ts`: Contains `BackendScrapingService`, which orchestrates the entire scraping process. It calls individual platform scrapers and aggregates their raw results along with metadata.
*   `backend/src/services/productMatcher.ts`: Implements the `mergeProducts` function, which takes raw scraped data from all platforms and groups similar products, normalizing their details.
*   `backend/src/scrapers/`: This directory holds the individual scraper classes for each grocery platform.
    *   `baseScraper.ts`: An abstract base class defining the common structure for scrapers.
    *   `zeptoScraper.ts`, `blinkitScraper.ts`, `instamartScraper.ts`: Concrete scraper implementations for each platform, adapted from the frontend and using the backend's `httpClient`.
*   `backend/src/utils/httpClient.ts`: A utility for making HTTP GET requests to external websites. It uses `axios` and includes a placeholder for future proxy integration.
*   `backend/src/utils/stringComparison.ts`, `string_similarity.ts`, `priceUtils.ts`: Utility functions for string manipulation, similarity scoring, and price string parsing, used in the product matching process.
*   `backend/src/types.ts`: Contains backend-specific TypeScript type definitions, such as `ScrapedResult`, `MergedBackendProduct`, and metadata types.
*   `.env`: Environment configuration file (e.g., `PORT=3001` for the backend server).
*   `package.json`: Defines backend dependencies and scripts (`start`, `dev`, `build`).
*   `tsconfig.json`: TypeScript compiler configuration for the backend.

**Running the Backend:**

The backend development server can be started from the `backend/` directory:
```sh
cd backend
npm run dev
```
This usually makes the backend API available at `http://localhost:3001`.

### Overall Architecture

The application follows a client-server architecture:

1.  **User Interaction (Frontend):** The user interacts with the React UI in `Index.tsx` to input a search query and grant location access.
2.  **API Request (Frontend to Backend):** The `searchProducts` function in `src/utils/api.ts` (frontend) sends a GET request to the backend's `/api/search` endpoint, including the search query and location coordinates.
3.  **Request Handling (Backend):** The Express.js server in `backend/src/index.ts` receives the request.
4.  **Scraping Orchestration (Backend):** The request is routed to `BackendScrapingService`. This service invokes the `scrapeProducts` method of each platform-specific scraper (`zeptoScraper`, `blinkitScraper`, `instamartScraper`) in parallel.
5.  **Data Fetching (Backend):** Each scraper uses `httpClient.ts` to fetch HTML content from the respective grocery platform's website.
6.  **HTML Parsing & Data Extraction (Backend):** Scrapers parse the HTML (using Cheerio) to extract product names, prices, units, images, and URLs.
7.  **Data Aggregation & Merging (Backend):** The raw results from all scrapers are passed to `productMatcher.ts`. The `mergeProducts` function normalizes product names, groups similar items, and consolidates their price information from different sources into a `MergedBackendProduct` structure.
8.  **Response to Frontend (Backend to Frontend):** The `BackendScrapingService` returns the list of merged products and scraping metadata to the API route handler, which then sends a JSON response back to the frontend.
9.  **Display Results (Frontend):** The frontend's `api.ts` receives the response, maps the backend product data to the frontend's `ProductData` type, and `Index.tsx` updates its state to display the results using `ProductGrid.tsx` and `ProductCard.tsx`. Metadata about the scraping process (e.g., number of products found per platform) is also available for display.

This separation of concerns allows the frontend to focus on presentation and user experience, while the backend handles the complexities of data fetching and processing.
```
