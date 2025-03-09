import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

// プロジェクトルートからのパスを取得
const obsidianPublicDir = path.join(process.cwd(), "obsidian/public");

// 公開可能なすべてのマークダウンファイルを取得
export function getAllMarkdownFiles(
	dirPath = obsidianPublicDir,
	basePath = "",
): {
	slug: string;
	dirPath: string;
}[] {
	if (!fs.existsSync(dirPath)) {
		return [];
	}

	const files = fs.readdirSync(dirPath);
	let markdownFiles: { slug: string; dirPath: string }[] = [];

	for (const file of files) {
		const filePath = path.join(dirPath, file);
		const relativePath = path.join(basePath, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			// ディレクトリの場合は再帰的に検索
			markdownFiles = markdownFiles.concat(
				getAllMarkdownFiles(filePath, relativePath),
			);
		} else if (file.endsWith(".md")) {
			// マークダウンファイルの場合はスラッグを作成
			const slug = relativePath.replace(/\.md$/, "");
			markdownFiles.push({ slug, dirPath });
		}
	}

	return markdownFiles;
}

// 特定のマークダウンファイルのデータを取得
export async function getMarkdownData(
	slug: string,
	dirPath = obsidianPublicDir,
) {
	try {
		// スラグからファイルパスを構築
		const slugPath = `${slug}.md`;
		const filePath = path.join(dirPath, slugPath);

		// ファイルの存在を確認
		if (!fs.existsSync(filePath)) {
			return null;
		}

		// ファイル内容を読み込む
		const fileContents = fs.readFileSync(filePath, "utf8");

		// front matterを解析
		const { data, content } = matter(fileContents);

		// contentをHTML化
		const processedContent = await remark().use(html).process(content);
		const contentHtml = processedContent.toString();

		// ファイル名からタイトルを抽出
		const filename = path.basename(filePath);
		const title = data.title || filename.replace(/\.md$/, "");

		// 日付をフォーマット (ファイルパスから抽出することも可能)
		let date = data.date;
		if (!date) {
			const pathSegments = slug.split("/");
			// 例: journal/2025/03/2025年3月8日
			if (
				pathSegments.length >= 3 &&
				!Number.isNaN(Number.parseInt(pathSegments[1], 10))
			) {
				date = `${pathSegments[1]}-${pathSegments[2]}-01`;
			}
		}

		// Dateオブジェクトを文字列に変換
		if (date instanceof Date) {
			date = date.toISOString();
		}

		// 抜粋を生成
		const excerpt = data.excerpt || `${content.slice(0, 160).trim()}...`;

		return {
			slug,
			title,
			date,
			excerpt,
			contentHtml,
			...data,
		};
	} catch (error) {
		console.error(`Error processing markdown file for slug ${slug}:`, error);
		return null;
	}
}

// カテゴリーの一覧を取得
export function getCategories() {
	const files = getAllMarkdownFiles();
	const categories = files.reduce(
		(acc, { slug }) => {
			const category = slug.split("/")[0];
			if (!acc[category]) {
				acc[category] = {
					name: category.charAt(0).toUpperCase() + category.slice(1),
					slug: category,
					count: 0,
				};
			}
			acc[category].count++;
			return acc;
		},
		{} as Record<string, { name: string; slug: string; count: number }>,
	);

	return Object.values(categories);
}
