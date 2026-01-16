import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const photoDir = path.join(process.cwd(), "obsidian/public/photo");

export type PhotoGallery = {
	slug: string;
	title: string;
	description: string;
	images: string[];
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

	// front matterからタイトルを取得
	const title = data.title || slug;

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
	};
}

// すべてのフォトギャラリーを取得
export function getAllPhotoGalleries(): PhotoGallery[] {
	const slugs = getAllPhotoSlugs();
	const galleries: PhotoGallery[] = [];

	for (const slug of slugs) {
		const gallery = getPhotoGallery(slug);
		if (gallery) {
			galleries.push(gallery);
		}
	}

	return galleries;
}
