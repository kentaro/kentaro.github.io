// Gemini Nano API wrapper for Chrome's built-in AI

// Extend Window interface for AI API
declare global {
	interface Window {
		ai?: {
			languageModel?: {
				capabilities(): Promise<GeminiCapabilities>;
				create(options?: {
					systemPrompt?: string;
					temperature?: number;
					topK?: number;
				}): Promise<GeminiSession>;
			};
		};
		// New global API
		LanguageModel?: {
			availability(): Promise<"readily" | "after-download" | "no" | "downloadable" | "available">;
			create(options?: {
				initialPrompts?: Array<{role: string; content: string}>;
				temperature?: number;
				topK?: number;
			}): Promise<GeminiSession>;
		};
	}
}

export interface TextSession {
	prompt(text: string): Promise<string>;
	promptStreaming?(text: string): ReadableStream;
	destroy(): void;
}

export interface GeminiCapabilities {
	available: "readily" | "after-download" | "no";
	defaultTemperature?: number;
	defaultTopK?: number;
	maxTopK?: number;
}

export interface GeminiSession {
	prompt(text: string): Promise<string>;
	promptStreaming(text: string): AsyncIterable<string>;
	destroy(): void;
}

export interface GeminiCreateOptions {
	temperature?: number;
	topK?: number;
	signal?: AbortSignal;
}

// Check if Gemini Nano is available
export async function checkGeminiAvailability(): Promise<boolean> {
	// Check new global API first
	if (typeof window.LanguageModel !== 'undefined') {
		try {
			const availability = await window.LanguageModel.availability();
			console.log("LanguageModel availability:", availability);
			
			// If downloadable, try to trigger download
			if (availability === "downloadable" || availability === "after-download") {
				console.log("Model needs to be downloaded. Please wait...");
				// You might want to trigger download here
				return true; // Still return true so we can try to create session
			}
			
			// "available" seems to be a valid response too
			if (availability === "readily" || availability === "available") {
				return true;
			}
			
			return false;
		} catch (error) {
			console.error("Error checking LanguageModel availability:", error);
		}
	}
	
	// Fallback to window.ai.languageModel
	if (window.ai?.languageModel) {
		try {
			const capabilities = await window.ai.languageModel.capabilities();
			console.log("Gemini capabilities:", capabilities);
			return capabilities.available !== "no";
		} catch (error) {
			console.error("Error checking Gemini availability:", error);
		}
	}
	
	return false;
}

// Get Gemini capabilities
export async function getGeminiCapabilities(): Promise<GeminiCapabilities | null> {
	if (!window.ai?.languageModel) {
		return null;
	}

	try {
		const capabilities = await window.ai.languageModel.capabilities();
		return capabilities;
	} catch (error) {
		console.error("Error getting Gemini capabilities:", error);
		return null;
	}
}

// Create a Gemini session
export async function createGeminiSession(
	systemPrompt: string,
	options: GeminiCreateOptions = {},
): Promise<GeminiSession | null> {
	// Try new global API first
	if (typeof window.LanguageModel !== 'undefined') {
		try {
			console.log("Creating LanguageModel session...");
			const session = await window.LanguageModel.create({
				initialPrompts: [{
					role: 'system',
					content: systemPrompt
				}],
				temperature: options.temperature,
				topK: options.topK,
			});
			console.log("Created LanguageModel session:", session);
			console.log("Session methods:", session ? Object.getOwnPropertyNames(Object.getPrototypeOf(session)) : 'null');
			return session;
		} catch (error) {
			console.error("Error creating LanguageModel session:", error);
			// If error is about downloading, provide helpful message
			if (error instanceof Error && error.message.includes('download')) {
				console.log("Model is being downloaded. This may take a few minutes...");
			}
			throw error; // Re-throw to handle in component
		}
	}
	
	// Fallback to window.ai.languageModel
	if (window.ai?.languageModel) {
		try {
			const session = await window.ai.languageModel.create({
				systemPrompt,
				temperature: options.temperature,
				topK: options.topK,
			});
			console.log("Created Gemini session:", session);
			return session;
		} catch (error) {
			console.error("Error creating Gemini session:", error);
		}
	}
	
	return null;
}
