
// Re-export functions from their dedicated utility files
// This maintains backward compatibility with existing imports
export { stringSimilarity as string_similarity } from './stringComparison';
export { extractPrice } from './priceUtils';
