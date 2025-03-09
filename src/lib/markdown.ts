import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

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
		// スラッグからファイルパスを構築
		const slugPath = `${slug}.md`;
		const filePath = path.join(dirPath, slugPath);

		console.log("Trying to read file:", filePath);

		// ファイルの存在を確認
		if (!fs.existsSync(filePath)) {
			console.log("File does not exist:", filePath);
			return null;
		}

		// ファイル内容を読み込む
		const fileContents = fs.readFileSync(filePath, "utf8");
		console.log("File contents length:", fileContents.length);

		// front matterを解析
		const { data, content } = matter(fileContents);
		console.log("Front matter data:", data);
		console.log("Content length:", content.length);

		// contentをHTML化
		const processedContent = await remark()
			.use(html, { sanitize: false })
			.use(remarkGfm)
			.process(content);
		const contentHtml = processedContent.toString();
		console.log("HTML content length:", contentHtml.length);

		// ファイル名からタイトルを抽出
		const filename = path.basename(filePath);
		const title = data.title || filename.replace(/\.md$/, "");

		// 日付をフォーマット (フロントマターから優先的に取得)
		let date = data.date;
		if (!date) {
			// フロントマターにdateがない場合はファイルパスから抽出
			const pathSegments = slug.split("/");
			// 例: journal/2025/03/2025年3月8日
			if (
				pathSegments.length >= 3 &&
				!Number.isNaN(Number.parseInt(pathSegments[1], 10))
			) {
				date = `${pathSegments[1]}-${pathSegments[2]}-01`;
			}
		}

		// 日付文字列をDateオブジェクトに変換してからISOString形式に統一
		if (date) {
			if (date instanceof Date) {
				date = date.toISOString();
			} else if (typeof date === "string") {
				// YYYY-MM-DD形式の文字列をDateオブジェクトに変換
				const dateObj = new Date(date);
				if (!Number.isNaN(dateObj.getTime())) {
					date = dateObj.toISOString();
				}
			} else {
				// どのケースにも当てはまらない場合は文字列に変換
				date = String(date);
			}
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
