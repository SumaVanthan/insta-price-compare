
/**
 * Calculate string similarity between two strings
 * Uses Levenshtein distance algorithm
 * Returns a value between 0 and 1, where 1 means identical
 */
export function stringSimilarity(s1: string, s2: string): number {
  // If either string is empty, return 0
  if (s1.length === 0 || s2.length === 0) {
    return 0;
  }
  
  // If strings are identical, return 1
  if (s1 === s2) {
    return 1;
  }
  
  // Normalize strings for better comparison
  const normalize = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  };
  
  const normalizedS1 = normalize(s1);
  const normalizedS2 = normalize(s2);
  
  // If normalized strings are identical, return 0.95 (high but not perfect match)
  if (normalizedS1 === normalizedS2) {
    return 0.95;
  }
  
  // Calculate Levenshtein distance
  const track = Array(normalizedS2.length + 1).fill(null).map(() => 
    Array(normalizedS1.length + 1).fill(null));
  
  for (let i = 0; i <= normalizedS1.length; i += 1) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= normalizedS2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= normalizedS2.length; j += 1) {
    for (let i = 1; i <= normalizedS1.length; i += 1) {
      const indicator = normalizedS1[i - 1] === normalizedS2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  
  // Calculate similarity based on the Levenshtein distance
  const maxLength = Math.max(normalizedS1.length, normalizedS2.length);
  if (maxLength === 0) return 1; // Both strings are empty after normalization
  
  const distance = track[normalizedS2.length][normalizedS1.length];
  return 1 - (distance / maxLength);
}

// Export a function to check if two product names are similar enough (80% threshold)
export function areProductsSimilar(name1: string, name2: string): boolean {
  const similarityThreshold = 0.8; // 80% similarity threshold as requested
  const similarity = stringSimilarity(name1, name2);
  console.log(`Comparing "${name1}" with "${name2}": ${similarity * 100}% similarity`);
  return similarity >= similarityThreshold;
}
