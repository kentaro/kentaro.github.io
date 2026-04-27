import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getAllMarkdownFiles } from "../lib/markdown";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

// プロジェクトルートからのパスを取得
const obsidianPublicDir = path.join(process.cwd(), "obsidian/public");
const outputPath = path.join(process.cwd(), "public/search-data.json");

interface SearchDocument {
	id: string;
	title: string;
	path: string;
	content: string;
	date?: string;
	excerpt?: string;
}

// マークダウンをHTMLに変換する関数
async function markdownToHtml(markdown: string) {
	// embedブロックを処理
	const processedContent = processEmbedBlocks(markdown);

	const processedHtml = await remark()
		.use(html, { sanitize: false })
		.use(remarkGfm)
		.process(processedContent);
	return processedHtml.toString();
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

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

// HTMLからタグを削除してプレーンテキストを取得する関数
function htmlToPlainText(html: string) {
	// HTMLタグを削除
	return html
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

async function generateSearchData() {
	console.log("Generating search data...");

	// すべてのMarkdownファイルを取得
	const markdownFiles = getAllMarkdownFiles();
	console.log(`Found ${markdownFiles.length} markdown files`);

	const searchDocuments: SearchDocument[] = [];

	// 各ファイルを処理
	for (const { slug, dirPath } of markdownFiles) {
		try {
			// ファイルパスを構築
			const filePath = path.join(dirPath, `${slug.split("/").pop()}.md`);

			// ファイルの存在を確認
			if (!fs.existsSync(filePath)) {
				console.log(`File does not exist: ${filePath}`);
				continue;
			}

			// ファイル内容を読み込む
			const fileContents = fs.readFileSync(filePath, "utf8");

			// front matterを解析
			const { data, content } = matter(fileContents);

			// ファイル名からタイトルを抽出
			const filename = path.basename(filePath);
			const title = data.title || filename.replace(/\.md$/, "");

			// URLパスを構築
			const urlPath = `/${slug}`;

			// 日付情報を取得
			let date = data.date;

			// 日記ファイルの場合はパスから日付を抽出
			if (!date && slug.includes("journal/")) {
				// パスパターン: journal/YYYY/MM/YYYY年MM月DD日
				const pathParts = slug.split("/");
				if (pathParts.length >= 3) {
					const year = pathParts[1]; // YYYY
					const month = pathParts[2]; // MM

					// ファイル名から日を抽出（YYYY年MM月DD日.md）
					const fileName = path.basename(filePath, ".md");
					const dayMatch = fileName.match(/(\d+)日$/);

					if (year && month && dayMatch && dayMatch[1]) {
						const day = dayMatch[1];
						// ISO形式の日付文字列を作成（YYYY-MM-DD）
						date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

						// 日付オブジェクトに変換して検証
						const dateObj = new Date(date);
						if (!Number.isNaN(dateObj.getTime())) {
							date = dateObj.toISOString();
						}
					}
				}
			} else if (date instanceof Date) {
				date = date.toISOString();
			} else if (typeof date === "string") {
				// YYYY-MM-DD形式の文字列をDateオブジェクトに変換
				const dateObj = new Date(date);
				if (!Number.isNaN(dateObj.getTime())) {
					date = dateObj.toISOString();
				}
			}

			// 抜粋を生成
			const excerpt = data.excerpt || `${content.slice(0, 160).trim()}...`;

			// マークダウンをHTMLに変換してからプレーンテキストに変換
			const htmlContent = await markdownToHtml(content);
			const plainTextContent = htmlToPlainText(htmlContent);

			// 検索ドキュメントを作成
			const searchDocument: SearchDocument = {
				id: slug,
				title,
				path: urlPath,
				content: plainTextContent, // HTMLタグを削除したコンテンツを使用
				date: date,
				excerpt,
			};

			searchDocuments.push(searchDocument);
			console.log(`Processed: ${slug}`);
		} catch (error) {
			console.error(`Error processing markdown file for slug ${slug}:`, error);
		}
	}

	console.log(`Generated ${searchDocuments.length} search documents`);

	// JSONファイルに書き込み
	fs.writeFileSync(outputPath, JSON.stringify(searchDocuments, null, 2));
	console.log(`Search data written to ${outputPath}`);
}

// スクリプトを実行
generateSearchData().catch((error) => {
	console.error("Error generating search data:", error);
	process.exit(1);
});
