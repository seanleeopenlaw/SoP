// Helper function to calculate Levenshtein distance (for fuzzy matching)
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Helper function to find closest match with fuzzy matching
export function fuzzyMatch(input: string, options: string[]): string | undefined {
  const normalized = input.toLowerCase().trim();

  // First try exact match
  for (const option of options) {
    if (normalized === option.toLowerCase()) {
      return option;
    }
  }

  // Then try fuzzy match (allow 1-2 character difference)
  let bestMatch: string | undefined;
  let bestDistance = Infinity;

  for (const option of options) {
    const distance = levenshteinDistance(normalized, option.toLowerCase());

    // Allow typos: max distance of 2 for words, or 30% of length
    const maxAllowedDistance = Math.max(2, Math.floor(option.length * 0.3));

    if (distance < bestDistance && distance <= maxAllowedDistance) {
      bestDistance = distance;
      bestMatch = option;
    }
  }

  return bestMatch;
}
