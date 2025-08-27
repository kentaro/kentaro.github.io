import { PGlite } from "@electric-sql/pglite";
import type { PGliteWithLive } from "@electric-sql/pglite/live";
import { vector } from "@electric-sql/pglite/vector";
import { live } from "@electric-sql/pglite/live";
import { useLiveQuery, usePGlite } from "@electric-sql/pglite-react";
import { getGlobalPglite, setGlobalPglite } from "@/lib/PGliteContext";
// Removed embedding-related imports - not needed for basic search

// 検索ドキュメントの型定義
export interface SearchDocument {
	id: string;
	title: string;
	path: string;
	content: string;
	date?: string;
	excerpt?: string;
}

// 進捗状況を追跡するための型
export interface LoadingProgress {
	isLoading: boolean;
	status: string;
	progress: number;
	total: number;
	error: string | null;
}

// 進捗状況を監視するためのコールバック型
export type ProgressCallback = (progress: LoadingProgress) => void;

// デフォルトの進捗状況
export const defaultProgress: LoadingProgress = {
	isLoading: false,
	status: "",
	progress: 0,
	total: 0,
	error: null,
};

// 現在の進捗状況を保持する変数
let currentProgress: LoadingProgress = { ...defaultProgress };

// 進捗状況を更新する関数
export function updateProgress(progress: Partial<LoadingProgress>): void {
	currentProgress = { ...currentProgress, ...progress };
}

// 現在の進捗状況を取得する関数
export function getCurrentProgress(): LoadingProgress {
	return { ...currentProgress };
}

// 進捗状況をリセットする関数
export function resetProgress(): void {
	currentProgress = { ...defaultProgress };
}

// PGliteのインスタンスを保持する変数
let db: PGliteWithLive | null = null;
let isDataLoaded = false;
let isInitializing = false;

// PGliteの初期化関数
export async function initializeSearchDB(onProgress?: ProgressCallback): Promise<PGliteWithLive | null> {
	// 既に初期化済みの場合は早期リターン
	if (db) {
		if (onProgress) {
			onProgress({
				isLoading: false,
				status: "すでに初期化されています",
				progress: 1,
				total: 1,
				error: null,
			});
		}
		return db;
	}
	
	// グローバル変数にDBがある場合はそれを使用
	const globalDB = getGlobalPglite();
	if (globalDB) {
		db = globalDB;
		if (onProgress) {
			onProgress({
				isLoading: false,
				status: "既存のデータベースを使用します",
				progress: 1,
				total: 1,
				error: null,
			});
		}
		return db;
	}
	
	// 初期化中の場合は重複呼び出しを防止
	if (isInitializing) {
		if (onProgress) {
			onProgress({
				isLoading: true,
				status: "初期化中...",
				progress: 0,
				total: 1,
				error: null,
			});
		}
		
		// 初期化完了を待つシンプルなポーリング
		return new Promise<PGliteWithLive | null>((resolve) => {
			const checkDB = () => {
				if (db) {
					if (onProgress) {
						onProgress({
							isLoading: false,
							status: "初期化完了",
							progress: 1,
							total: 1,
							error: null,
						});
					}
					resolve(db);
				} else if (!isInitializing) {
					if (onProgress) {
						onProgress({
							isLoading: false,
							status: "初期化失敗",
							progress: 0,
							total: 1,
							error: "データベースの初期化に失敗しました",
						});
					}
					resolve(null);
				} else {
					if (onProgress) {
						onProgress(getCurrentProgress());
					}
					setTimeout(checkDB, 100);
				}
			};
			checkDB();
		});
	}

	isInitializing = true;
	updateProgress({
		isLoading: true,
		status: "PGliteデータベースを初期化中...",
		progress: 0,
		total: 3,
		error: null,
	});
	
	if (onProgress) {
		onProgress(getCurrentProgress());
	}
	
	console.log("Initializing PGlite database...");

	// ブラウザ環境でのみ実行
	if (typeof window === "undefined") {
		isInitializing = false;
		updateProgress({
			isLoading: false,
			error: "サーバーサイドではPGliteを使用できません",
		});
		
		if (onProgress) {
			onProgress(getCurrentProgress());
		}
		
		return null;
	}

	try {
		// インメモリデータベースを作成（vectorエクステンションを含む）
		db = new PGlite({
			extensions: { vector, live }
		}) as unknown as PGliteWithLive;
		
		updateProgress({
			progress: 1,
			status: "データベースを作成中...",
		});
		
		if (onProgress) {
			onProgress(getCurrentProgress());
		}

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
		
		updateProgress({
			progress: 2,
			status: "全文検索インデックスを作成中...",
		});
		
		if (onProgress) {
			onProgress(getCurrentProgress());
		}

		// 全文検索インデックスを作成（個別のクエリとして実行）
		await db.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_title ON documents USING GIN (to_tsvector('english', title))
    `);

		await db.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_content ON documents USING GIN (to_tsvector('english', content))
    `);
		
		updateProgress({
			progress: 3,
			status: "初期化完了",
		});
		
		if (onProgress) {
			onProgress(getCurrentProgress());
		}

		console.log("PGlite database initialized");
		
		// グローバル変数に保存
		setGlobalPglite(db);

		return db;
	} catch (error) {
		console.error("Error initializing PGlite database:", error);
		db = null;
		updateProgress({
			isLoading: false,
			error: "データベースの初期化中にエラーが発生しました",
		});
		
		if (onProgress) {
			onProgress(getCurrentProgress());
		}
		
		return null;
	} finally {
		isInitializing = false;
	}
}

// 検索データをロードする関数
export async function loadSearchData(onProgress?: ProgressCallback) {
	// 既にデータがロード済みの場合は早期リターン
	if (isDataLoaded) {
		if (onProgress) {
			onProgress({
				isLoading: false,
				status: "データはすでにロード済みです",
				progress: 1,
				total: 1,
				error: null,
			});
		}
		return;
	}
	
	// データベースが初期化されていない場合は初期化
	if (!db) {
		db = await initializeSearchDB(onProgress);
		if (!db) return;
	}
	
	// Skip vector search initialization - not needed for basic search
	// await initializeVectorSearch();

	try {
		// 既存のデータを確認（既にロード済みかチェック）
		const { rows } = await db.query<{ count: number }>(
			"SELECT COUNT(*) as count FROM documents",
		);
		if (rows[0].count > 0) {
			console.log(`Database already contains ${rows[0].count} documents`);
			
			// Documents already loaded
			isDataLoaded = true;
			
			if (onProgress) {
				onProgress({
					isLoading: false,
					status: `${rows[0].count} 件のドキュメントがロード済みです`,
					progress: 1,
					total: 1,
					error: null,
				});
			}
			
			return;
		}

		console.log("Loading search data...");
		
		if (onProgress) {
			onProgress({
				isLoading: true,
				status: "検索データを取得中...",
				progress: 0,
				total: 100,
				error: null,
			});
		}

		// 検索データを取得
		const response = await fetch("/search-data.json");
		const searchData: SearchDocument[] = await response.json();

		console.log(`Loaded ${searchData.length} documents from search-data.json`);
		
		if (onProgress) {
			onProgress({
				isLoading: true,
				status: `${searchData.length} 件のドキュメントを処理します...`,
				progress: 0,
				total: searchData.length,
				error: null,
			});
		}

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

			const currentBatch = i / batchSize + 1;
			const totalBatches = Math.ceil(searchData.length / batchSize);
			console.log(
				`Inserted batch ${currentBatch} of ${totalBatches}`,
			);
			
			if (onProgress) {
				onProgress({
					isLoading: true,
					progress: Math.min(i + batchSize, searchData.length),
					status: `ドキュメントを挿入中... (${Math.min(i + batchSize, searchData.length)}/${searchData.length})`,
					total: searchData.length,
					error: null,
				});
			}
		}
		
		// Skip embedding generation - embeddings are not needed for basic search
		console.log("Skipping embedding generation - using full-text search only");

		isDataLoaded = true;
		console.log("Search data loaded successfully");
		
		if (onProgress) {
			onProgress({
				isLoading: false,
				status: "検索データのロードが完了しました",
				progress: searchData.length,
				total: searchData.length,
				error: null,
			});
		}
	} catch (error) {
		console.error("Error loading search data:", error);
		
		if (onProgress) {
			onProgress({
				isLoading: false,
				status: "エラーが発生しました",
				progress: 0,
				total: 0,
				error: "検索データのロード中にエラーが発生しました",
			});
		}
	}
}

// 検索を実行する関数
export async function searchDocuments(query: string) {
	// dbがなければグローバル変数も確認
	if (!db) {
		const globalDB = getGlobalPglite();
		if (globalDB) {
			db = globalDB;
		}
	}
	
	// それでもdbがなければ初期化を試みる
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
	// dbがなければグローバル変数も確認
	if (!db) {
		const globalDB = getGlobalPglite();
		if (globalDB) {
			db = globalDB;
		}
	}
	
	// それでもdbがなければ初期化を試みる
	if (!db) {
		db = await initializeSearchDB();
		if (!db) return null;
	}
	
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

// PGliteインスタンスを取得する関数
export async function getPGliteInstance(): Promise<PGliteWithLive | null> {
	// 既に初期化されている場合はそれを返す
	if (db) return db;
	
	// グローバル変数から取得を試みる
	const globalDB = getGlobalPglite();
	if (globalDB) {
		db = globalDB;
		return db;
	}
	
	// 初期化を試みる
	return await initializeSearchDB();
}

// デバッグ用: データベースの状態を確認
export async function checkDatabaseStatus(): Promise<{ initialized: boolean; documentCount: number }> {
	const database = await getPGliteInstance();
	if (!database) {
		return { initialized: false, documentCount: 0 };
	}
	
	try {
		const result = await database.query<{ count: number }>("SELECT COUNT(*) as count FROM documents");
		return { initialized: true, documentCount: result.rows[0]?.count || 0 };
	} catch (error) {
		console.error("Error checking database status:", error);
		return { initialized: true, documentCount: 0 };
	}
}
