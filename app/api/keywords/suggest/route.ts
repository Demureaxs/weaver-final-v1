import { NextRequest, NextResponse } from 'next/server';

// --- Modifier Lists ---

const QUESTIONS = [
  'who',
  'what',
  'when',
  'where',
  'why',
  'how',
  'is',
  'are',
  'can',
  'do',
  'does',
  'which',
  'will',
  'how much',
  'how many',
  'how long',
  'how often',
];

const PREPOSITIONS = ['for', 'with', 'without', 'to', 'like', 'as', 'at', 'from', 'in', 'on', 'near', 'over', 'under', 'about'];

const COMPARISONS = ['vs', 'versus', 'or', 'and', 'like', 'better than', 'worse than', 'alternative to', 'similar to'];

const ALPHABETICAL = 'abcdefghijklmnopqrstuvwxyz'.split('');

interface KeywordMetrics {
  keyword: string;
  searchVolume: string;
  difficulty: string;
}

/**
 * Estimate search volume based on keyword characteristics
 * This is a simplified heuristic - not actual data
 */
function estimateSearchVolume(keyword: string, suggestionCount: number): string {
  const wordCount = keyword.split(' ').length;

  // Base estimate on suggestion count (more suggestions = more popular)
  let volume = suggestionCount * 100;

  // Shorter keywords tend to have higher volume
  if (wordCount <= 2) volume *= 2;
  if (wordCount >= 5) volume *= 0.5;

  // Format nicely
  if (volume >= 10000) return `${Math.round(volume / 1000)}K`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
  return volume.toString();
}

/**
 * Estimate keyword difficulty (0-100 scale)
 * Based on keyword length and characteristics
 */
function estimateDifficulty(keyword: string): string {
  const wordCount = keyword.split(' ').length;
  const charCount = keyword.length;

  let difficulty = 50; // Base difficulty

  // Shorter keywords are typically harder to rank for
  if (wordCount === 1) difficulty += 30;
  else if (wordCount === 2) difficulty += 15;
  else if (wordCount >= 4) difficulty -= 20;

  // Very short keywords are competitive
  if (charCount < 10) difficulty += 10;

  // Question keywords are often easier
  if (keyword.match(/^(who|what|when|where|why|how)/i)) difficulty -= 15;

  // Clamp between 0-100
  difficulty = Math.max(0, Math.min(100, difficulty));

  // Return difficulty category
  if (difficulty < 30) return 'Easy';
  if (difficulty < 60) return 'Medium';
  return 'Hard';
}

/**
 * A reusable function to fetch autocomplete suggestions for a single query.
 * Returns an array of strings or an empty array on error.
 */
async function fetchSuggestions(query: string): Promise<string[]> {
  const url = `http://google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Fetch error for query "${query}": ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
      return data[1] as string[];
    }
    return [];
  } catch (error: any) {
    console.error(`Error parsing suggestions for query "${query}": ${error.message}`);
    return [];
  }
}

/**
 * Processes a batch of queries in parallel, flattens, and de-duplicates the results.
 * Also adds metrics to each keyword.
 */
async function processBatch(queries: string[]): Promise<KeywordMetrics[]> {
  const promises = queries.map(fetchSuggestions);
  const results = await Promise.allSettled(promises);

  const allSuggestions = results
    .filter((result) => result.status === 'fulfilled' && result.value.length > 0)
    .flatMap((result) => (result as PromiseFulfilledResult<string[]>).value);

  // De-duplicate
  const uniqueSuggestions = Array.from(new Set(allSuggestions));

  // Add metrics to each keyword
  return uniqueSuggestions.map((keyword) => ({
    keyword,
    searchVolume: estimateSearchVolume(keyword, uniqueSuggestions.length),
    difficulty: estimateDifficulty(keyword),
  }));
}

// --- The Main API Handler ---

export async function POST(req: NextRequest) {
  const { keyword } = await req.json();

  if (!keyword) {
    return NextResponse.json({ message: 'Keyword is required' }, { status: 400 });
  }

  // 1. Create all query permutations
  const questionQueries = QUESTIONS.map((q) => `${q} ${keyword}`);
  const prepositionQueries = PREPOSITIONS.map((p) => `${keyword} ${p}`);
  const comparisonQueries = COMPARISONS.map((c) => `${keyword} ${c}`);
  const alphabeticalQueries = ALPHABETICAL.map((a) => `${keyword} ${a}`);

  try {
    // 2. Fetch all batches in parallel
    const [questions, prepositions, comparisons, alphabetical] = await Promise.all([
      processBatch(questionQueries),
      processBatch(prepositionQueries),
      processBatch(comparisonQueries),
      processBatch(alphabeticalQueries),
    ]);

    // 3. Return the structured, categorized response with metrics
    return NextResponse.json({
      suggestions: {
        questions,
        prepositions,
        comparisons,
        alphabetical,
      },
    });
  } catch (error: any) {
    console.error('Error processing suggestion batches:', error.message);
    return NextResponse.json({ message: 'Error fetching suggestions', error: error.message }, { status: 500 });
  }
}
