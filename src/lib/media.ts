import fs from "node:fs";
import path from "node:path";
import musicVideoIds from "./music-videos.json";

export interface MediaItem {
	title: string;
	description: string;
	url: string;
	date: string;
	source: "video" | "music";
	sourceName: string;
	image: string | null;
}

export const MEDIA_CHANNELS = {
	youtube: "https://www.youtube.com/@kentarok",
	soundcloud: "https://soundcloud.com/kentarok",
};

export const MEDIA_ARCHIVE_PATH = path.join(process.cwd(), "public/data/media.json");

const musicVideos = new Set(musicVideoIds);

/** Explicit curation prevents unrelated talks, diaries, or demos entering the music page. */
export function isMusicVideo(value: string): boolean {
	const url = canonicalMediaUrl(value);
	return Boolean(url && musicVideos.has(new URL(url).searchParams.get("v") || ""));
}

export function canonicalMediaUrl(value: string): string | null {
	try {
		const url = new URL(value);
		if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(url.hostname)) {
			const id = url.hostname === "youtu.be"
				? url.pathname.split("/")[1]
				: url.searchParams.get("v") || url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1];
			return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube.com/watch?v=${id}` : null;
		}
		if (["soundcloud.com", "www.soundcloud.com"].includes(url.hostname) && /^\/kentarok\/[^/]+\/?$/.test(url.pathname)) {
			return `https://soundcloud.com${url.pathname.replace(/\/$/, "")}`;
		}
	} catch {
		// Ignore malformed upstream links.
	}
	return null;
}

function normalizeMediaItem(value: unknown): MediaItem | null {
	if (!value || typeof value !== "object") return null;
	const item = value as Record<string, unknown>;
	if (typeof item.url !== "string" || typeof item.title !== "string") return null;
	const url = canonicalMediaUrl(item.url);
	if (!url || !item.title.trim()) return null;
	const source = url.includes("youtube.com") ? "video" : "music";
	if (source === "video" && !isMusicVideo(url)) return null;
	const date = typeof item.date === "string" && Number.isFinite(Date.parse(item.date))
		? new Date(item.date).toISOString() : "";
	return {
		title: item.title.trim(),
		description: typeof item.description === "string" ? item.description : "",
		url,
		date,
		source,
		sourceName: source === "video" ? "YouTube" : "SoundCloud",
		image: typeof item.image === "string" && /^https?:\/\//.test(item.image) ? item.image : null,
	};
}

/** Later collections refresh metadata without dropping a saved date, description, or artwork. */
export function mergeMediaItems(...collections: unknown[][]): MediaItem[] {
	const byUrl = new Map<string, MediaItem>();
	for (const collection of collections) {
		for (const value of collection) {
			const item = normalizeMediaItem(value);
			if (!item) continue;
			const previous = byUrl.get(item.url);
			byUrl.set(item.url, {
				...item,
				date: item.date || previous?.date || "",
				description: item.description || previous?.description || "",
				image: item.image || previous?.image || null,
			});
		}
	}
	return Array.from(byUrl.values()).sort((a, b) =>
		(Date.parse(b.date) || 0) - (Date.parse(a.date) || 0) || a.title.localeCompare(b.title, "ja"));
}

function readItems(filePath: string): unknown[] {
	if (!fs.existsSync(filePath)) return [];
	const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
	if (Array.isArray(data)) return data;
	return data.allItems || data.items || [];
}

/** Reads checked-in history as well as the latest build's RSS additions. No network required. */
export function getMediaItems(): MediaItem[] {
	return mergeMediaItems(
		readItems(MEDIA_ARCHIVE_PATH),
		readItems(path.join(process.cwd(), "public/works/feed-data.json")),
	);
}

export function saveMediaItems(items: MediaItem[]): void {
	fs.mkdirSync(path.dirname(MEDIA_ARCHIVE_PATH), { recursive: true });
	const temporaryPath = `${MEDIA_ARCHIVE_PATH}.tmp`;
	fs.writeFileSync(temporaryPath, `${JSON.stringify({ items }, null, 2)}\n`);
	fs.renameSync(temporaryPath, MEDIA_ARCHIVE_PATH);
}
