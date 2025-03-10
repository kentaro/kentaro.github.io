import { Feed } from "feed";
import fs from "node:fs";
import path from "node:path";
import { getAllMarkdownFiles, getMarkdownData } from "./markdown";

const SITE_URL = "https://kentarokuribayashi.com";
const AUTHOR_NAME = "栗林健太郎";

export async function generateRssFeed(type: "blog" | "journal") {
	const feed = new Feed({
		title: type === "blog" ? "栗林健太郎のブログ" : "栗林健太郎の日記",
		description:
			type === "blog"
				? "技術、マネジメント、読書などについての記事を掲載しています。"
				: "日々の活動や考えを記録しています。",
		id: SITE_URL,
		link: SITE_URL,
		language: "ja",
		image: `${SITE_URL}/images/profile.jpg`,
		favicon: `${SITE_URL}/favicon.ico`,
		copyright: `All rights reserved ${new Date().getFullYear()}, 栗林健太郎`,
		updated: new Date(),
		feedLinks: {
			rss2: `${SITE_URL}/${type}/feed`,
		},
		author: {
			name: AUTHOR_NAME,
			link: SITE_URL,
		},
	});

	// マークダウンファイルを取得
	const allFiles = getAllMarkdownFiles();
	const postsPromises = allFiles
		.filter(({ slug }) => slug.startsWith(`${type}/`))
		.map(async ({ slug }) => {
			const data = await getMarkdownData(slug);
			if (!data) return null;

			return {
				slug,
				title: data.title,
				date: data.date ? new Date(data.date) : new Date(),
				excerpt: data.excerpt,
				contentHtml: data.contentHtml,
			};
		});

	const posts = (await Promise.all(postsPromises)).filter(
		(post) => post !== null,
	) as {
		slug: string;
		title: string;
		date: Date;
		excerpt: string;
		contentHtml: string;
	}[];

	// 日付でソート（新しい順）
	posts.sort((a, b) => b.date.getTime() - a.date.getTime());

	// 最新10件を取得
	const recentPosts = posts.slice(0, 10);

	// フィードにアイテムを追加
	for (const post of recentPosts) {
		const url = `${SITE_URL}/${post.slug}`;

		feed.addItem({
			title: post.title,
			id: url,
			link: url,
			description: post.excerpt,
			content: post.contentHtml,
			author: [
				{
					name: AUTHOR_NAME,
				},
			],
			date: post.date,
		});
	}

	// 2つの場所にRSSフィードを生成
	// 1. publicディレクトリ（開発環境用）
	const publicDir = path.join(process.cwd(), "public");
	const publicTypeDir = path.join(publicDir, type);

	if (!fs.existsSync(publicDir)) {
		fs.mkdirSync(publicDir);
	}

	if (!fs.existsSync(publicTypeDir)) {
		fs.mkdirSync(publicTypeDir);
	}

	// RSSフィードを書き込み（開発環境用）
	fs.writeFileSync(path.join(publicTypeDir, "feed.xml"), feed.rss2());

	// 2. buildディレクトリ（本番環境用）
	// Next.jsの出力ディレクトリにも同じファイルを生成
	const buildDir = path.join(process.cwd(), "build");

	// buildディレクトリが存在しない場合は作成しない（ビルド時に自動生成されるため）
	if (fs.existsSync(buildDir)) {
		const buildTypeDir = path.join(buildDir, type);

		if (!fs.existsSync(buildTypeDir)) {
			fs.mkdirSync(buildTypeDir, { recursive: true });
		}

		// RSSフィードを書き込み（本番環境用）
		fs.writeFileSync(path.join(buildTypeDir, "feed.xml"), feed.rss2());
	}

	return recentPosts;
}
