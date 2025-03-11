
/**
 * Calculate string similarity between two strings
 * Uses Levenshtein distance algorithm
 * Returns a value between 0 and 1, where 1 means identical
 */
export function string_similarity(s1: string, s2: string): number {
  // If either string is empty, return 0
  if (s1.length === 0 || s2.length === 0) {
    return 0;
  }
  
  // If strings are identical, return 1
  if (s1 === s2) {
    return 1;
  }
  
  // Calculate Levenshtein distance
  const track = Array(s2.length + 1).fill(null).map(() => 
    Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i += 1) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= s2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  
  // Calculate similarity based on the Levenshtein distance
  const maxLength = Math.max(s1.length, s2.length);
  const distance = track[s2.length][s1.length];
  return 1 - (distance / maxLength);
}
