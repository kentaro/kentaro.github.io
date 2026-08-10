// Data access layer for kentarokuribayashi.com public data files.
// All data is generated at site build time (see src/scripts/ in the repo root)
// and served as static JSON from the site itself, so this worker only needs
// read-only fetch access with in-isolate caching.

export const ORIGIN = "https://kentarokuribayashi.com";

const CACHE_TTL_MS = 15 * 60 * 1000;

export interface SearchDocument {
  id: string;
  title: string;
  path: string;
  content: string;
  date?: string;
  excerpt?: string;
}

export interface PodcastEpisode {
  title: string;
  description: string;
  pubDate: string;
  link: string;
  slug: string;
  audioUrl: string;
  duration?: string;
}

export interface PodcastData {
  title: string;
  description: string;
  imageUrl: string;
  episodes: PodcastEpisode[];
}

export interface WorkItem {
  title: string;
  description: string;
  url: string;
  date: string;
  source: string;
  sourceName: string;
  image: string | null;
}

export interface WorksFeedData {
  items: WorkItem[];
  allItems: WorkItem[];
  itemsByCategory: Record<string, WorkItem[]>;
  sources: { url: string; type: string; name: string }[];
  lastUpdated: string;
}

interface CacheEntry<T> {
  value: T;
  fetchedAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

async function fetchJsonCached<T>(path: string): Promise<T> {
  const cached = memoryCache.get(path) as CacheEntry<T> | undefined;
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.value;
  }

  const response = await fetch(`${ORIGIN}${path}`, {
    cf: { cacheTtl: 900, cacheEverything: true },
  } as RequestInit);
  if (!response.ok) {
    // Serve stale data if the origin is temporarily unavailable.
    if (cached) return cached.value;
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  const value = (await response.json()) as T;
  memoryCache.set(path, { value, fetchedAt: Date.now() });
  return value;
}

export function getSearchDocuments(): Promise<SearchDocument[]> {
  return fetchJsonCached<SearchDocument[]>("/search-data.json");
}

export function getPodcastData(): Promise<PodcastData> {
  return fetchJsonCached<PodcastData>("/data/podcast.json");
}

export function getWorksFeedData(): Promise<WorksFeedData> {
  return fetchJsonCached<WorksFeedData>("/works/feed-data.json");
}

export function documentUrl(doc: Pick<SearchDocument, "path">): string {
  return `${ORIGIN}${encodeURI(doc.path)}`;
}

export type SiteSection = "blog" | "journal" | "profile" | "other";

export function sectionOf(doc: Pick<SearchDocument, "path">): SiteSection {
  if (doc.path.startsWith("/blog/")) return "blog";
  if (doc.path.startsWith("/journal/")) return "journal";
  if (doc.path === "/profile") return "profile";
  return "other";
}
