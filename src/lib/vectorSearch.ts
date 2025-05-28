import { getPGliteInstance } from "./search";

// Initialize vector extension
export async function initializeVectorSearch() {
	const db = await getPGliteInstance();
	if (!db) return;

	try {
		// Enable vector extension
		await db.query("CREATE EXTENSION IF NOT EXISTS vector");

		// Add vector column to documents table if it doesn't exist
		await db.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='documents' AND column_name='embedding'
        ) THEN
          ALTER TABLE documents ADD COLUMN embedding vector(384);
          CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops);
        END IF;
      END $$;
    `);

		console.log("Vector search initialized successfully");
	} catch (error) {
		console.error("Error initializing vector search:", error);
	}
}

// Update document with embedding
export async function updateDocumentEmbedding(id: string, embedding: number[]) {
	const db = await getPGliteInstance();
	if (!db) return;

	try {
		await db.query("UPDATE documents SET embedding = $1 WHERE id = $2", [
			`[${embedding.join(",")}]`,
			id,
		]);
	} catch (error) {
		console.error("Error updating document embedding:", error);
	}
}

// Search documents by vector similarity
export async function searchByVector(embedding: number[], limit = 5) {
	const db = await getPGliteInstance();
	if (!db) return [];

	try {
		// First check if we have any documents with embeddings
		const countResult = await db.query<{ count: number }>(
			"SELECT COUNT(*) as count FROM documents WHERE embedding IS NOT NULL"
		);
		
		const embeddingCount = countResult.rows[0]?.count || 0;
		console.log(`Documents with embeddings: ${embeddingCount}`);
		
		if (embeddingCount === 0) {
			console.log("No documents have embeddings yet");
			return [];
		}
		
		const result = await db.query(
			`SELECT id, title, path, content, date, excerpt,
       1 - (embedding <=> $1) as similarity
       FROM documents
       WHERE embedding IS NOT NULL
       ORDER BY embedding <=> $1
       LIMIT $2`,
			[`[${embedding.join(",")}]`, limit],
		);

		return result.rows;
	} catch (error) {
		console.error("Error searching by vector:", error);
		return [];
	}
}

// Hybrid search combining keyword and vector search
export async function hybridSearch(
	query: string,
	embedding: number[],
	limit = 5,
) {
	const db = await getPGliteInstance();
	if (!db) return [];

	try {
		// Combine keyword search score and vector similarity
		const result = await db.query(
			`WITH keyword_search AS (
        SELECT 
          id,
          title,
          path,
          content,
          date,
          excerpt,
          ts_rank(to_tsvector('english', title), plainto_tsquery('english', $1)) +
          ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) as keyword_score
        FROM documents
        WHERE 
          to_tsvector('english', title) @@ plainto_tsquery('english', $1) OR
          to_tsvector('english', content) @@ plainto_tsquery('english', $1)
      ),
      vector_search AS (
        SELECT 
          id,
          1 - (embedding <=> $2) as vector_score
        FROM documents
        WHERE embedding IS NOT NULL
      )
      SELECT 
        k.id,
        k.title,
        k.path,
        k.content,
        k.date,
        k.excerpt,
        COALESCE(k.keyword_score, 0) * 0.5 + COALESCE(v.vector_score, 0) * 0.5 as combined_score
      FROM keyword_search k
      FULL OUTER JOIN vector_search v ON k.id = v.id
      WHERE k.id IS NOT NULL OR v.id IS NOT NULL
      ORDER BY combined_score DESC
      LIMIT $3`,
			[query, `[${embedding.join(",")}]`, limit],
		);

		return result.rows;
	} catch (error) {
		console.error("Error in hybrid search:", error);

		// Fall back to keyword search only
		try {
			const fallbackQuery = `
        SELECT id, title, path, content, date, excerpt
        FROM documents
        WHERE 
          title ILIKE $1 OR
          content ILIKE $1
        LIMIT $2
      `;

			const result = await db.query(fallbackQuery, [`%${query}%`, limit]);
			return result.rows;
		} catch (fallbackError) {
			console.error("Fallback search error:", fallbackError);
			return [];
		}
	}
}
