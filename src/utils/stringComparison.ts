
import { stringSimilarity } from './string_similarity';

/**
 * Calculate the similarity between two product names, making adjustments for common
 * variations in how products might be listed
 */
export function areProductsSimilar(name1: string, name2: string, threshold = 0.6): boolean {
  // Simple pre-processing to normalize strings
  const normalizedName1 = normalizeProductName(name1);
  const normalizedName2 = normalizeProductName(name2);
  
  // Calculate similarity score
  const similarityScore = calculateSimilarity(normalizedName1, normalizedName2);
  
  // Debug log for monitoring matches
  console.log(`Comparing "${name1}" with "${name2}": ${similarityScore * 100}% similarity`);
  
  // Products are similar if similarity score is >= threshold (default 60%)
  return similarityScore >= threshold;
}

/**
 * Normalize product names by removing common words, standardizing format, etc.
 */
function normalizeProductName(name: string): string {
  // Convert to lowercase
  let normalized = name.toLowerCase();
  
  // Remove brand indicators
  normalized = normalized.replace(/\(.*?\)/g, '');
  
  // Remove common suffixes that don't help in matching
  const suffixesToRemove = [
    '- set of', '- pack of', 'combo', 'pack', 'family pack', 'value pack',
    'jumbo pack', 'mini pack', 'super saver', 'saver pack'
  ];
  
  suffixesToRemove.forEach(suffix => {
    normalized = normalized.replace(new RegExp(`\\s*${suffix}.*$`, 'i'), '');
  });
  
  // Remove common words that don't help in matching
  const wordsToRemove = [
    'premium', 'special', 'fresh', 'natural', 'organic', 'authentic',
    'traditional', 'homemade', 'gourmet', 'classic', 'regular', 'new',
    'improved', 'super', 'mega', 'mini', 'large', 'small', 'medium',
    'free', 'bundle', 'kit', 'set', 'value'
  ];
  
  const words = normalized.split(/\s+/);
  const filteredWords = words.filter(word => 
    !wordsToRemove.includes(word) && word.length > 1
  );
  
  normalized = filteredWords.join(' ');
  
  // Trim any excess whitespace
  normalized = normalized.trim();
  
  return normalized;
}

/**
 * Calculate string similarity using the string_similarity library
 */
function calculateSimilarity(str1: string, str2: string): number {
  return stringSimilarity(str1, str2);
}
