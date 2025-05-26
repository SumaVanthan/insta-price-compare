// backend/src/utils/string_similarity.ts

/**
 * Calculates the similarity between two strings using the Levenshtein distance.
 * The result is a value between 0 and 1, where 1 means the strings are identical.
 */
export function stringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0 && len2 === 0) return 1;
  if (len1 === 0 || len2 === 0) return 0;

  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calculate Levenshtein distance
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Deletion
        matrix[i][j - 1] + 1,      // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLength = Math.max(len1, len2);
  
  // Similarity score (0 to 1)
  return (maxLength - distance) / maxLength;
}

/**
 * Find the best match for a string from an array of strings.
 * Returns the best match and its similarity score.
 */
export function findBestMatch(mainString: string, targetStrings: string[]): { bestMatch: string | null, similarity: number } {
  if (!targetStrings || targetStrings.length === 0) {
    return { bestMatch: null, similarity: 0 };
  }

  let bestMatch = null;
  let highestSimilarity = 0;

  targetStrings.forEach(targetString => {
    const similarity = stringSimilarity(mainString, targetString);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = targetString;
    }
  });

  return { bestMatch, similarity: highestSimilarity };
}
