import { pipeline } from "@xenova/transformers";

// biome-ignore lint/suspicious/noExplicitAny: Transformers.js types are complex
let embeddingPipeline: any = null;

// Initialize the embedding model
export async function initializeEmbeddingModel() {
	if (embeddingPipeline) return embeddingPipeline;

	try {
		// Use a lightweight multilingual model that works well for Japanese
		embeddingPipeline = await pipeline(
			"feature-extraction",
			"Xenova/multilingual-e5-small",
			{
				quantized: true,
				progress_callback: (data: { status: string; progress?: number }) => {
					if (data.status === "progress" && data.progress !== undefined) {
						console.log(`Loading model: ${Math.round(data.progress)}%`);
					}
				},
			},
		);

		console.log("Embedding model initialized");
		return embeddingPipeline;
	} catch (error) {
		console.error("Error initializing embedding model:", error);
		return null;
	}
}

// Generate embeddings for text
export async function generateEmbedding(
	text: string,
): Promise<number[] | null> {
	try {
		if (!embeddingPipeline) {
			embeddingPipeline = await initializeEmbeddingModel();
			if (!embeddingPipeline) return null;
		}

		// Truncate text to avoid token limit
		const maxLength = 512;
		const truncatedText =
			text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

		// Generate embeddings
		const output = await embeddingPipeline(truncatedText, {
			pooling: "mean",
			normalize: true,
		});

		// Convert to array
		const embedding = Array.from(output.data as Float32Array);
		return embedding;
	} catch (error) {
		console.error("Error generating embedding:", error);
		return null;
	}
}

// Batch generate embeddings for multiple texts
export async function generateEmbeddings(
	texts: string[],
): Promise<(number[] | null)[]> {
	const embeddings: (number[] | null)[] = [];

	for (const text of texts) {
		const embedding = await generateEmbedding(text);
		embeddings.push(embedding);
	}

	return embeddings;
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
	if (a.length !== b.length) {
		throw new Error("Vectors must have the same length");
	}

	let dotProduct = 0;
	let normA = 0;
	let normB = 0;

	for (let i = 0; i < a.length; i++) {
		dotProduct += a[i] * b[i];
		normA += a[i] * a[i];
		normB += b[i] * b[i];
	}

	normA = Math.sqrt(normA);
	normB = Math.sqrt(normB);

	if (normA === 0 || normB === 0) {
		return 0;
	}

	return dotProduct / (normA * normB);
}
