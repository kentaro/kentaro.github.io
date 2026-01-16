import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const photoDir = path.join(process.cwd(), "obsidian/public/photo");

export type PhotoGallery = {
	slug: string;
	title: string;
	description: string;
	images: string[];
	date?: string;
};

// 画像URLを抽出する正規表現
const imageRegex = /\[!\[image\]\(([^)]+)\)\]\([^)]+\)/g;

// すべてのフォトギャラリーのスラッグを取得
export function getAllPhotoSlugs(): string[] {
	if (!fs.existsSync(photoDir)) {
		return [];
	}

	const files = fs.readdirSync(photoDir);
	return files
		.filter((file) => file.endsWith(".md"))
		.map((file) => file.replace(/\.md$/, ""));
}

// 特定のフォトギャラリーのデータを取得
export function getPhotoGallery(slug: string): PhotoGallery | null {
	const filePath = path.join(photoDir, `${slug}.md`);

	if (!fs.existsSync(filePath)) {
		return null;
	}

	const fileContents = fs.readFileSync(filePath, "utf8");
	const { data, content } = matter(fileContents);

	// front matterからタイトルと日付を取得
	const title = data.title || slug;
	const date = data.date || undefined;

	// 画像URLを抽出
	const images: string[] = [];
	let match: RegExpExecArray | null;
	while ((match = imageRegex.exec(content)) !== null) {
		images.push(match[1]);
	}

	// 説明文を抽出（最初の画像URLより前のテキスト）
	const firstImageIndex = content.search(imageRegex);
	const description =
		firstImageIndex > 0 ? content.slice(0, firstImageIndex).trim() : "";

	return {
		slug,
		title,
		description,
		images,
		date,
	};
}

// 日付文字列をDateに変換するヘルパー
function parseJapaneseDate(dateStr: string): Date {
	const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
	if (match) {
		return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
	}
	return new Date(dateStr);
}

// すべてのフォトギャラリーを取得（日付の新しい順）
export function getAllPhotoGalleries(): PhotoGallery[] {
	const slugs = getAllPhotoSlugs();
	const galleries: PhotoGallery[] = [];

	for (const slug of slugs) {
		const gallery = getPhotoGallery(slug);
		if (gallery) {
			galleries.push(gallery);
		}
	}

	// 日付の新しい順にソート
	galleries.sort((a, b) => {
		if (!a.date && !b.date) return 0;
		if (!a.date) return 1;
		if (!b.date) return -1;
		return parseJapaneseDate(b.date).getTime() - parseJapaneseDate(a.date).getTime();
	});

	return galleries;
}
