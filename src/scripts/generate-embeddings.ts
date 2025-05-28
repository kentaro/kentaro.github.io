#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

// Dynamic import to handle ES module
async function loadTransformers() {
  const { pipeline } = await import("@xenova/transformers");
  return { pipeline };
}

interface SearchDocument {
  id: string;
  title: string;
  path: string;
  content: string;
  date?: string;
  excerpt?: string;
  embedding?: number[];
}

// Initialize the embedding model
async function initializeEmbeddingModel() {
  console.log("Loading embedding model...");
  const { pipeline } = await loadTransformers();
  const embeddingPipeline = await pipeline(
    "feature-extraction",
    "Xenova/multilingual-e5-small",
    {
      quantized: true,
      progress_callback: (data: { status: string; progress?: number }) => {
        if (data.status === "progress" && data.progress !== undefined) {
          process.stdout.write(`\rLoading model: ${Math.round(data.progress)}%`);
        }
      },
    },
  );
  console.log("\nEmbedding model loaded!");
  return embeddingPipeline;
}

// Generate embedding for text
async function generateEmbedding(
  pipeline: any,
  text: string,
): Promise<number[]> {
  // Truncate text to avoid token limit
  const maxLength = 512;
  const truncatedText =
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  // Generate embeddings
  const output = await pipeline(truncatedText, {
    pooling: "mean",
    normalize: true,
  });

  // Convert to array
  return Array.from(output.data as Float32Array);
}

async function main() {
  try {
    // Read existing search data
    console.log("Reading search data...");
    const searchDataPath = path.join(process.cwd(), "public", "search-data.json");
    const searchData: SearchDocument[] = JSON.parse(
      await fs.readFile(searchDataPath, "utf-8"),
    );
    console.log(`Found ${searchData.length} documents`);

    // Initialize embedding model
    const embeddingPipeline = await initializeEmbeddingModel();

    // Generate embeddings for each document
    console.log("\nGenerating embeddings...");
    const batchSize = 10;
    let processed = 0;

    for (let i = 0; i < searchData.length; i += batchSize) {
      const batch = searchData.slice(i, Math.min(i + batchSize, searchData.length));
      
      await Promise.all(
        batch.map(async (doc) => {
          try {
            // Generate embedding for document
            const textToEmbed = `${doc.title} ${doc.excerpt || doc.content.substring(0, 500)}`;
            doc.embedding = await generateEmbedding(embeddingPipeline, textToEmbed);
            processed++;
            
            if (processed % 10 === 0) {
              process.stdout.write(`\rProcessed: ${processed}/${searchData.length} documents`);
            }
          } catch (error) {
            console.error(`\nError generating embedding for ${doc.id}:`, error);
          }
        }),
      );
    }

    console.log(`\n\nSuccessfully generated embeddings for ${processed} documents`);

    // Save the data with embeddings
    const outputPath = path.join(process.cwd(), "public", "search-data-with-embeddings.json");
    await fs.writeFile(outputPath, JSON.stringify(searchData, null, 2));
    console.log(`Saved to ${outputPath}`);

    // Also save a compressed version
    const compressedPath = path.join(process.cwd(), "public", "search-data-with-embeddings.min.json");
    await fs.writeFile(compressedPath, JSON.stringify(searchData));
    console.log(`Saved compressed version to ${compressedPath}`);

    // Calculate file sizes
    const stats = await fs.stat(compressedPath);
    console.log(`\nFile size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Run the script
main();