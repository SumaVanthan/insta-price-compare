
/**
 * Calculate the similarity between two strings using the Levenshtein distance algorithm
 * adjusted for string lengths.
 */
export function stringSimilarity(str1: string, str2: string): number {
  // If either string is empty, return 0
  if (!str1.length || !str2.length) return 0;
  
  // If strings are identical, return 1
  if (str1 === str2) return 1;
  
  // Calculate Levenshtein distance
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Initialize matrix with dimensions (len1+1) x (len2+1)
  let matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
  
  // Fill the first row and column
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  // Calculate similarity score
  const distance = matrix[len1][len2];
  const maxLength = Math.max(len1, len2);
  
  // Return similarity as a value between 0 and 1
  return 1 - distance / maxLength;
}
