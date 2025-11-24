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
      return []; // Return empty on fetch error
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
      return data[1] as string[];
    }
    return []; // Return empty if format is unexpected
  } catch (error: any) {
    console.error(`Error parsing suggestions for query "${query}": ${error.message}`);
    return []; // Return empty on parsing error
  }
}

/**
 * Processes a batch of queries in parallel, flattens, and de-duplicates the results.
 */
async function processBatch(queries: string[]): Promise<string[]> {
  const promises = queries.map(fetchSuggestions);
  const results = await Promise.allSettled(promises);

  const allSuggestions = results
    .filter((result) => result.status === 'fulfilled' && result.value.length > 0)
    .flatMap((result) => (result as PromiseFulfilledResult<string[]>).value);

  // De-duplicate and return
  return Array.from(new Set(allSuggestions));
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

    // 3. Return the structured, categorized response
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
