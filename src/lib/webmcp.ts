// WebMCP (Web Model Context Protocol) tool registration.
//
// WebMCP is an emerging browser standard (https://github.com/webmachinelearning/webmcp)
// that lets a page expose structured tools to AI agents via
// navigator.modelContext / document.modelContext. It ships experimentally in
// Chrome 146+ and is used by browser agents such as Cloudflare Browser Run
// lab sessions. Registration is a no-op on browsers without the API.
//
// The toolset mirrors the remote MCP server in workers/mcp one-to-one (plus
// the browser-only open_page), backed by the same prebuilt static data files.

interface WebMcpToolResult {
  content: { type: "text"; text: string }[];
}

interface WebMcpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<WebMcpToolResult>;
}

interface ModelContext {
  registerTool: (tool: WebMcpTool) => Promise<void> | void;
}

interface SearchDocument {
  id: string;
  title: string;
  path: string;
  content: string;
  date?: string;
  excerpt?: string;
}

interface PodcastEpisode {
  title: string;
  description: string;
  pubDate: string;
  slug: string;
  audioUrl: string;
  duration?: string;
}

interface PodcastData {
  title: string;
  description: string;
  episodes: PodcastEpisode[];
}

interface WorkItem {
  title: string;
  description: string;
  url: string;
  date: string;
  source: string;
  sourceName: string;
}

interface WorksFeedData {
  allItems: WorkItem[];
  itemsByCategory: Record<string, WorkItem[]>;
}

const MAX_PAGE_CONTENT_CHARS = 40_000;

let registered = false;
const dataPromises = new Map<string, Promise<unknown>>();

function getModelContext(): ModelContext | null {
  if (typeof window === "undefined") return null;
  const fromNavigator = (navigator as unknown as { modelContext?: ModelContext })
    .modelContext;
  const fromDocument = (document as unknown as { modelContext?: ModelContext })
    .modelContext;
  const context = fromNavigator ?? fromDocument ?? null;
  if (!context || typeof context.registerTool !== "function") return null;
  return context;
}

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

const loadSearchData = () => loadJson<SearchDocument[]>("/search-data.json");
const loadPodcastData = () => loadJson<PodcastData>("/data/podcast.json");
const loadWorksData = () => loadJson<WorksFeedData>("/works/feed-data.json");

function sectionOf(doc: Pick<SearchDocument, "path">): string {
  if (doc.path.startsWith("/blog/")) return "blog";
  if (doc.path.startsWith("/journal/")) return "journal";
  if (doc.path === "/profile") return "profile";
  return "other";
}

function textResult(payload: unknown): WebMcpToolResult {
  return {
    content: [
      {
        type: "text",
        text:
          typeof payload === "string" ? payload : JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function pageResult(doc: SearchDocument): WebMcpToolResult {
  return textResult({
    title: doc.title,
    path: doc.path,
    date: doc.date,
    content: doc.content.slice(0, MAX_PAGE_CONTENT_CHARS),
  });
}

function clampLimit(value: unknown, fallback: number, max: number): number {
  return Math.min(Math.max(Number(value) || fallback, 1), max);
}

function searchDocuments(
  documents: SearchDocument[],
  query: string,
  limit: number,
): { title: string; path: string; date?: string; snippet: string; score: number }[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);
  if (terms.length === 0) return [];

  const hits = [];
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
    const start = Math.max(0, firstIndex - 90);
    const snippet = doc.content.slice(start, start + 180).trim();
    hits.push({ title: doc.title, path: doc.path, date: doc.date, snippet, score });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}

const queryInput = {
  type: "object",
  properties: {
    query: { type: "string", description: "Search query (Japanese or English)" },
    limit: { type: "number", description: "Maximum number of results" },
  },
  required: ["query"],
};

const pathInput = {
  type: "object",
  properties: {
    path: { type: "string", description: "Page path starting with /" },
  },
  required: ["path"],
};

const tools: WebMcpTool[] = [
  {
    name: "search_site",
    description:
      "Full-text search over this site's content (blog posts, journal entries, and profile of Kentaro Kuribayashi). Returns ranked hits with path and snippet.",
    inputSchema: queryInput,
    async execute(input) {
      const query = String(input.query ?? "");
      const limit = clampLimit(input.limit, 10, 50);
      const documents = await loadSearchData();
      const hits = searchDocuments(documents, query, limit);
      return textResult({ query, total: hits.length, hits });
    },
  },
  {
    name: "get_profile",
    description:
      "Get the full profile of Kentaro Kuribayashi (site owner): bio, career history, research achievements, publications, and talks.",
    inputSchema: { type: "object", properties: {} },
    async execute() {
      const documents = await loadSearchData();
      const profile = documents.find((doc) => doc.path === "/profile");
      if (!profile) return textResult("Profile not found.");
      return textResult({ title: profile.title, content: profile.content });
    },
  },
  {
    name: "get_page",
    description:
      "Get the full plain-text content of a page on this site by its path (as returned by search_site).",
    inputSchema: pathInput,
    async execute(input) {
      const path = decodeURI(String(input.path ?? ""));
      const documents = await loadSearchData();
      const doc = documents.find((candidate) => candidate.path === path);
      if (!doc) return textResult(`No page found for path: ${path}`);
      return pageResult(doc);
    },
  },
  {
    name: "open_page",
    description:
      "Navigate the browser to a page on this site by its path (as returned by search_site or get_page).",
    inputSchema: pathInput,
    async execute(input) {
      const path = String(input.path ?? "/");
      window.location.href = path;
      return textResult(`Navigating to ${path}`);
    },
  },
  {
    name: "list_blog_posts",
    description:
      "List blog posts (since 2002), newest first. Optionally filter by year.",
    inputSchema: {
      type: "object",
      properties: {
        year: { type: "number", description: "Filter by year" },
        limit: { type: "number", description: "Maximum number of results" },
      },
    },
    async execute(input) {
      const year = input.year === undefined ? undefined : Number(input.year);
      const limit = clampLimit(input.limit, 20, 100);
      const documents = await loadSearchData();
      const posts = documents
        .filter((doc) => sectionOf(doc) === "blog")
        .filter((doc) =>
          year === undefined
            ? true
            : doc.date !== undefined && new Date(doc.date).getFullYear() === year,
        )
        .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
        .slice(0, limit)
        .map((doc) => ({
          title: doc.title,
          path: doc.path,
          date: doc.date,
          excerpt: doc.excerpt,
        }));
      return textResult({ total: posts.length, posts });
    },
  },
  {
    name: "list_journal_entries",
    description:
      "List journal (diary) entries (near-daily since 2015), newest first. Optionally filter by year and month.",
    inputSchema: {
      type: "object",
      properties: {
        year: { type: "number", description: "Filter by year" },
        month: { type: "number", description: "Filter by month (1-12)" },
        limit: { type: "number", description: "Maximum number of results" },
      },
    },
    async execute(input) {
      const year = input.year === undefined ? undefined : Number(input.year);
      const month = input.month === undefined ? undefined : Number(input.month);
      const limit = clampLimit(input.limit, 20, 100);
      const documents = await loadSearchData();
      const entries = documents
        .filter((doc) => sectionOf(doc) === "journal")
        .filter((doc) => {
          if (year === undefined && month === undefined) return true;
          if (!doc.date) return false;
          const date = new Date(doc.date);
          if (year !== undefined && date.getFullYear() !== year) return false;
          if (month !== undefined && date.getMonth() + 1 !== month) return false;
          return true;
        })
        .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
        .slice(0, limit)
        .map((doc) => ({ title: doc.title, path: doc.path, date: doc.date }));
      return textResult({ total: entries.length, entries });
    },
  },
  {
    name: "list_podcast_episodes",
    description: "List episodes of Kentaro Kuribayashi's podcast, newest first.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Maximum number of results" },
      },
    },
    async execute(input) {
      const limit = clampLimit(input.limit, 20, 100);
      const podcast = await loadPodcastData();
      const episodes = podcast.episodes.slice(0, limit).map((episode) => ({
        title: episode.title,
        description: episode.description?.slice(0, 300),
        pubDate: episode.pubDate,
        path: `/podcast/${episode.slug}`,
        audioUrl: episode.audioUrl,
      }));
      return textResult({
        podcast: { title: podcast.title, description: podcast.description },
        total: episodes.length,
        episodes,
      });
    },
  },
  {
    name: "list_works",
    description:
      "List recent works aggregated from external sources: note articles, tech blog posts, slides, videos, and music. Optionally filter by category (note, tech-blog, slide, video, music).",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Category filter: all, note, tech-blog, slide, video, music",
        },
        limit: { type: "number", description: "Maximum number of results" },
      },
    },
    async execute(input) {
      const category = String(input.category ?? "all");
      const limit = clampLimit(input.limit, 20, 100);
      const feed = await loadWorksData();
      const source =
        category === "all"
          ? feed.allItems
          : (feed.itemsByCategory[category] ?? []);
      const items = source.slice(0, limit).map((item) => ({
        title: item.title,
        url: item.url,
        date: item.date,
        category: item.source,
        categoryName: item.sourceName,
        description: item.description?.slice(0, 300),
      }));
      return textResult({ total: items.length, category, items });
    },
  },
  {
    name: "get_journal_by_date",
    description:
      "Get the journal (diary) entry for a specific date (YYYY-MM-DD). The journal has near-daily entries since 2015.",
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string", description: "Date in YYYY-MM-DD format" },
      },
      required: ["date"],
    },
    async execute(input) {
      const date = String(input.date ?? "");
      const documents = await loadSearchData();
      const doc = documents.find(
        (candidate) =>
          sectionOf(candidate) === "journal" &&
          candidate.date?.startsWith(date),
      );
      if (!doc) return textResult(`No journal entry found for ${date}.`);
      return pageResult(doc);
    },
  },
  {
    name: "on_this_day",
    description:
      "Get journal entries for the same month/day across all years since 2015 - a time capsule view of what the author was doing on this date in past years. Defaults to today when month/day are omitted.",
    inputSchema: {
      type: "object",
      properties: {
        month: { type: "number", description: "Month (1-12), defaults to today" },
        day: { type: "number", description: "Day (1-31), defaults to today" },
      },
    },
    async execute(input) {
      const now = new Date();
      const month = input.month === undefined ? now.getMonth() + 1 : Number(input.month);
      const day = input.day === undefined ? now.getDate() : Number(input.day);
      const suffix =
        `-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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
          excerpt: doc.content.slice(0, 200).trim(),
        }));
      return textResult({ month, day, total: entries.length, entries });
    },
  },
  {
    name: "random_page",
    description:
      "Get a randomly chosen page from the site - blog posts since 2002 and near-daily journal entries since 2015. Useful for serendipity.",
    inputSchema: {
      type: "object",
      properties: {
        section: {
          type: "string",
          description: "Section to pick from: all, blog, journal",
        },
      },
    },
    async execute(input) {
      const section = String(input.section ?? "all");
      const documents = await loadSearchData();
      const pool = documents.filter((doc) => {
        const docSection = sectionOf(doc);
        if (section === "all") {
          return docSection === "blog" || docSection === "journal";
        }
        return docSection === section;
      });
      if (pool.length === 0) return textResult("No pages available.");
      const doc = pool[Math.floor(Math.random() * pool.length)];
      return pageResult(doc);
    },
  },
  {
    name: "get_recent_updates",
    description:
      "Get the latest updates across all content types - blog posts, journal entries, podcast episodes, and external works - merged and sorted by date, newest first.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Maximum number of results" },
      },
    },
    async execute(input) {
      const limit = clampLimit(input.limit, 15, 50);
      const [documents, podcast, works] = await Promise.all([
        loadSearchData(),
        loadPodcastData(),
        loadWorksData(),
      ]);
      const updates = [
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
      return textResult({ total: updates.length, updates });
    },
  },
  {
    name: "search_podcast",
    description:
      "Full-text search over podcast episode titles and descriptions.",
    inputSchema: queryInput,
    async execute(input) {
      const query = String(input.query ?? "");
      const limit = clampLimit(input.limit, 10, 50);
      const terms = query
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);
      const podcast = await loadPodcastData();
      const hits = podcast.episodes
        .map((episode) => {
          const haystack =
            `${episode.title} ${episode.description}`.toLowerCase();
          const matched = terms.filter((term) => haystack.includes(term));
          return { episode, score: matched.length };
        })
        .filter((hit) => hit.score > 0 && hit.score === terms.length)
        .slice(0, limit)
        .map(({ episode }) => ({
          title: episode.title,
          description: episode.description?.slice(0, 300),
          pubDate: episode.pubDate,
          path: `/podcast/${episode.slug}`,
          audioUrl: episode.audioUrl,
        }));
      return textResult({ query, total: hits.length, episodes: hits });
    },
  },
  {
    name: "site_stats",
    description:
      "Get an overview of the site's content: document counts per section, date ranges, podcast episode count, and works counts per category.",
    inputSchema: { type: "object", properties: {} },
    async execute() {
      const [documents, podcast, works] = await Promise.all([
        loadSearchData(),
        loadPodcastData(),
        loadWorksData(),
      ]);
      const sections: Record<
        string,
        { count: number; first?: string; last?: string }
      > = {};
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
        Object.entries(works.itemsByCategory).map(([key, items]) => [
          key,
          items.length,
        ]),
      );
      return textResult({
        sections,
        podcast: { title: podcast.title, episodes: podcast.episodes.length },
        works: worksByCategory,
      });
    },
  },
];

export function registerWebMcpTools(): void {
  if (registered) return;
  const context = getModelContext();
  if (!context) return;
  registered = true;
  for (const tool of tools) {
    void Promise.resolve(context.registerTool(tool)).catch(() => {
      // Registration failures on experimental implementations are non-fatal.
    });
  }
}
