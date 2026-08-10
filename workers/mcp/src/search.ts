// Lexical search over the site's prebuilt search index (search-data.json).
// The index stores plain-text content extracted from the Obsidian sources at
// build time, so a simple term-frequency scoring works well for both Japanese
// substring queries and space-separated multi-term queries.

import type { IndexedSearchDocument } from "./site-data";

export interface SearchHit {
  title: string;
  path: string;
  url: string;
  date?: string;
  score: number;
  snippet: string;
}

const MAX_OCCURRENCES_PER_TERM = 20;
const TITLE_MATCH_BONUS = 10;
const ALL_TERMS_MULTIPLIER = 2;
const SNIPPET_RADIUS = 90;

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1 && count < MAX_OCCURRENCES_PER_TERM) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

function buildSnippet(content: string, terms: string[]): string {
  const lowered = content.toLowerCase();
  let firstIndex = -1;
  for (const term of terms) {
    const index = lowered.indexOf(term);
    if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
      firstIndex = index;
    }
  }
  if (firstIndex === -1) {
    return content.slice(0, SNIPPET_RADIUS * 2).trim();
  }
  const start = Math.max(0, firstIndex - SNIPPET_RADIUS);
  const end = Math.min(content.length, firstIndex + SNIPPET_RADIUS);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < content.length ? "…" : "";
  return `${prefix}${content.slice(start, end).trim()}${suffix}`;
}

export type SearchSort = "new" | "old" | "relevance";

export function searchDocuments(
  documents: IndexedSearchDocument[],
  query: string,
  limit: number,
  documentUrl: (doc: IndexedSearchDocument) => string,
  sort: SearchSort = "new",
): SearchHit[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0);
  if (terms.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const doc of documents) {
    const title = doc.titleLower;
    const content = doc.contentLower;

    let score = 0;
    let matchedTerms = 0;
    for (const term of terms) {
      const titleCount = countOccurrences(title, term);
      const contentCount = countOccurrences(content, term);
      if (titleCount + contentCount > 0) matchedTerms += 1;
      score += titleCount * TITLE_MATCH_BONUS + contentCount;
    }
    if (score === 0) continue;
    if (matchedTerms === terms.length && terms.length > 1) {
      score *= ALL_TERMS_MULTIPLIER;
    }

    hits.push({
      title: doc.title,
      path: doc.path,
      url: documentUrl(doc),
      date: doc.date,
      score,
      snippet: buildSnippet(doc.content, terms),
    });
  }

  sortHits(hits, sort);
  return hits.slice(0, limit);
}

// Undated documents (e.g. the profile) always rank after dated ones in the
// date-based orders; relevance breaks ties within the same date.
function sortHits(hits: SearchHit[], sort: SearchSort): void {
  hits.sort((a, b) => {
    if (sort === "relevance") return b.score - a.score;
    if (!a.date && !b.date) return b.score - a.score;
    if (!a.date) return 1;
    if (!b.date) return -1;
    const dateOrder =
      sort === "old" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    if (dateOrder !== 0) return dateOrder;
    return b.score - a.score;
  });
}
