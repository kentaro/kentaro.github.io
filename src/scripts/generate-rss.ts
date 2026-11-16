import { generateRssFeed } from "../lib/rss";
import { rmSync } from "node:fs";
import path from "node:path";

async function main() {
	console.log("Generating RSS feeds...");

	try {
		// Remove only generated retired feeds; original Markdown stays archived.
		for (const dir of ["public", "build"]) {
			rmSync(path.join(process.cwd(), dir, "blog/feed.xml"), { force: true });
		}

		// ジャーナルのRSSフィードを生成
		const journalPosts = await generateRssFeed("journal");
		console.log(`Generated journal RSS feed with ${journalPosts.length} posts`);

		console.log("RSS feed generation completed successfully");
	} catch (error) {
		console.error("Error generating RSS feeds:", error);
		process.exit(1);
	}
}

main();
