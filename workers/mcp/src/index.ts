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
        "space-separated multi-term queries. Returns ranked hits with " +
        "snippets.",
      inputSchema: z.object({
        query: z.string().min(1).describe("Search query (Japanese or English)"),
        section: z
          .enum(["all", "blog", "journal"])
          .default("all")
          .describe("Restrict the search to a site section"),
        limit: z.number().int().min(1).max(50).default(10),
      }),
    },
    async ({ query, section, limit }) => {
      const documents = await getSearchDocuments();
      const scoped =
        section === "all"
          ? documents
          : documents.filter((doc) => sectionOf(doc) === section);
      const hits = searchDocuments(scoped, query, limit, documentUrl);
      return textResult({ query, section, total: hits.length, hits });
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
        "daily entries since 2002. Optionally filter by year and month. Use " +
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
