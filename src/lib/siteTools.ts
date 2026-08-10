// Shared site tool layer.
//
// These functions power both the WebMCP tool registration (src/lib/webmcp.ts,
// for AI agents) and the human-facing command palette UI. They operate on the
// same prebuilt static data files the site already ships.

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
  slug: string;
  audioUrl: string;
  duration?: string;
}

export interface PodcastData {
  title: string;
  description: string;
  episodes: PodcastEpisode[];
}

export interface WorkItem {
  title: string;
  description: string;
  url: string;
  date: string;
  source: string;
  sourceName: string;
}

export interface WorksFeedData {
  allItems: WorkItem[];
  itemsByCategory: Record<string, WorkItem[]>;
}

export interface SearchHit {
  title: string;
  path: string;
  date?: string;
  snippet: string;
  score: number;
  section: string;
}

export interface OnThisDayEntry {
  title: string;
  path: string;
  date?: string;
  excerpt: string;
}

export interface RecentUpdate {
  type: string;
  title: string;
  path: string;
  date: string;
}

export interface SiteStats {
  sections: Record<string, { count: number; first?: string; last?: string }>;
  podcast: { title: string; episodes: number };
  works: Record<string, number>;
}

const dataPromises = new Map<string, Promise<unknown>>();

function loadJson<T>(path: string): Promise<T> {
  let promise = dataPromises.get(path) as Promise<T> | undefined;
  if (!promise) {
    promise = fetch(path).then((response) => {
      if (!response.ok) {
        dataPromises.delete(path);
        throw new Error(`Failed to load ${path}: ${response.status}`);
      }
      return response.json() as Promise<T>;
    });
    dataPromises.set(path, promise);
  }
  return promise;
}

export const loadSearchData = () => loadJson<SearchDocument[]>("/search-data.json");
export const loadPodcastData = () => loadJson<PodcastData>("/data/podcast.json");
export const loadWorksData = () => loadJson<WorksFeedData>("/works/feed-data.json");

export function sectionOf(doc: Pick<SearchDocument, "path">): string {
  if (doc.path.startsWith("/blog/")) return "blog";
  if (doc.path.startsWith("/journal/")) return "journal";
  if (doc.path === "/profile") return "profile";
  return "other";
}

export type SearchSort = "new" | "old" | "relevance";

export async function searchSite(
  query: string,
  limit = 10,
  sort: SearchSort = "new",
): Promise<SearchHit[]> {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);
  if (terms.length === 0) return [];

  const documents = await loadSearchData();
  const hits: SearchHit[] = [];
  for (const doc of documents) {
    const title = doc.title.toLowerCase();
    const content = doc.content.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 10;
      let index = content.indexOf(term);
      let count = 0;
      while (index !== -1 && count < 20) {
        count += 1;
        index = content.indexOf(term, index + term.length);
      }
      score += count;
    }
    if (score === 0) continue;

    const firstIndex = content.indexOf(terms[0]);
    const start = Math.max(0, firstIndex - 60);
    const snippet = doc.content.slice(start, start + 160).trim();
    hits.push({
      title: doc.title,
      path: doc.path,
      date: doc.date,
      snippet,
      score,
      section: sectionOf(doc),
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

export async function getPage(path: string): Promise<SearchDocument | undefined> {
  const documents = await loadSearchData();
  const normalized = decodeURI(path);
  return documents.find((candidate) => candidate.path === normalized);
}

export async function getJournalByDate(
  date: string,
): Promise<SearchDocument | undefined> {
  const documents = await loadSearchData();
  return documents.find(
    (candidate) =>
      sectionOf(candidate) === "journal" && candidate.date?.startsWith(date),
  );
}

export async function onThisDay(
  month?: number,
  day?: number,
): Promise<{ month: number; day: number; entries: OnThisDayEntry[] }> {
  const now = new Date();
  const targetMonth = month ?? now.getMonth() + 1;
  const targetDay = day ?? now.getDate();
  const suffix =
    `-${String(targetMonth).padStart(2, "0")}` +
    `-${String(targetDay).padStart(2, "0")}`;
  const documents = await loadSearchData();
  const entries = documents
    .filter(
      (doc) =>
        sectionOf(doc) === "journal" &&
        doc.date !== undefined &&
        doc.date.slice(4, 10) === suffix,
    )
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .map((doc) => ({
      title: doc.title,
      path: doc.path,
      date: doc.date,
      excerpt: doc.content.slice(0, 160).replace(/\[\[|\]\]/g, "").trim(),
    }));
  return { month: targetMonth, day: targetDay, entries };
}

export async function randomPage(
  section: "all" | "blog" | "journal" = "all",
): Promise<SearchDocument | undefined> {
  const documents = await loadSearchData();
  const pool = documents.filter((doc) => {
    const docSection = sectionOf(doc);
    if (section === "all") return docSection === "blog" || docSection === "journal";
    return docSection === section;
  });
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function recentUpdates(limit = 15): Promise<RecentUpdate[]> {
  const [documents, podcast, works] = await Promise.all([
    loadSearchData(),
    loadPodcastData(),
    loadWorksData(),
  ]);
  return [
    ...documents
      .filter((doc) => {
        const section = sectionOf(doc);
        return section === "blog" || section === "journal";
      })
      .map((doc) => ({
        type: sectionOf(doc),
        title: doc.title,
        path: doc.path,
        date: doc.date ?? "",
      })),
    ...podcast.episodes.map((episode) => ({
      type: "podcast",
      title: episode.title,
      path: `/podcast/${episode.slug}`,
      date: new Date(episode.pubDate).toISOString(),
    })),
    ...works.allItems.map((item) => ({
      type: `work:${item.source}`,
      title: item.title,
      path: item.url,
      date: item.date,
    })),
  ]
    .filter((update) => update.date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export async function searchPodcast(
  query: string,
  limit = 10,
): Promise<PodcastEpisode[]> {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);
  if (terms.length === 0) return [];
  const podcast = await loadPodcastData();
  return podcast.episodes
    .filter((episode) => {
      const haystack = `${episode.title} ${episode.description}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    })
    .slice(0, limit);
}

export async function siteStats(): Promise<SiteStats> {
  const [documents, podcast, works] = await Promise.all([
    loadSearchData(),
    loadPodcastData(),
    loadWorksData(),
  ]);
  const sections: SiteStats["sections"] = {};
  for (const doc of documents) {
    const section = sectionOf(doc);
    const entry = (sections[section] ??= { count: 0 });
    entry.count += 1;
    if (doc.date) {
      const day = doc.date.slice(0, 10);
      if (!entry.first || day < entry.first) entry.first = day;
      if (!entry.last || day > entry.last) entry.last = day;
    }
  }
  const worksByCategory = Object.fromEntries(
    Object.entries(works.itemsByCategory).map(([key, items]) => [key, items.length]),
  );
  return {
    sections,
    podcast: { title: podcast.title, episodes: podcast.episodes.length },
    works: worksByCategory,
  };
}

export function isWebMcpAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as unknown as {
    modelContext?: unknown;
    modelContextTesting?: unknown;
  };
  const doc = document as unknown as { modelContext?: unknown };
  return Boolean(nav.modelContext ?? nav.modelContextTesting ?? doc.modelContext);
}
