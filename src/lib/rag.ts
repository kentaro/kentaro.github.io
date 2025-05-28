import type { GeminiSession } from "./gemini";
import {
	getPGliteInstance,
	initializeSearchDB,
} from "./search";
import { generateEmbedding } from "./embeddings";
import { searchByVector, initializeVectorSearch } from "./vectorSearch";

export interface RAGDocument {
	id: string;
	title: string;
	path: string;
	content: string;
	date?: string;
	excerpt?: string;
	similarity?: number;
}

interface VectorSearchResult {
	id: string;
	title: string;
	path: string;
	content: string;
	date?: string;
	excerpt?: string;
	similarity: number;
}

export interface RAGContext {
	query: string;
	documents: RAGDocument[];
}

// Filter documents for relevance using Gemini Nano
async function filterRelevantDocuments(
	session: GeminiSession,
	query: string,
	documents: RAGDocument[]
): Promise<RAGDocument[]> {
	if (documents.length === 0) return [];
	
	// 記事が5件以下の場合はフィルタリングをスキップ
	if (documents.length <= 5) {
		return documents;
	}

	// 記事数が多い場合はバッチ処理
	if (documents.length > 10) {
		const batchSize = 8;
		const results: RAGDocument[] = [];
		
		for (let i = 0; i < documents.length; i += batchSize) {
			const batch = documents.slice(i, i + batchSize);
			const batchResults = await filterRelevantDocuments(session, query, batch);
			results.push(...batchResults);
		}
		
		return results;
	}

	// 各記事の内容を適切な長さに制限（最大1500文字）
	const processedDocuments = documents.map(doc => ({
		...doc,
		content: doc.content.length > 1500 ? `${doc.content.substring(0, 1500)}...` : doc.content
	}));

	const filterPrompt = `ユーザーの質問: "${query}"

以下の記事の中から、この質問に関連性がありそうな記事を選んでください。少しでも関連がありそうなら含めてください。

記事一覧:
${processedDocuments.map((doc, index) => `${index + 1}. タイトル: ${doc.title}
内容: ${doc.content}`).join('\n\n')}

関連性の判断基準（緩い基準で判断してください）:
- 質問のキーワードに関連する内容が含まれている
- 質問のテーマと関係がありそう
- 間接的でも質問に関連する情報が含まれている可能性がある

重要: 迷った場合は含める方向で判断してください。明らかに無関係でない限り、選択してください。

回答形式:
関連する記事の番号のみを、カンマ区切りで回答してください。最低でも3件以上は選択してください。

例: 1,3,5,7,9

回答:`;

	try {
		const response = await session.prompt(filterPrompt);
		
		// 番号を解析して該当する記事を返す
		const selectedIndices = response
			.split(',')
			.map(num => Number.parseInt(num.trim(), 10) - 1)
			.filter(index => index >= 0 && index < documents.length);

		// フィルタリング結果が少なすぎる場合は上位記事を追加
		if (selectedIndices.length < 3) {
			const topIndices = documents.slice(0, Math.min(5, documents.length))
				.map((_, index) => index);
			return topIndices.map(index => documents[index]);
		}

		return selectedIndices.map(index => documents[index]);
	} catch (error) {
		console.error("Error filtering documents:", error);
		// エラー時は上位5件を返す
		return documents.slice(0, 5);
	}
}

// Search for relevant documents using vector search with AI filtering
export async function searchDocuments(
	session: GeminiSession,
	query: string,
	initialLimit = 10,
): Promise<RAGDocument[]> {

	// Ensure database is initialized
	let db = await getPGliteInstance();
	if (!db) {
		db = await initializeSearchDB();
		if (!db) {
			console.error("Failed to initialize database");
			return [];
		}
	}

	// Initialize vector search if needed
	await initializeVectorSearch();

	try {
		// Generate embedding for the query
		const embedding = await generateEmbedding(query);

		if (embedding) {
			// Try vector search with larger limit
			const vectorResults = await searchByVector(embedding, initialLimit);

			if (vectorResults && vectorResults.length > 0) {
				const allDocuments = (vectorResults as VectorSearchResult[]).map((row) => ({
					id: row.id,
					title: row.title,
					path: row.path,
					content: row.content,
					date: row.date,
					excerpt: row.excerpt,
					similarity: row.similarity,
				}));

				// Filter using Gemini Nano for relevance
				const relevantDocuments = await filterRelevantDocuments(session, query, allDocuments);
				
				// 最低でも3件は返すように保証
				if (relevantDocuments.length === 0 && allDocuments.length > 0) {
					return allDocuments.slice(0, Math.min(3, allDocuments.length));
				}
				
				return relevantDocuments;
			}
		}

		// No results found
		return [];
	} catch (error) {
		console.error("Error searching documents:", error);
		return [];
	}
}

// Create a prompt for RAG
export function createRAGPrompt(context: RAGContext): string {
	const contextText = context.documents
		.map(
			(doc) => {
				return `記事「${doc.title}」:
${doc.excerpt || doc.content.substring(0, 500)}...
Markdownリンク: [${doc.title}](${doc.path})`;
			}
		)
		.join("\n\n");


	return `あなたは栗林健太郎のウェブサイトのアシスタントです。

回答の指針:
1. 提供されたコンテキストの記事を中心に回答してください
2. 記事の内容から適切に情報を抽出し、わかりやすく説明してください
3. 記事に直接書かれていない内容については推測せず、「記事には詳細が書かれていません」と伝えてください
4. 全く関連する情報がない場合は、「提供された記事には関連する情報が見つかりませんでした」と答えてください

コンテキスト:
${contextText}

ユーザーの質問: ${context.query}

回答形式:
1. まず、ユーザーの質問に対して記事の内容に基づいた回答を提供してください
2. 回答の最後に、必ず以下のテキストをそのままコピーして追加してください

## 参考記事

${context.documents.map(doc => `- [${doc.title}](${doc.path})`).join('\n')}

重要指示:
- 参考記事セクションを一字一句そのままコピーしてください
- リンクの形式「[タイトル](パス)」を絶対に変更しないでください
- 必ずリンク形式で出力してください

正しい回答の構造:
[質問への回答内容]

## 参考記事

- [記事タイトル1](記事パス1)
- [記事タイトル2](記事パス2)
`;
}

// Generate a response using Gemini with RAG
export async function generateRAGResponse(
	session: GeminiSession,
	query: string,
): Promise<AsyncIterable<string>> {
	// Search for relevant documents with AI filtering
	const documents = await searchDocuments(session, query);

	if (documents.length === 0) {
		return (async function* () {
			yield `申し訳ございません。「${query}」に関する情報が見つかりませんでした。

以下の方法をお試しください：
- 別のキーワードで検索する
- より一般的な用語を使用する
- [ブログ一覧](/blog)や[日記一覧](/journal)から直接お探しの記事を見つける

お探しの情報が具体的にある場合は、より詳しいキーワードでお尋ねください。`;
		})();
	}

	// Create RAG context
	const context: RAGContext = {
		query,
		documents,
	};

	// Generate prompt
	const prompt = createRAGPrompt(context);

	// Check if session supports streaming
	if ("promptStreaming" in session && session.promptStreaming) {
		// Use streaming for GeminiSession
		const stream = session.promptStreaming(prompt);

		// Convert ReadableStream to AsyncIterable if needed
		if (stream && Symbol.asyncIterator in (stream as object)) {
			return stream as AsyncIterable<string>;
		}

		// If it's a ReadableStream, convert it
		return (async function* () {
			if (stream instanceof ReadableStream) {
				const reader = stream.getReader();
				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						yield new TextDecoder().decode(value);
					}
				} finally {
					reader.releaseLock();
				}
			} else {
				// Fallback
				const response = await session.prompt(prompt);
				yield response;
			}
		})();
	}

	// Fallback to regular prompt for TextSession
	return (async function* () {
		const response = await session.prompt(prompt);
		yield response;
	})();
}
