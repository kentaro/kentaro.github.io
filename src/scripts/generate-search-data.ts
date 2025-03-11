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

// embedブロックをHTMLに変換する関数
function processEmbedBlocks(content: string): string {
	const embedRegex = /```embed\n([\s\S]*?)```/g;

	return content.replace(embedRegex, (match, embedContent) => {
		// embedの内容をパースする
		const embedData: Record<string, string> = {};
		const lines = embedContent.trim().split("\n");

		for (const line of lines) {
			const colonIndex = line.indexOf(":");
			if (colonIndex > 0) {
				const key = line.substring(0, colonIndex).trim();
				// 値は引用符を取り除く
				let value = line.substring(colonIndex + 1).trim();
				if (value.startsWith('"') && value.endsWith('"')) {
					value = value.substring(1, value.length - 1);
				}
				embedData[key] = value;
			}
		}

		// より単純なdivベースのレイアウト
		let html =
			'<div style="display:flex; flex-direction:column; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; margin:1.5rem 0; background-color:white; box-shadow:0 1px 2px rgba(0,0,0,0.05);">';

		// 画像部分
		if (embedData.image) {
			html += `<div style="width:100%; height:200px; overflow:hidden; position:relative; background-color:#f3f4f6;">
				<img src="${embedData.image}" alt="${embedData.title || ""}" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); max-width:100%; max-height:100%; width:auto; height:auto; object-fit:contain;" />
			</div>`;
		}

		// コンテンツ部分
		html += '<div style="padding:1rem;">';

		// タイトル
		if (embedData.title) {
			if (embedData.url) {
				html += `<a href="${embedData.url}" target="_blank" rel="noopener noreferrer" style="color:#3b82f6; text-decoration:none;">
					<div style="font-size:1.125rem; font-weight:700; margin-bottom:0.5rem;">${embedData.title}</div>
				</a>`;
			} else {
				html += `<div style="font-size:1.125rem; font-weight:700; margin-bottom:0.5rem;">${embedData.title}</div>`;
			}
		}

		// 説明
		if (embedData.description) {
			html += `<div style="color:#4b5563; font-size:0.875rem;">${embedData.description}</div>`;
		}

		// URLのみ（タイトルがない場合）
		if (embedData.url && !embedData.title) {
			html += `<a href="${embedData.url}" target="_blank" rel="noopener noreferrer" style="color:#3b82f6; font-size:0.875rem; display:block; margin-top:0.5rem;">${embedData.url}</a>`;
		}

		html += "</div>"; // コンテンツdivの終了

		// デスクトップ用のスタイル
		html +=
			"<style>@media (min-width: 768px) { .embed-card { flex-direction: row !important; } .embed-image { width: 240px !important; } }</style>";

		html += "</div>"; // 最外部divの終了

		return html;
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
			if (date instanceof Date) {
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
