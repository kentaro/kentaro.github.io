import type { GeminiSession } from "./gemini";
import {
	getPGliteInstance,
	checkDatabaseStatus,
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

// Search for relevant documents using keyword search
export async function searchDocuments(
	query: string,
	limit = 5,
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

	// Check database status
	const status = await checkDatabaseStatus();

	try {
		// Generate embedding for the query
		const embedding = await generateEmbedding(query);

		if (embedding) {
			// Try vector search
			const vectorResults = await searchByVector(embedding, limit);

			if (vectorResults && vectorResults.length > 0) {
				return (vectorResults as VectorSearchResult[]).map((row) => ({
					id: row.id,
					title: row.title,
					path: row.path,
					content: row.content,
					date: row.date,
					excerpt: row.excerpt,
					similarity: row.similarity,
				}));
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
URL: ${doc.path}`;
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
- 記事の内容に基づいて質問に答えてください
- 参照した記事は [記事タイトル](URL) の形式でリンクしてください
- 最後に「## 参考記事」セクションを追加してください

記事の内容を活用して、有用な回答を提供してください。
`;
}

// Generate a response using Gemini with RAG
export async function generateRAGResponse(
	session: GeminiSession,
	query: string,
): Promise<AsyncIterable<string>> {
	// Search for relevant documents
	const documents = await searchDocuments(query);

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
