
/**
 * Calculates the similarity between two strings using the Levenshtein distance algorithm
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns A value between 0 and 1, where 1 means identical strings
 */
export function stringSimilarity(str1: string, str2: string): number {
  // Handle edge cases
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(str1, str2);
  
  // Convert to similarity score
  const maxLength = Math.max(str1.length, str2.length);
  const similarity = 1 - distance / maxLength;
  
  return similarity;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  // Create a matrix of size (m+1) x (n+1)
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,         // deletion
        dp[i][j - 1] + 1,         // insertion
        dp[i - 1][j - 1] + cost   // substitution
      );
    }
  }
  
  return dp[m][n];
}

// Utility functions for price extraction
export function extractPrice(priceString: string): number {
  const priceMatch = priceString.match(/[\d,]+(\.\d+)?/);
  if (!priceMatch) return 0;
  
  // Remove commas and convert to number
  return parseFloat(priceMatch[0].replace(/,/g, ''));
}
