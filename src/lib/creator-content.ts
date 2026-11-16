import musicVideoIds from "./music-videos.json";

export const NOTE_URL = "https://note.com/kentarok";

const musicVideos = new Set(musicVideoIds);

/** Retired publications are no longer public routes or searchable content. */
export function isRetiredContentPath(path: string): boolean {
  const normalized = `/${path.replace(/^\/+/, "")}`.split(/[?#]/)[0].replace(/\/+$/, "");
  return normalized === "/blog" || normalized.startsWith("/blog/") ||
    normalized === "/profile" || normalized === "/about";
}

/** Keep creative publications and the explicitly curated music-video collection. */
export function isCreatorWork(item: { source: string; url: string }): boolean {
  if (["note", "music", "podcast"].includes(item.source)) return true;
  if (item.source !== "video") return false;
  try {
    const url = new URL(item.url);
    if (!["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(url.hostname)) return false;
    const id = url.hostname === "youtu.be"
      ? url.pathname.split("/")[1]
      : url.searchParams.get("v") || url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1];
    return Boolean(id && musicVideos.has(id));
  } catch {
    return false;
  }
}

/** Also sanitize cached feed versions produced before the creator-site split. */
export function filterCreatorWorksFeed<T extends { source: string; url: string }>(feed: {
  allItems: T[];
  itemsByCategory: Record<string, T[]>;
  items?: T[];
  sources?: { type: string; [key: string]: unknown }[];
}) {
  const allowedCategories = new Set(["note", "music", "video", "podcast"]);
  return {
    ...feed,
    ...(feed.items ? { items: feed.items.filter(isCreatorWork) } : {}),
    allItems: feed.allItems.filter(isCreatorWork),
    itemsByCategory: Object.fromEntries(Object.entries(feed.itemsByCategory)
      .filter(([category]) => allowedCategories.has(category))
      .map(([category, items]) => [category, items.filter(isCreatorWork)])),
    ...(feed.sources ? { sources: feed.sources.filter(source => allowedCategories.has(source.type)) } : {}),
  };
}
