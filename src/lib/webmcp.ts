// WebMCP (Web Model Context Protocol) tool registration.
//
// WebMCP is an emerging browser standard (https://github.com/webmachinelearning/webmcp)
// that lets a page expose structured tools to AI agents via
// navigator.modelContext / document.modelContext. It ships experimentally in
// Chrome 146+ and is used by browser agents such as Cloudflare Browser Run
// lab sessions. Registration is a no-op on browsers without the API.
//
// The toolset mirrors the remote MCP server in workers/mcp one-to-one (plus
// the browser-only open_page). Tool implementations live in siteTools.ts and
// are shared with the human-facing command palette UI.

import {
  getJournalByDate,
  getPage,
  loadPodcastData,
  loadSearchData,
  loadWorksData,
  onThisDay,
  randomPage,
  recentUpdates,
  searchPodcast,
  searchSite,
  siteStats,
  type SearchDocument,
} from "./siteTools";

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

const MAX_PAGE_CONTENT_CHARS = 40_000;

let registered = false;

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
      "Full-text search over this site's content (blog posts, journal entries, and profile of Kentaro Kuribayashi). Returns hits with path and snippet, newest first by default.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (Japanese or English)" },
        limit: { type: "number", description: "Maximum number of results" },
        sort: {
          type: "string",
          enum: ["new", "old", "relevance"],
          description: "Sort order: new (default), old, or relevance",
        },
      },
      required: ["query"],
    },
    async execute(input) {
      const query = String(input.query ?? "");
      const limit = clampLimit(input.limit, 10, 50);
      const sort = (["new", "old", "relevance"].includes(String(input.sort))
        ? String(input.sort)
        : "new") as "new" | "old" | "relevance";
      const hits = await searchSite(query, limit, sort);
      return textResult({ query, sort, total: hits.length, hits });
    },
  },
  {
    name: "get_profile",
    description:
      "Get the full profile of Kentaro Kuribayashi (site owner): bio, career history, research achievements, publications, and talks.",
    inputSchema: { type: "object", properties: {} },
    async execute() {
      const profile = await getPage("/profile");
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
      const path = String(input.path ?? "");
      const doc = await getPage(path);
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
        .filter((doc) => doc.path.startsWith("/blog/"))
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
        .filter((doc) => doc.path.startsWith("/journal/"))
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
      const doc = await getJournalByDate(date);
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
      const month = input.month === undefined ? undefined : Number(input.month);
      const day = input.day === undefined ? undefined : Number(input.day);
      const result = await onThisDay(month, day);
      return textResult({
        month: result.month,
        day: result.day,
        total: result.entries.length,
        entries: result.entries,
      });
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
      const section = String(input.section ?? "all") as "all" | "blog" | "journal";
      const doc = await randomPage(section);
      if (!doc) return textResult("No pages available.");
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
      const updates = await recentUpdates(limit);
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
      const episodes = await searchPodcast(query, limit);
      const hits = episodes.map((episode) => ({
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
      return textResult(await siteStats());
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
