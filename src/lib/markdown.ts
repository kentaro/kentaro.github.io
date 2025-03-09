import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

// プロジェクトルートからのパスを取得
const obsidianPublicDir = path.join(process.cwd(), "obsidian/public");

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
