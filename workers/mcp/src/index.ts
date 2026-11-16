// Remote MCP server for kentarokuribayashi.com, running on Cloudflare Workers.
//
// Stateless MCP server (spec 2026-07-28) built with the Agents SDK
// createMcpHandler and MCP TypeScript SDK v2. The MCP endpoint is /mcp
// (Streamable HTTP). All tools are read-only views over the site's prebuilt
// static data files.

import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import { searchDocuments } from "./search";
import {
  ORIGIN,
  documentUrl,
  getPodcastData,
  getSearchDocuments,
  getWorksFeedData,
  sectionOf,
} from "./site-data";

const SERVER_NAME = "kentarokuribayashi-com";
const SERVER_VERSION = "1.0.0";
const MAX_PAGE_CONTENT_CHARS = 40_000;

function textResult(payload: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof payload === "string" ? payload : JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function errorResult(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

function createServer() {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions:
        "Tools for reading kentarokuribayashi.com, the personal website of " +
        "Kentaro Kuribayashi (a.k.a. antipop / あんちぽ), CTO of GMO Pepabo. " +
        "The site content is mostly written in Japanese. Use search_site for " +
        "full-text search, get_page to read a specific page, and the list_* " +
        "tools to enumerate blog posts, journal entries, podcast episodes, " +
        "and works/publications.",
    },
  );

  server.registerTool(
    "get_profile",
    {
      title: "Get profile",
      description:
        "Get the full profile of Kentaro Kuribayashi: bio, career history, " +
        "research achievements, publications, and talks. Returns plain text " +
        "in Japanese.",
      inputSchema: z.object({}),
    },
    async () => {
      const documents = await getSearchDocuments();
      const profile = documents.find((doc) => sectionOf(doc) === "profile");
      if (!profile) return errorResult("Profile document not found.");
      return textResult({
        title: profile.title,
        url: documentUrl(profile),
        content: profile.content.slice(0, MAX_PAGE_CONTENT_CHARS),
      });
    },
  );

  server.registerTool(
    "search_site",
    {
      title: "Search the site",
      description:
        "Full-text search over all site content (blog posts, journal/diary " +
        "entries, and profile). Supports Japanese substring queries and " +
        "space-separated multi-term queries. Returns hits with snippets, " +
        "newest first by default.",
      inputSchema: z.object({
        query: z.string().min(1).describe("Search query (Japanese or English)"),
        section: z
          .enum(["all", "blog", "journal"])
          .default("all")
          .describe("Restrict the search to a site section"),
        sort: z
          .enum(["new", "old", "relevance"])
          .default("new")
          .describe("Sort order: newest first, oldest first, or by relevance"),
        limit: z.number().int().min(1).max(100).default(10),
      }),
    },
    async ({ query, section, sort, limit }) => {
      const documents = await getSearchDocuments();
      const scoped =
        section === "all"
          ? documents
          : documents.filter((doc) => sectionOf(doc) === section);
      const hits = searchDocuments(scoped, query, limit, documentUrl, sort);
      return textResult({ query, section, sort, total: hits.length, hits });
    },
  );

  server.registerTool(
    "get_page",
    {
      title: "Get page content",
      description:
        "Get the full plain-text content of a page by its path (as returned " +
        "by search_site, list_blog_posts, or list_journal_entries). Example " +
        "paths: /profile, /blog/2025/03/..., /journal/2026/08/....",
      inputSchema: z.object({
        path: z.string().min(1).describe("Page path starting with /"),
      }),
    },
    async ({ path }) => {
      const documents = await getSearchDocuments();
      const normalized = decodeURI(path);
      const doc = documents.find((candidate) => candidate.path === normalized);
      if (!doc) {
        return errorResult(
          `No page found for path: ${normalized}. Use search_site or the list_* tools to discover valid paths.`,
        );
      }
      return textResult({
        title: doc.title,
        path: doc.path,
        url: documentUrl(doc),
        date: doc.date,
        content: doc.content.slice(0, MAX_PAGE_CONTENT_CHARS),
      });
    },
  );

  server.registerTool(
    "list_blog_posts",
    {
      title: "List blog posts",
      description:
        "List blog posts, newest first. Optionally filter by year. Use " +
        "get_page with the returned path to read the full text.",
      inputSchema: z.object({
        year: z.number().int().min(2000).max(2100).optional(),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    },
    async ({ year, limit }) => {
      const documents = await getSearchDocuments();
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
          url: documentUrl(doc),
          date: doc.date,
          excerpt: doc.excerpt,
        }));
      return textResult({ total: posts.length, posts });
    },
  );

  server.registerTool(
    "list_journal_entries",
    {
      title: "List journal entries",
      description:
        "List journal (diary) entries, newest first. The journal has near-" +
        "daily entries since 2015. Optionally filter by year and month. Use " +
        "get_page with the returned path to read the full text.",
      inputSchema: z.object({
        year: z.number().int().min(2000).max(2100).optional(),
        month: z.number().int().min(1).max(12).optional(),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    },
    async ({ year, month, limit }) => {
      const documents = await getSearchDocuments();
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
        .map((doc) => ({
          title: doc.title,
          path: doc.path,
          url: documentUrl(doc),
          date: doc.date,
        }));
      return textResult({ total: entries.length, entries });
    },
  );

  server.registerTool(
    "list_podcast_episodes",
    {
      title: "List podcast episodes",
      description:
        "List episodes of Kentaro Kuribayashi's podcast, newest first. The " +
        "podcast title and description are included in the response.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).default(20),
      }),
    },
    async ({ limit }) => {
      const podcast = await getPodcastData();
      const episodes = podcast.episodes.slice(0, limit).map((episode) => ({
        title: episode.title,
        description: episode.description,
        pubDate: episode.pubDate,
        url: `${ORIGIN}/podcast/${episode.slug}`,
        audioUrl: episode.audioUrl,
        duration: episode.duration,
      }));
      return textResult({
        podcast: { title: podcast.title, description: podcast.description },
        total: episodes.length,
        episodes,
      });
    },
  );

  server.registerTool(
    "list_works",
    {
      title: "List works and publications",
      description:
        "List recent works by Kentaro Kuribayashi aggregated from external " +
        "sources: note articles, tech blog posts, slides, videos, and music. " +
        "Optionally filter by category.",
      inputSchema: z.object({
        category: z
          .enum(["all", "note", "tech-blog", "slide", "video", "music"])
          .default("all"),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    },
    async ({ category, limit }) => {
      const feed = await getWorksFeedData();
      const source =
        category === "all" ? feed.allItems : (feed.itemsByCategory[category] ?? []);
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
  );

  server.registerTool(
    "get_journal_by_date",
    {
      title: "Get journal entry by date",
      description:
        "Get the journal (diary) entry for a specific date. The journal has " +
        "near-daily entries since 2015.",
      inputSchema: z.object({
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe("Date in YYYY-MM-DD format"),
      }),
    },
    async ({ date }) => {
      const documents = await getSearchDocuments();
      const doc = documents.find(
        (candidate) =>
          sectionOf(candidate) === "journal" &&
          candidate.date?.startsWith(date),
      );
      if (!doc) {
        return errorResult(
          `No journal entry found for ${date}. Use list_journal_entries to see which dates exist.`,
        );
      }
      return textResult({
        title: doc.title,
        path: doc.path,
        url: documentUrl(doc),
        date: doc.date,
        content: doc.content.slice(0, MAX_PAGE_CONTENT_CHARS),
      });
    },
  );

  server.registerTool(
    "on_this_day",
    {
      title: "On this day in past years",
      description:
        "Get journal entries for the same month/day across all years since " +
        "2015 - a time capsule view of what the author was doing on this " +
        "date in past years. Defaults to today (JST) when month/day are " +
        "omitted.",
      inputSchema: z.object({
        month: z.number().int().min(1).max(12).optional(),
        day: z.number().int().min(1).max(31).optional(),
        include_excerpt: z.boolean().default(true),
      }),
    },
    async ({ month, day, include_excerpt }) => {
      const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
      const targetMonth = month ?? now.getUTCMonth() + 1;
      const targetDay = day ?? now.getUTCDate();
      const suffix =
        `-${String(targetMonth).padStart(2, "0")}` +
        `-${String(targetDay).padStart(2, "0")}`;
      const documents = await getSearchDocuments();
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
          url: documentUrl(doc),
          date: doc.date,
          excerpt: include_excerpt
            ? doc.content.slice(0, 200).trim()
            : undefined,
        }));
      return textResult({
        month: targetMonth,
        day: targetDay,
        total: entries.length,
        entries,
      });
    },
  );

  server.registerTool(
    "random_page",
    {
      title: "Get a random page",
      description:
        "Get a randomly chosen page from the site - blog posts since 2002 and " +
        "near-daily journal entries since 2015. Useful for serendipity.",
      inputSchema: z.object({
        section: z.enum(["all", "blog", "journal"]).default("all"),
      }),
    },
    async ({ section }) => {
      const documents = await getSearchDocuments();
      const pool = documents.filter((doc) => {
        const docSection = sectionOf(doc);
        if (section === "all") return docSection === "blog" || docSection === "journal";
        return docSection === section;
      });
      if (pool.length === 0) return errorResult("No pages available.");
      const doc = pool[Math.floor(Math.random() * pool.length)];
      return textResult({
        title: doc.title,
        path: doc.path,
        url: documentUrl(doc),
        date: doc.date,
        content: doc.content.slice(0, MAX_PAGE_CONTENT_CHARS),
      });
    },
  );

  server.registerTool(
    "get_recent_updates",
    {
      title: "Get recent updates across the site",
      description:
        "Get the latest updates across all content types - blog posts, " +
        "journal entries, podcast episodes, and external works - merged and " +
        "sorted by date, newest first. A one-call overview of recent " +
        "activity.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).default(15),
      }),
    },
    async ({ limit }) => {
      const [documents, podcast, works] = await Promise.all([
        getSearchDocuments(),
        getPodcastData(),
        getWorksFeedData(),
      ]);
      const updates = [
        ...documents
          .filter((doc) => {
            const section = sectionOf(doc);
            return section === "blog" || section === "journal";
          })
          .map((doc) => ({
            type: sectionOf(doc) as string,
            title: doc.title,
            url: documentUrl(doc),
            date: doc.date ?? "",
          })),
        ...podcast.episodes.map((episode) => ({
          type: "podcast",
          title: episode.title,
          url: `${ORIGIN}/podcast/${episode.slug}`,
          date: new Date(episode.pubDate).toISOString(),
        })),
        ...works.allItems.map((item) => ({
          type: `work:${item.source}`,
          title: item.title,
          url: item.url,
          date: item.date,
        })),
      ]
        .filter((update) => update.date)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, limit);
      return textResult({ total: updates.length, updates });
    },
  );

  server.registerTool(
    "search_podcast",
    {
      title: "Search podcast episodes",
      description:
        "Full-text search over podcast episode titles and descriptions.",
      inputSchema: z.object({
        query: z.string().min(1).describe("Search query (Japanese or English)"),
        limit: z.number().int().min(1).max(100).default(10),
      }),
    },
    async ({ query, limit }) => {
      const podcast = await getPodcastData();
      const terms = query
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);
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
          url: `${ORIGIN}/podcast/${episode.slug}`,
          audioUrl: episode.audioUrl,
        }));
      return textResult({ query, total: hits.length, episodes: hits });
    },
  );

  server.registerTool(
    "site_stats",
    {
      title: "Get site statistics",
      description:
        "Get an overview of the site's content: document counts per " +
        "section, date ranges, podcast episode count, and works counts per " +
        "category. Useful for orienting before deeper exploration.",
      inputSchema: z.object({}),
    },
    async () => {
      const [documents, podcast, works] = await Promise.all([
        getSearchDocuments(),
        getPodcastData(),
        getWorksFeedData(),
      ]);
      const stats: Record<string, { count: number; first?: string; last?: string }> =
        {};
      for (const doc of documents) {
        const section = sectionOf(doc);
        const entry = (stats[section] ??= { count: 0 });
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
        website: ORIGIN,
        sections: stats,
        podcast: {
          title: podcast.title,
          episodes: podcast.episodes.length,
        },
        works: worksByCategory,
      });
    },
  );

  return server;
}

const mcpHandler = createMcpHandler(createServer);

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/mcp") {
      return mcpHandler(request, env, ctx);
    }
    if (url.pathname === "/") {
      return Response.json({
        name: SERVER_NAME,
        description: "Remote MCP server for kentarokuribayashi.com",
        mcp_endpoint: "/mcp",
        website: ORIGIN,
      });
    }
    return new Response("Not found", { status: 404 });
  },
};
