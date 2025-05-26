// backend/src/utils/stringComparison.ts
import { stringSimilarity } from './string_similarity'; // This path should be correct

const SIMILARITY_THRESHOLD = 0.7; // Default threshold

/**
 * Normalize product names for comparison.
 * - Converts to lowercase.
 * - Removes common units and quantities (e.g., "1kg", "500g", "1 ltr").
 * - Removes special characters.
 * - Trims extra whitespace.
 */
export function normalizeProductName(name: string): string {
  if (!name) return '';
  
  let normalized = name.toLowerCase();
  
  // Remove common units and quantities (more comprehensive list)
  normalized = normalized.replace(/\b(\d+)\s*(kg|g|ml|l|ltr|pc|pcs|pack|dozen|liter|litre|kilogram|gram|milliliter)\b/g, '');
  normalized = normalized.replace(/\b(kg|g|ml|l|ltr|pc|pcs|pack|dozen|liter|litre|kilogram|gram|milliliter)\b/g, ''); // Units without numbers
  normalized = normalized.replace(/\b(\d+)\s*x\s*(\d+)\s*(g|ml)\b/g, ''); // e.g., 4 x 100g
  normalized = normalized.replace(/\b\d+(\.\d+)?\s*(kg|g|ml|l|ltr)\b/g, ''); // e.g. 1.5 kg
  
  // Remove brand names if they are common and might cause mismatches
  // This is tricky and domain-specific. Example:
  // normalized = normalized.replace(/\b(nestle|cadbury|amul|britannia)\b/g, '');
  
  // Remove special characters, except spaces
  normalized = normalized.replace(/[^\w\s]/gi, '');
  
  // Trim extra whitespace (multiple spaces, leading/trailing)
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Checks if two products are similar based on their normalized names and a similarity threshold.
 */
export function areProductsSimilar(
  name1: string, 
  name2: string, 
  threshold: number = SIMILARITY_THRESHOLD
): boolean {
  if (!name1 || !name2) return false;

  const normalizedName1 = normalizeProductName(name1);
  const normalizedName2 = normalizeProductName(name2);

  if (!normalizedName1 || !normalizedName2) return false; // If normalization results in empty string

  const similarity = stringSimilarity(normalizedName1, normalizedName2);
  return similarity >= threshold;
}
