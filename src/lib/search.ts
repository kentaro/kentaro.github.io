import { PGlite } from "@electric-sql/pglite";
import { useLiveQuery, usePGlite } from "@electric-sql/pglite-react";

// 検索ドキュメントの型定義
export interface SearchDocument {
	id: string;
	title: string;
	path: string;
	content: string;
	date?: string;
	excerpt?: string;
}

// PGliteのインスタンスを保持する変数
let db: PGlite | null = null;

// PGliteの初期化関数
export async function initializeSearchDB() {
	if (db) return db;

	console.log("Initializing PGlite database...");

	// ブラウザ環境でのみ実行
	if (typeof window === "undefined") return null;

	try {
		// インメモリデータベースを作成
		db = new PGlite();

		// 検索用テーブルを作成
		await db.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT,
        path TEXT,
        content TEXT,
        date TEXT,
        excerpt TEXT
      )
    `);

		// 全文検索インデックスを作成（個別のクエリとして実行）
		await db.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_title ON documents USING GIN (to_tsvector('english', title))
    `);

		await db.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_content ON documents USING GIN (to_tsvector('english', content))
    `);

		console.log("PGlite database initialized");

		return db;
	} catch (error) {
		console.error("Error initializing PGlite database:", error);
		return null;
	}
}

// 検索データをロードする関数
export async function loadSearchData() {
	if (!db) {
		db = await initializeSearchDB();
		if (!db) return;
	}

	try {
		// 既存のデータを確認
		const { rows } = await db.query<{ count: number }>(
			"SELECT COUNT(*) as count FROM documents",
		);
		if (rows[0].count > 0) {
			console.log(`Database already contains ${rows[0].count} documents`);
			return;
		}

		console.log("Loading search data...");

		// 検索データを取得
		const response = await fetch("/search-data.json");
		const searchData: SearchDocument[] = await response.json();

		console.log(`Loaded ${searchData.length} documents from search-data.json`);

		// バッチ処理でデータを挿入
		const batchSize = 100;
		for (let i = 0; i < searchData.length; i += batchSize) {
			const batch = searchData.slice(i, i + batchSize);

			for (const doc of batch) {
				await db.query(
					`INSERT INTO documents (id, title, path, content, date, excerpt) 
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            title = $2,
            path = $3,
            content = $4,
            date = $5,
            excerpt = $6`,
					[
						doc.id,
						doc.title,
						doc.path,
						doc.content,
						doc.date || null,
						doc.excerpt || null,
					],
				);
			}

			console.log(
				`Inserted batch ${i / batchSize + 1} of ${Math.ceil(searchData.length / batchSize)}`,
			);
		}

		console.log("Search data loaded successfully");
	} catch (error) {
		console.error("Error loading search data:", error);
	}
}

// 検索を実行する関数
export async function searchDocuments(query: string) {
	if (!db) {
		db = await initializeSearchDB();
		if (!db) return [];
	}

	if (!query.trim()) return [];

	try {
		// 検索クエリを作成
		const searchTerms = query.trim().split(/\s+/).filter(Boolean);

		if (searchTerms.length === 0) return [];

		// 特殊文字を含むかチェック
		const hasSpecialChars = searchTerms.some((term: string) =>
			/[&|!():'"<>@*~]/.test(term),
		);

		// ILIKE条件を作成
		const likeConditions = searchTerms
			.map(
				(_: string, i: number) =>
					`title ILIKE $${i + (hasSpecialChars ? 1 : 2)} OR content ILIKE $${i + (hasSpecialChars ? 1 : 2)}`,
			)
			.join(" OR ");
		const likeParams = searchTerms.map((term: string) => `%${term}%`);

		let sqlQuery: string;
		let params: string[];

		if (hasSpecialChars) {
			// 特殊文字を含む場合はILIKE検索のみを使用
			sqlQuery = `
				SELECT 
					id, 
					title, 
					path, 
					date,
					excerpt,
					1 AS rank
				FROM 
					documents
				WHERE 
					${likeConditions}
				ORDER BY
					date DESC NULLS LAST
				LIMIT 100
			`;
			params = likeParams;
		} else {
			// 特殊文字を含まない場合は全文検索とILIKE検索を組み合わせる
			// 各単語をtsqueryに変換
			const tsqueryTerms = searchTerms
				.map((term: string) => `${term}:*`)
				.join(" & ");

			sqlQuery = `
				SELECT 
					id, 
					title, 
					path, 
					date,
					excerpt,
					ts_rank_cd(to_tsvector('english', title), to_tsquery('english', $1)) * 2 +
					ts_rank_cd(to_tsvector('english', content), to_tsquery('english', $1)) AS rank
				FROM 
					documents
				WHERE 
					to_tsvector('english', title) @@ to_tsquery('english', $1) OR
					to_tsvector('english', content) @@ to_tsquery('english', $1) OR
					${likeConditions}
				ORDER BY 
					date DESC NULLS LAST,
					rank DESC
				LIMIT 100
			`;
			params = [tsqueryTerms, ...likeParams];
		}

		const { rows } = await db.query(sqlQuery, params);
		return rows;
	} catch (error) {
		console.error("Error searching documents:", error);
		return [];
	}
}

// 検索結果からスニペットを生成する関数
export async function getSearchSnippet(id: string, query: string) {
	if (!db) return null;
	if (!query.trim()) return null;

	try {
		// 検索クエリを作成
		const searchTerms = query.trim().split(/\s+/).filter(Boolean);

		if (searchTerms.length === 0) return null;

		// まず通常のクエリでコンテンツを取得
		const { rows: contentRows } = await db.query<{ content: string }>(
			"SELECT content FROM documents WHERE id = $1",
			[id],
		);

		if (!contentRows[0]?.content) return null;

		const content = contentRows[0].content;

		// 手動でスニペットを生成
		let snippet = "";
		const maxLength = 200;

		// 最初のキーワードが含まれる位置を探す
		let startPos = 0;
		for (const term of searchTerms) {
			const pos = content.toLowerCase().indexOf(term.toLowerCase());
			if (pos >= 0) {
				startPos = Math.max(0, pos - 50);
				break;
			}
		}

		// スニペットを抽出
		const endPos = Math.min(content.length, startPos + maxLength);
		snippet = content.substring(startPos, endPos);

		// スニペットの前後に省略記号を追加
		if (startPos > 0) snippet = `... ${snippet}`;
		if (endPos < content.length) snippet = `${snippet} ...`;

		// キーワードをハイライト
		for (const term of searchTerms) {
			try {
				// 正規表現の特殊文字をエスケープ
				const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
				const regex = new RegExp(`(${escapedTerm})`, "gi");
				snippet = snippet.replace(
					regex,
					'<mark class="bg-yellow-200 rounded px-1">$1</mark>',
				);
			} catch (regexError) {
				console.error(`Error creating regex for term "${term}":`, regexError);
				// エラーが発生した場合はそのキーワードをスキップ
			}
		}

		return snippet;
	} catch (error) {
		console.error("Error generating search snippet:", error);
		return null;
	}
}

// React Hooksを使用して検索を実行する
export async function searchDocumentsAsync(query: string) {
	// クエリが空の場合は空の配列を返す
	if (!query.trim()) return [];

	try {
		return await searchDocuments(query);
	} catch (error) {
		console.error("Error in searchDocumentsAsync:", error);
		return [];
	}
}

// 検索結果からスニペットを生成するReact Hook
export async function getSearchSnippetAsync(id: string, query: string) {
	// idまたはクエリが空の場合はnullを返す
	if (!id || !query.trim()) return null;

	try {
		return await getSearchSnippet(id, query);
	} catch (error) {
		console.error("Error in getSearchSnippetAsync:", error);
		return null;
	}
}
