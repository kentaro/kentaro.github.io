import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import xml2js from "xml2js";
import { Feed } from "feed";

// フィードのソース一覧
const FEED_SOURCES = [
	{
		url: "https://note.com/kentarok/rss",
		type: "note",
		name: "note",
	},
	{
		url: "https://zenn.dev/kentarok/feed",
		type: "tech-blog",
		name: "技術ブログ",
	},
	{
		url: "https://speakerdeck.com/kentaro.rss",
		type: "slide",
		name: "スライド",
	},
	{
		url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCePhLXeZjDdNEosOqpmD19A",
		type: "video",
		name: "動画",
	},
	{
		url: "https://feeds.soundcloud.com/users/soundcloud:users:188611416/sounds.rss",
		type: "music",
		name: "音楽",
	},
	{
		url: "https://listen.style/p/kentaro/rss",
		type: "podcast",
		name: "ポッドキャスト",
	},
];

// デバッグログをファイルに書き込む関数
function writeDebugLog(message: string): void {
	const logPath = path.resolve(__dirname, "../../debug-log.txt");
	fs.appendFileSync(logPath, `${message}\n`);
}

const SITE_URL = "https://kentarokuribayashi.com";
const AUTHOR_NAME = "栗林健太郎";

// フィード項目の型定義
interface FeedItem {
	title: string;
	description: string;
	url: string;
	date: Date;
	source: string;
	sourceName: string;
	image: string | null;
}

// RSS項目の型定義
interface RssItem {
	title?: string[];
	description?: string[];
	link?: string[];
	pubDate?: string[];
	enclosure?: Array<{ $?: { url?: string } }>;
	"media:thumbnail"?: Array<{ $?: { url?: string } } | string>;
	"media:content"?: Array<{ $?: { url?: string } }>;
	"media:group"?: Array<{
		"media:thumbnail"?: Array<{ $?: { url?: string } } | { url?: string }>;
		"media:description"?: string[];
		"media:title"?: string[];
	}>;
	"itunes:image"?: Array<{ $?: { href?: string } }>;
	[key: string]: unknown;
}

// Atom項目の型定義
interface AtomItem {
	title?: Array<string | { _: string }>;
	summary?: string[];
	content?: Array<string | { _: string }>;
	link?: Array<{ $?: { href?: string } }>;
	published?: string[];
	updated?: string[];
	"media:thumbnail"?: Array<{ $?: { url?: string } }>;
	"media:content"?: Array<{ $?: { url?: string } }>;
	[key: string]: unknown;
}

// HTMLタグを除去する関数
function stripHtml(html: string): string {
	return html.replace(/<\/?[^>]+(>|$)/g, "");
}

// フィードを取得して解析する関数
async function fetchAndParseFeed(
	source: (typeof FEED_SOURCES)[0],
): Promise<FeedItem[]> {
	console.log(`Fetching feed from ${source.url}...`);

	try {
		const response = await axios.get(source.url);
		// @ts-ignore
		const result = await xml2js.parseStringPromise(response.data);

		// RSSとAtomのフォーマットに対応
		let items: FeedItem[] = [];

		if (result.rss?.channel) {
			// RSS形式
			const rssItems = result.rss.channel[0].item || [];
			// @ts-ignore
			items = rssItems.map((item) => {
				const pubDate = new Date(item.pubDate?.[0] || new Date());

				// 画像を探す - フィードソースごとに最適な方法で
				let image: string | null = null;

				try {
					// noteの場合
					if (source.type === "note") {
						// @ts-ignore
						if (item["media:thumbnail"]) {
							// @ts-ignore
							if (typeof item["media:thumbnail"][0] === "string") {
								// @ts-ignore
								image = item["media:thumbnail"][0];
							} else if (item["media:thumbnail"][0]?.$?.url) {
								// @ts-ignore
								image = item["media:thumbnail"][0].$.url;
							}
						}
					}
					// YouTubeの場合
					else if (source.type === "video") {
						// 説明文の変数を先に宣言
						let description = item.description?.[0] || "";

						// YouTubeはenclosureタグに画像URLがある
						// @ts-ignore
						if (item.enclosure?.[0]?.$?.url) {
							// @ts-ignore
							image = item.enclosure[0].$.url;
						}
						// 見つからない場合はYouTubeのサムネイルURLを直接構築
						// @ts-ignore
						else if (item["yt:videoId"]?.[0]) {
							// @ts-ignore
							const videoId = item["yt:videoId"][0];
							image = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
						}

						// YouTubeの概要をmedia:groupの中のmedia:descriptionから取得
						try {
							// @ts-ignore
							if (item["media:group"]?.[0]) {
								// @ts-ignore
								const mediaGroup = item["media:group"][0];

								// media:descriptionを直接取得
								// @ts-ignore
								if (mediaGroup["media:description"]?.[0]) {
									// @ts-ignore
									description = mediaGroup["media:description"][0];
								}
							}
						} catch (error) {
							console.error("Error parsing YouTube description:", error);
						}

						// 概要文が取得できなかった場合はタイトルを使用
						if (!description && item.title?.[0]) {
							description = item.title[0];
						}

						// 概要文が取得できたらHTMLタグを除去
						if (description) {
							description = stripHtml(description);
							// 説明文を設定
							item.description = [description];
						}
					}
					// Zennの場合
					else if (source.type === "tech-blog") {
						// @ts-ignore
						image =
							item["media:content"]?.[0]?.$?.url ||
							item.enclosure?.[0]?.$?.url ||
							null;
					}
					// SpeakerDeckの場合
					else if (source.type === "slide") {
						// SpeakerDeckはdescriptionにimgタグがある
						if (item.description?.[0]) {
							const description = item.description[0];
							const imgMatch = description.match(
								/<img.*?src=['"](.*?)['"].*?>/,
							);
							if (imgMatch?.[1]) {
								image = imgMatch[1];
							}
						}
					}
					// SoundCloudの場合
					else if (source.type === "music") {
						// @ts-ignore
						image =
							item["itunes:image"]?.[0]?.$?.href ||
							item.enclosure?.[0]?.$?.url ||
							null;
					}
					// Podcastの場合
					else if (source.type === "podcast") {
						// @ts-ignore
						image =
							item["itunes:image"]?.[0]?.$?.href ||
							item.enclosure?.[0]?.$?.url ||
							null;
					}

					// 上記で見つからなかった場合のフォールバック
					if (!image) {
						// @ts-ignore
						image =
							item.enclosure?.[0]?.$?.url ||
							// @ts-ignore
							item["media:thumbnail"]?.[0]?.$?.url ||
							// @ts-ignore
							item["media:content"]?.[0]?.$?.url ||
							null;
					}
				} catch (e) {
					console.error("Error extracting image:", e);
				}

				// 説明文からHTMLタグを除去
				let description = item.description?.[0] || "";
				description = stripHtml(description);

				return {
					title: item.title?.[0] || "No Title",
					description: description,
					url: item.link?.[0] || "",
					date: pubDate,
					source: source.type,
					sourceName: source.name,
					image: image,
				};
			});
		} else if (result.feed) {
			// Atom形式
			const atomItems = result.feed.entry || [];
			// @ts-ignore
			items = atomItems.map((item) => {
				const pubDate = new Date(
					item.published?.[0] || item.updated?.[0] || new Date(),
				);

				// 画像を探す - Atom形式
				let image: string | null = null;

				try {
					// YouTubeの場合（Atom形式）
					// @ts-ignore
					if (source.type === "video" && item["yt:videoId"]) {
						// @ts-ignore
						const videoId = item["yt:videoId"][0];
						image = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

						// YouTubeの概要をmedia:groupの中のmedia:descriptionから取得
						try {
							// @ts-ignore
							if (item["media:group"]?.[0]) {
								// @ts-ignore
								const mediaGroup = item["media:group"][0];

								// media:descriptionを直接取得
								// @ts-ignore
								if (mediaGroup["media:description"]?.[0]) {
									// @ts-ignore
									const description = mediaGroup["media:description"][0];

									// 概要文が取得できたらHTMLタグを除去して設定
									item.summary = [stripHtml(description)];
								}
							}
						} catch (error) {
							console.error("Error parsing YouTube description:", error);
						}
					}
					// media:thumbnailがある場合
					// @ts-ignore
					else if (item["media:thumbnail"]?.[0]) {
						// @ts-ignore
						if (
							typeof item["media:thumbnail"][0] === "object" &&
							item["media:thumbnail"][0].$?.url
						) {
							// @ts-ignore
							image = item["media:thumbnail"][0].$.url;
						}
					}
					// media:contentがある場合
					// @ts-ignore
					else if (item["media:content"]?.[0]?.$?.url) {
						// @ts-ignore
						image = item["media:content"][0].$.url;
					}
					// contentにimgタグがある場合
					else if (item.content) {
						// @ts-ignore
						const content =
							typeof item.content[0] === "object" && item.content[0]._
								? // @ts-ignore
									item.content[0]._
								: typeof item.content[0] === "string"
									? item.content[0]
									: "";

						const imgMatch = String(content).match(
							/<img.*?src=['"](.*?)['"].*?>/,
						);
						if (imgMatch?.[1]) {
							image = imgMatch[1];
						}
					}
				} catch (e) {
					console.error("Error extracting image from Atom feed:", e);
				}

				// 説明文を取得してHTMLタグを除去
				let description = item.summary?.[0] || "";
				// @ts-ignore
				if (!description && item.content?.[0]) {
					// @ts-ignore
					description =
						typeof item.content[0] === "object"
							? item.content[0]._
							: item.content[0];
				}
				description = stripHtml(description);

				// @ts-ignore
				return {
					// @ts-ignore
					title:
						typeof item.title?.[0] === "object"
							? item.title[0]._
							: item.title?.[0] || "No Title",
					description: description,
					// @ts-ignore
					url: item.link?.[0]?.$?.href || "",
					date: pubDate,
					source: source.type,
					sourceName: source.name,
					image: image,
				};
			});
		}

		console.log(`Fetched ${items.length} items from ${source.name}`);
		return items;
	} catch (error) {
		console.error(`Error fetching feed from ${source.url}:`, error);
		return [];
	}
}

// メイン処理
async function generateCombinedFeed() {
	console.log("Generating combined feed...");

	// 全てのフィードを取得
	const allItemsPromises = FEED_SOURCES.map((source) =>
		fetchAndParseFeed(source),
	);
	const allItemsArrays = await Promise.all(allItemsPromises);

	// 全てのアイテムをフラット化
	const allItems = allItemsArrays.flat();

	// 日付でソート（新しい順）
	allItems.sort((a, b) => b.date.getTime() - a.date.getTime());

	// カテゴリごとのアイテムを保持
	const itemsByCategory: Record<string, FeedItem[]> = {};
	for (const source of FEED_SOURCES) {
		const sourceItems = allItems.filter((item) => item.source === source.type);
		itemsByCategory[source.type] = sourceItems;
	}

	// 最新100件に制限したアイテム（フィード用）
	const latestItems = allItems.slice(0, 100);

	// RSSフィードを生成
	const feed = new Feed({
		title: "栗林健太郎の制作物",
		description:
			"栗林健太郎のnote、技術ブログ、スライド、動画、音楽、ポッドキャストのまとめ",
		id: SITE_URL,
		link: `${SITE_URL}/works`,
		language: "ja",
		image: `${SITE_URL}/images/profile.jpg`,
		favicon: `${SITE_URL}/favicon.ico`,
		copyright: `All rights reserved ${new Date().getFullYear()}, ${AUTHOR_NAME}`,
		updated: new Date(),
		feedLinks: {
			rss2: `${SITE_URL}/works/feed`,
		},
		author: {
			name: AUTHOR_NAME,
			link: SITE_URL,
		},
	});

	// アイテムをフィードに追加
	for (const item of latestItems) {
		feed.addItem({
			title: item.title,
			id: item.url,
			link: item.url,
			description: item.description,
			content: item.description,
			date: item.date,
			image: item.image || undefined,
		});
	}

	// フィードをファイルに書き込み
	const outputDir = path.join(process.cwd(), "public", "works");
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	fs.writeFileSync(path.join(outputDir, "feed.xml"), feed.rss2());

	// フィードデータをJSONとして保存
	const feedData = {
		items: latestItems,
		allItems: allItems, // 全てのアイテム
		itemsByCategory: itemsByCategory, // カテゴリごとのアイテム
		sources: FEED_SOURCES,
		lastUpdated: new Date().toISOString(),
	};

	fs.writeFileSync(
		path.join(outputDir, "feed-data.json"),
		JSON.stringify(feedData, null, 2),
	);

	console.log(`Generated combined feed with ${latestItems.length} items`);
}

// 実行
generateCombinedFeed().catch(console.error);
