import assert from "node:assert/strict";
import { canonicalMediaUrl, getMediaItems, mergeMediaItems, type MediaItem } from "../lib/media";

const older: MediaItem = {
	title: "Music", description: "Saved description", url: "https://youtu.be/WLRj92Ojgm4",
	date: "2026-10-10T12:00:00Z", source: "video", sourceName: "YouTube", image: "https://i.ytimg.com/vi/WLRj92Ojgm4/hqdefault.jpg",
};
const newer: MediaItem = {
	...older, title: "Track", url: "https://soundcloud.com/kentarok/launch?utm_source=rss",
	date: "2026-10-11T12:00:00Z", source: "music", sourceName: "SoundCloud",
};
assert.equal(canonicalMediaUrl("https://www.youtube.com/shorts/WLRj92Ojgm4?feature=share"), "https://www.youtube.com/watch?v=WLRj92Ojgm4");
assert.equal(canonicalMediaUrl("https://www.youtube.com/watch?v=invalid"), null);
const merged = mergeMediaItems([older, newer], [{ ...older, title: "Updated", description: "", image: null, date: "" }]);
assert.equal(merged.length, 2, "Canonical links must deduplicate RSS and saved entries");
assert.equal(merged[0].url, "https://soundcloud.com/kentarok/launch", "Newest first");
assert.equal(merged[1].description, older.description, "Sparse RSS must preserve saved descriptions");
assert.equal(merged[1].image, older.image, "Sparse RSS must preserve saved artwork");
assert.equal(merged[1].date, "2026-10-10T12:00:00.000Z", "Sparse RSS must preserve publication dates");
assert.equal(merged[1].title, "Updated", "Metadata refresh must apply");
assert.equal(mergeMediaItems([older], []).length, 1, "Feed failure must preserve history");
assert.equal(mergeMediaItems([{ ...older, url: "https://www.youtube.com/watch?v=QJdcDBhSq9Q" }]).length, 0, "Unrelated uploads must not enter the music archive");
const items = getMediaItems();
assert.ok(items.length, "The durable archive must contain music");
assert.equal(new Set(items.map(item => item.url)).size, items.length);
assert.ok(items.every(item => item.title && Number.isFinite(Date.parse(item.date))), "All archived works need title and real publication dates");
console.log(`Media checks passed: ${items.filter(item => item.source === "video").length} YouTube music videos, ${items.filter(item => item.source === "music").length} SoundCloud tracks.`);
