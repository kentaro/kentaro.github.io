import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

// プロジェクトルートからのパスを取得
const obsidianPublicDir = path.join(process.cwd(), "obsidian/public");

// HTMLエスケープ
function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

// URL からホスト名を抽出（先頭の www. は除去）
function extractHost(url: string): string {
	try {
		return new URL(url).host.replace(/^www\./, "");
	} catch {
		return "";
	}
}

// embedブロックをHTMLに変換する関数
function processEmbedBlocks(content: string): string {
	const embedRegex = /```embed\n([\s\S]*?)```/g;

	return content.replace(embedRegex, (_match, embedContent) => {
		const embedData: Record<string, string> = {};
		const lines = embedContent.trim().split("\n");

		for (const line of lines) {
			const colonIndex = line.indexOf(":");
			if (colonIndex > 0) {
				const key = line.substring(0, colonIndex).trim();
				let value = line.substring(colonIndex + 1).trim();
				if (value.startsWith('"') && value.endsWith('"')) {
					value = value.substring(1, value.length - 1);
				}
				embedData[key] = value;
			}
		}

		const url = embedData.url || "";
		const title = embedData.title || url;
		const description = embedData.description || "";
		const image = embedData.image || "";
		const host = extractHost(url);

		const safeUrl = escapeHtml(url);
		const safeTitle = escapeHtml(title);
		const safeDesc = escapeHtml(description);
		const safeImage = escapeHtml(image);
		const safeHost = escapeHtml(host);

		const imageBlock = image
			? `<div class="embed-image-container"><img class="embed-img" src="${safeImage}" alt="${safeTitle}" loading="lazy" /></div>`
			: "";

		const titleInner = url
			? `<a class="embed-title-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeTitle}</a>`
			: safeTitle;
		const titleBlock = title
			? `<div class="embed-title">${titleInner}</div>`
			: "";

		const descBlock = description
			? `<div class="embed-description">${safeDesc}</div>`
			: "";

		const metaBlock = host
			? `<div class="embed-meta"><span class="embed-host">${safeHost}</span></div>`
			: "";

		return `<div class="embed-card${image ? "" : " embed-card--no-image"}">${imageBlock}<div class="embed-content">${titleBlock}${descBlock}${metaBlock}</div></div>`;
	});
}

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

		// embedブロックを処理
		const processedContent = processEmbedBlocks(content);

		// contentをHTML化
		const processedHtml = await remark()
			.use(html, { sanitize: false })
			.use(remarkGfm)
			.process(processedContent);
		const contentHtml = processedHtml.toString();
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
				// ファイル名から日付を抽出（例: 2025年3月8日.md）
				const filename = pathSegments[pathSegments.length - 1];
				const dateMatch = filename.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);

				if (dateMatch) {
					// 日付形式に変換
					const year = Number.parseInt(dateMatch[1], 10);
					const month = Number.parseInt(dateMatch[2], 10);
					const day = Number.parseInt(dateMatch[3], 10);

					// 有効な日付かチェック
					if (
						!Number.isNaN(year) &&
						!Number.isNaN(month) &&
						!Number.isNaN(day)
					) {
						// 月と日が1桁の場合は0埋め
						const monthStr = month.toString().padStart(2, "0");
						const dayStr = day.toString().padStart(2, "0");
						date = `${year}-${monthStr}-${dayStr}`;
					}
				} else {
					// ファイル名から日付が抽出できない場合はディレクトリから推測
					date = `${pathSegments[1]}-${pathSegments[2]}-01`;
				}
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
