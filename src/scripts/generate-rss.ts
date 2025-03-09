import { generateRssFeed } from "../lib/rss";

async function main() {
	console.log("Generating RSS feeds...");

	try {
		// ブログのRSSフィードを生成
		const blogPosts = await generateRssFeed("blog");
		console.log(`Generated blog RSS feed with ${blogPosts.length} posts`);

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
