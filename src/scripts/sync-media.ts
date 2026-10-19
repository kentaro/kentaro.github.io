/**
 * Full public-upload discovery (including Shorts and live archives):
 * npx ts-node --project tsconfig.node.json src/scripts/sync-media.ts
 * Requires yt-dlp on PATH only for this explicit maintenance task, never for builds.
 * To import previously fetched --dump-single-json results, pass both
 * --youtube-json <path> --soundcloud-json <path>.
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { getMediaItems, isMusicVideo, mergeMediaItems, saveMediaItems, type MediaItem } from "../lib/media";

interface ExtractedItem {
	id?: string;
	title?: string;
	description?: string;
	url?: string;
	webpage_url?: string;
	timestamp?: number;
	upload_date?: string;
	thumbnail?: string;
	thumbnails?: { url: string }[];
	entries?: ExtractedItem[];
	playlist_count?: number;
}

function extract(url: string, importPath?: string): ExtractedItem {
	const json = importPath ? fs.readFileSync(importPath, "utf8") : execFileSync("yt-dlp", [
		"--skip-download", "--dump-single-json", "--ignore-no-formats-error", "--no-warnings", url,
	], { encoding: "utf8", maxBuffer: 128 * 1024 * 1024, timeout: 30 * 60 * 1000 });
	return JSON.parse(json);
}

function flatten(item: ExtractedItem): ExtractedItem[] {
	if (!item.entries) return [item];
	if (item.playlist_count != null && item.playlist_count !== item.entries.length) {
		throw new Error(`Incomplete discovery for ${item.title}: expected ${item.playlist_count}, got ${item.entries.length}`);
	}
	return item.entries.flatMap(flatten);
}

function toMediaItem(item: ExtractedItem, source: MediaItem["source"]): MediaItem {
	let date = item.timestamp ? new Date(item.timestamp * 1000).toISOString() : "";
	if (!date && item.upload_date && /^\d{8}$/.test(item.upload_date)) {
		date = `${item.upload_date.slice(0, 4)}-${item.upload_date.slice(4, 6)}-${item.upload_date.slice(6, 8)}T00:00:00.000Z`;
	}
	if (!date || !item.title) throw new Error(`Missing title or publication date for ${item.id}; archive was not saved.`);
	return {
		title: item.title,
		description: item.description || "",
		url: item.webpage_url || item.url || (source === "video" ? `https://www.youtube.com/watch?v=${item.id}` : ""),
		date,
		source,
		sourceName: source === "video" ? "YouTube" : "SoundCloud",
		image: source === "video" ? `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`
			: item.thumbnail || item.thumbnails?.at(-1)?.url || null,
	};
}

function main() {
	const args = process.argv.slice(2);
	function option(name: string) {
		const index = args.indexOf(name);
		if (index < 0) return undefined;
		if (!args[index + 1] || args[index + 1].startsWith("--")) throw new Error(`Missing path for ${name}`);
		return args[index + 1];
	}
	const youtubePath = option("--youtube-json");
	const soundcloudPath = option("--soundcloud-json");
	if (Boolean(youtubePath) !== Boolean(soundcloudPath)) throw new Error("Provide both JSON files, or neither.");
	const youtube = flatten(extract("https://www.youtube.com/channel/UCePhLXeZjDdNEosOqpmD19A", youtubePath));
	const soundcloud = flatten(extract("https://soundcloud.com/kentarok/tracks", soundcloudPath));
	if (!youtube.length || !soundcloud.length) throw new Error("An upstream returned no uploads; archive was not saved.");
	const musicVideos = youtube.filter(item => isMusicVideo(item.webpage_url || item.url || `https://www.youtube.com/watch?v=${item.id}`));
	const discovered = [...musicVideos.map(item => toMediaItem(item, "video")), ...soundcloud.map(item => toMediaItem(item, "music"))];
	if (mergeMediaItems(discovered).length !== discovered.length) throw new Error("Invalid or duplicate upstream URLs; archive was not saved.");
	const items = mergeMediaItems(getMediaItems(), discovered);
	saveMediaItems(items);
	console.log(`Discovered ${youtube.length} YouTube uploads; selected ${musicVideos.length} music videos and ${soundcloud.length} SoundCloud tracks. Saved ${items.length} archived works.`);
}

try {
	main();
} catch (error) {
	console.error(error);
	process.exitCode = 1;
}
