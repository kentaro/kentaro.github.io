// WebMCP (Web Model Context Protocol) tool registration.
//
// WebMCP is an emerging browser standard (https://github.com/webmachinelearning/webmcp)
// that lets a page expose structured tools to AI agents via
// navigator.modelContext / document.modelContext. It ships experimentally in
// Chrome 146+ and is used by browser agents such as Cloudflare Browser Run
// lab sessions. Registration is a no-op on browsers without the API.
//
// The tools here mirror the remote MCP server in workers/mcp, backed by the
// same prebuilt static data files.

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

let registered = false;
let searchDataPromise: Promise<SearchDocument[]> | null = null;

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

function loadSearchData(): Promise<SearchDocument[]> {
  if (!searchDataPromise) {
    searchDataPromise = fetch("/search-data.json").then((response) => {
      if (!response.ok) {
        searchDataPromise = null;
        throw new Error(`Failed to load search data: ${response.status}`);
      }
      return response.json() as Promise<SearchDocument[]>;
    });
  }
  return searchDataPromise;
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

const tools: WebMcpTool[] = [
  {
    name: "search_site",
    description:
      "Full-text search over this site's content (blog posts, journal entries, and profile of Kentaro Kuribayashi). Returns ranked hits with path and snippet.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (Japanese or English)",
        },
        limit: {
          type: "number",
          description: "Maximum number of results (default 10)",
        },
      },
      required: ["query"],
    },
    async execute(input) {
      const query = String(input.query ?? "");
      const limit = Math.min(Math.max(Number(input.limit) || 10, 1), 50);
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
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Page path starting with /" },
      },
      required: ["path"],
    },
    async execute(input) {
      const path = decodeURI(String(input.path ?? ""));
      const documents = await loadSearchData();
      const doc = documents.find((candidate) => candidate.path === path);
      if (!doc) return textResult(`No page found for path: ${path}`);
      return textResult({
        title: doc.title,
        path: doc.path,
        date: doc.date,
        content: doc.content,
      });
    },
  },
  {
    name: "open_page",
    description:
      "Navigate the browser to a page on this site by its path (as returned by search_site or get_page).",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Page path starting with /" },
      },
      required: ["path"],
    },
    async execute(input) {
      const path = String(input.path ?? "/");
      window.location.href = path;
      return textResult(`Navigating to ${path}`);
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
