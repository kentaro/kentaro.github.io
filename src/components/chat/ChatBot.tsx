import {
	type GeminiSession,
	checkGeminiAvailability,
	createGeminiSession,
} from "@/lib/gemini";
import { generateRAGResponse } from "@/lib/rag";
import { initSearch, getInitializationStatus } from "@/lib/searchInitializer";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { useRouter } from "next/router";
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

interface Message {
	id: string;
	text: string;
	html?: string;
	sender: "user" | "bot";
	timestamp: Date;
}

// チャットの開閉状態をグローバルに管理（常にfalseで開始）
let globalIsOpen = false;

// Remarkプラグイン: リンクの処理
function remarkLinkProcessor() {
	return (tree: any) => {
		const visit = (node: any) => {
			if (node.type === 'link' && node.url) {
				// 外部リンクの場合
				if (node.url.startsWith('http')) {
					node.data = node.data || {};
					node.data.hProperties = node.data.hProperties || {};
					node.data.hProperties.target = '_blank';
					node.data.hProperties.rel = 'noopener noreferrer';
				}
				// 相対リンクの場合、そのまま保持
				// ブラウザのベースURLを使わずに相対パスを維持
			}
			if (node.children) {
				node.children.forEach(visit);
			}
		};
		visit(tree);
	};
}


// MarkdownをHTMLに変換する関数
async function parseMarkdown(text: string): Promise<string> {
	try {
		const result = await remark()
			.use(remarkGfm)
			.use(remarkLinkProcessor)
			.use(html, { sanitize: false })
			.process(text);
		return result.toString();
	} catch (error) {
		console.error("Markdown parsing error:", error);
		return text; // エラー時はプレーンテキストを返す
	}
}

// HTMLの相対リンクをNext.js Linkに変換するReactコンポーネント
function ChatMarkdown({ html }: { html: string }) {
	const router = useRouter();
	
	// HTMLを解析して相対リンクを見つける
	const createMarkup = () => {
		// 相対リンクのパターンを探す
		const processedHtml = html.replace(
			/<a\s+href="(\/[^"]*)"([^>]*)>([^<]*)<\/a>/g,
			(_match, href, attrs, linkText) => {
				// data-attributes を使ってNext.js Linkとして処理することをマーク
				return `<a href="${href}" data-nextjs-link="true"${attrs}>${linkText}</a>`;
			}
		);
		return { __html: processedHtml };
	};

	const handleClick = (e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		const link = target.closest('a[data-nextjs-link="true"]') as HTMLAnchorElement;
		
		if (link) {
			e.preventDefault();
			const href = link.getAttribute('href');
			if (href && href.startsWith('/')) {
				// Next.js routerを使ってナビゲート
				router.push(href);
			}
		}
	};

	return (
		<div 
			className="text-sm markdown-chat"
			dangerouslySetInnerHTML={createMarkup()}
			onClick={handleClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					handleClick(e as unknown as React.MouseEvent);
				}
			}}
			role="button"
			tabIndex={0}
		/>
	);
}

const ChatBotComponent: React.FC = () => {
	const [isOpen, setIsOpenState] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isAvailable, setIsAvailable] = useState(false);
	const [isInitializing, setIsInitializing] = useState(false);
	const [isDatabaseReady, setIsDatabaseReady] = useState(false);
	const [isDatabaseLoading, setIsDatabaseLoading] = useState(false);
	const [geminiSession, setGeminiSession] = useState<GeminiSession | null>(
		null,
	);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const hasCheckedAvailability = useRef(false);
	const currentBotMessageRef = useRef<HTMLDivElement>(null);
	const [currentBotMessageId, setCurrentBotMessageId] = useState<string | null>(null);
	const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
	
	// カスタムsetIsOpen関数でグローバル状態も更新
	const setIsOpen = useCallback((value: boolean) => {
		globalIsOpen = value;
		setIsOpenState(value);
		// Reset availability check flag when closing
		if (!value) {
			hasCheckedAvailability.current = false;
		}
	}, []);
	

	// Check Gemini availability when chat opens
	const checkAvailability = useCallback(async () => {
			// Prevent checking multiple times
			if (hasCheckedAvailability.current) {
				return;
			}
			
			setIsInitializing(true);
			hasCheckedAvailability.current = true;
			
			
			// Check if global LanguageModel exists first
			if (typeof window.LanguageModel !== 'undefined') {
				const available = await checkGeminiAvailability();
				if (available) {
					const systemPrompt = `あなたは、栗林健太郎のウェブサイトのアシスタントです。
ユーザーの質問に対して、提供されたコンテキストに基づいて回答してください。
回答は親切で分かりやすく、日本語で行ってください。
コンテキストに答えが見つからない場合は、その旨を伝えてください。

重要な指示:
1. 回答はMarkdown形式で記述してください
2. 情報の出典となった記事へのリンクを必ず含めてください
3. 回答の最後に「参考記事:」というセクションを設け、参照した記事へのリンクをリスト形式で記載してください`;
					
					try {
						const session = await createGeminiSession(systemPrompt);
						if (session) {
							setGeminiSession(session);
							setIsAvailable(true);
							setIsInitializing(false);
						} else {
							setIsInitializing(false);
						}
					} catch (error) {
						console.error("Session creation error:", error);
						setIsInitializing(false);
					}
				} else {
					setIsAvailable(false); // Important: Set this to false to prevent infinite loop
					setIsInitializing(false);
				}
				return;
			}
			
			// Check if AI API exists
			if (!window.ai) {
				setIsAvailable(false);
				setIsInitializing(false);
				return;
			}
			
			
			// Wait for API to be fully loaded if it's empty
			if (Object.keys(window.ai).length === 0) {
				// Wait and retry
				let retries = 0;
				const maxRetries = 10;
				const checkInterval = setInterval(() => {
					retries++;
					
					// Check if LanguageModel is available globally
					if (typeof window.LanguageModel !== 'undefined') {
						clearInterval(checkInterval);
						// Reset the flag to allow retry
						hasCheckedAvailability.current = false;
						checkAvailability(); // Retry the whole check
					} else if (window.ai && 'languageModel' in window.ai) {
						clearInterval(checkInterval);
						// Reset the flag to allow retry
						hasCheckedAvailability.current = false;
						checkAvailability(); // Retry the whole check
					} else if (window.ai && Object.keys(window.ai).length > 0) {
						clearInterval(checkInterval);
						// Reset the flag to allow retry
						hasCheckedAvailability.current = false;
						checkAvailability(); // Retry the whole check
					} else if (retries >= maxRetries) {
						if (typeof window.LanguageModel !== 'undefined') {
							clearInterval(checkInterval);
							// Reset the flag to allow retry
							hasCheckedAvailability.current = false;
							checkAvailability();
						} else {
							setIsAvailable(false); // Set to false to prevent infinite loop
							setIsInitializing(false);
							clearInterval(checkInterval);
						}
					}
				}, 1000);
				
				return;
			}
			
			// Check if languageModel is available in window.ai
			if ('languageModel' in window.ai) {
				// Check availability
				const available = await checkGeminiAvailability();
				
				if (available) {
					setIsAvailable(true);
					
					// Create session
					const systemPrompt = `あなたは、栗林健太郎のウェブサイトのアシスタントです。
ユーザーの質問に対して、提供されたコンテキストに基づいて回答してください。
回答は親切で分かりやすく、日本語で行ってください。
コンテキストに答えが見つからない場合は、その旨を伝えてください。

重要な指示:
1. 回答はMarkdown形式で記述してください
2. 情報の出典となった記事へのリンクを必ず含めてください
3. 回答の最後に「参考記事:」というセクションを設け、参照した記事へのリンクをリスト形式で記載してください`;
					
					const session = await createGeminiSession(systemPrompt);
					if (session) {
						setGeminiSession(session);
						setIsInitializing(false);
					} else {
						setIsInitializing(false);
					}
				}
				
				return;
			}
			
			if (!window.ai.languageModel) {
				setIsAvailable(false);
				setIsInitializing(false);
				return;
			}
			
			const available = await checkGeminiAvailability();
			setIsAvailable(available);

			if (available && !geminiSession) {
				const systemPrompt = `あなたは、栗林健太郎のウェブサイトのアシスタントです。
ユーザーの質問に対して、提供されたコンテキストに基づいて回答してください。
回答は親切で分かりやすく、日本語で行ってください。
コンテキストに答えが見つからない場合は、その旨を伝えてください。

重要な指示:
1. 回答はMarkdown形式で記述してください
2. 情報の出典となった記事へのリンクを必ず含めてください
3. 回答の最後に「参考記事:」というセクションを設け、参照した記事へのリンクをリスト形式で記載してください`;

				const session = await createGeminiSession(systemPrompt);
				setGeminiSession(session);
				setIsInitializing(false);
			} else {
				setIsInitializing(false);
			}
		}, [geminiSession]);

	// Initialize database when chat opens
	const initializeDatabase = useCallback(async () => {
		try {
			setIsDatabaseLoading(true);
			// 検索システム全体を初期化（データのロードも含む）
			const initStatus = getInitializationStatus();
			if (!initStatus.isInitialized || !initStatus.isDataLoaded) {
				await initSearch();
			}
			
			setIsDatabaseReady(true);
			setIsDatabaseLoading(false);
		} catch (error) {
			console.error("Database initialization error:", error);
			setIsDatabaseReady(true); // エラーでも続行
			setIsDatabaseLoading(false);
		}
	}, []);

	// Run checkAvailability and database initialization when chat opens
	useEffect(() => {
		if (isOpen && !geminiSession && !isAvailable && !isInitializing) {
			// Initialize both Gemini and database simultaneously
			const initializeBoth = async () => {
				setIsDatabaseLoading(true);
				
				try {
					// Start both initializations in parallel
					const promises = [
						new Promise<void>((resolve) => {
							checkAvailability(); // This function handles its own state
							resolve();
						}),
						initializeDatabase()
					];
					
					await Promise.all(promises);
				} catch (error) {
					console.error("Initialization error:", error);
					setIsDatabaseLoading(false);
				}
			};
			
			initializeBoth();
		}
	}, [isOpen, checkAvailability, initializeDatabase, geminiSession, isAvailable, isInitializing]);

	// Auto scroll behavior
	useEffect(() => {
		if (currentBotMessageId && currentBotMessageRef.current) {
			// Scroll to the beginning of the current bot message being generated
			currentBotMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
		} else if (shouldScrollToBottom) {
			// Scroll to bottom only when explicitly requested (e.g., user message)
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
			setShouldScrollToBottom(false);
		}
		
		// スクロール後にフォーカスを維持
		if (inputRef.current && document.activeElement !== inputRef.current && !inputRef.current.disabled) {
			// スクロールアニメーション完了後にフォーカスを戻す
			setTimeout(() => {
				if (inputRef.current && !inputRef.current.disabled) {
					inputRef.current.focus();
				}
			}, 300);
		}
	}, [currentBotMessageId, shouldScrollToBottom]);
	

	// Focus input when chat opens (avoid on mobile to prevent keyboard issues)
	useEffect(() => {
		if (isOpen && inputRef.current) {
			// Only auto-focus on desktop to avoid mobile keyboard issues
			const isMobile = window.innerWidth < 768;
			if (!isMobile) {
				inputRef.current.focus();
			}
		}
	}, [isOpen]);

	// Focus input when loading is complete (avoid on mobile to prevent keyboard issues)
	useEffect(() => {
		if (isOpen && isAvailable && isDatabaseReady && !isInitializing && !isDatabaseLoading && inputRef.current) {
			// Only auto-focus on desktop to avoid mobile keyboard issues
			const isMobile = window.innerWidth < 768;
			if (!isMobile) {
				inputRef.current.focus();
			}
		}
	}, [isOpen, isAvailable, isDatabaseReady, isInitializing, isDatabaseLoading]);

	const handleSendMessage = async () => {
		if (!input.trim() || !geminiSession || isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			text: input,
			sender: "user",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);
		setShouldScrollToBottom(true); // ユーザーメッセージ送信時のみ一番下にスクロール

		try {
			const botMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: "",
				sender: "bot",
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, botMessage]);
			setCurrentBotMessageId(botMessage.id); // Track the current bot message

			// Get streaming response
			const response = await generateRAGResponse(
				geminiSession,
				userMessage.text,
			);

			let fullText = "";
			for await (const chunk of response) {
				fullText += chunk;
				// リアルタイムでテキストを更新
				setMessages((prev) =>
					prev.map((msg) =>
						msg.id === botMessage.id ? { ...msg, text: fullText } : msg,
					),
				);
			}
			
			// 完全なレスポンスを受信したらMarkdownをパース
			const htmlContent = await parseMarkdown(fullText);
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === botMessage.id ? { ...msg, text: fullText, html: htmlContent } : msg,
				),
			);
			setCurrentBotMessageId(null); // Clear tracking when generation is complete
		} catch (error) {
			console.error("Error generating response:", error);
			const errorMessage: Message = {
				id: (Date.now() + 2).toString(),
				text: "申し訳ございません。エラーが発生しました。しばらく経ってからもう一度お試しください。",
				sender: "bot",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
			setCurrentBotMessageId(null); // Clear tracking on error
		} finally {
			setIsLoading(false);
			// Refocus the input after sending message
			// setTimeoutで少し遅延させることで、確実にフォーカスを戻す
			setTimeout(() => {
				if (inputRef.current && !inputRef.current.disabled) {
					inputRef.current.focus();
				}
			}, 100);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		// IMEの変換中は無視
		if (e.nativeEvent.isComposing) {
			return;
		}
		
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<>
			
			{/* Chat Button */}
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 rounded-full p-3 sm:p-4 shadow-lg transition-colors ${
					(isInitializing || isDatabaseLoading)
						? "bg-yellow-500 hover:bg-yellow-600 text-white"
						: (isAvailable && isDatabaseReady)
						? "bg-blue-600 hover:bg-blue-700 text-white" 
						: "bg-gray-400 hover:bg-gray-500 text-gray-200"
				}`}
				aria-label="チャットを開く"
			>
				{(isInitializing || isDatabaseLoading) ? (
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
				) : (
					<MessageCircle size={24} />
				)}
			</button>

			{/* Chat Window */}
			{isOpen && (
				<div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 bg-white dark:bg-gray-800 sm:rounded-lg shadow-2xl sm:w-96 sm:h-[600px] h-full w-full flex flex-col">
					{/* Header */}
					<div className="flex items-center justify-between p-3 sm:p-4 border-b dark:border-gray-700">
						<div className="flex items-center gap-2">
							<Bot size={24} className="text-blue-600" />
							<h3 className="font-semibold text-gray-900 dark:text-white">
								サイトアシスタント
							</h3>
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
							aria-label="チャットを閉じる"
						>
							<X size={20} />
						</button>
					</div>

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
						{messages.length === 0 && (
							<div className="text-center text-gray-500 dark:text-gray-400 mt-8">
								<Bot size={48} className="mx-auto mb-4 opacity-50" />
								{(isInitializing || isDatabaseLoading) ? (
									<>
										<div className="flex justify-center mb-4">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
										</div>
										<p className="font-semibold">準備中...</p>
										<p className="text-sm mt-2">
											{isInitializing && isDatabaseLoading 
												? "チャットシステムと検索データベースを初期化しています"
												: isInitializing 
												? "チャットシステムを初期化しています" 
												: "検索データベース（embedding含む）を読み込んでいます"}
										</p>
									</>
								) : (isAvailable && isDatabaseReady) ? (
									<>
										<p>こんにちは！サイトについて何かお探しですか？</p>
										<p className="text-sm mt-2">お気軽にご質問ください。</p>
									</>
								) : (
									<>
										<p className="text-red-600 font-semibold">Gemini Nanoが利用できません</p>
										<p className="text-sm mt-2">現在、Gemini NanoはChrome Canary/Dev/Betaでのみ動作します</p>
										<div className="text-sm mt-4 text-left max-w-xs mx-auto space-y-3">
											<div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
												<p className="font-semibold text-yellow-800 dark:text-yellow-200">⚠️ 対応ブラウザ</p>
												<ul className="mt-1 text-yellow-700 dark:text-yellow-300 text-xs">
													<li>• Chrome Canary/Dev/Beta（推奨）</li>
													<li>• Chrome 126以降（動作保証なし）</li>
													<li>• Arc、通常のChromeは未対応</li>
												</ul>
											</div>
											<div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
												<p className="font-semibold text-blue-800 dark:text-blue-200">🚀 有効化手順</p>
												<ol className="mt-1 text-blue-700 dark:text-blue-300 text-xs">
													<li>1. Chrome Canary/Dev/Betaをインストール</li>
													<li>2. chrome://flags を開く</li>
													<li>3. &quot;Prompt API for Gemini Nano&quot; → Enabled</li>
													<li>4. &quot;Optimization Guide On Device Model&quot; → Enabled BypassPerfRequirement</li>
													<li>5. ブラウザを再起動して数分待つ</li>
												</ol>
											</div>
										</div>
									</>
								)}
							</div>
						)}

						{messages.map((message) => (
							<div
								key={message.id}
								ref={message.sender === "bot" && message.id === currentBotMessageId ? currentBotMessageRef : null}
								className={`flex ${
									message.sender === "user" ? "justify-end" : "justify-start"
								}`}
							>
								<div
									className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${
										message.sender === "user"
											? "bg-blue-600 text-white"
											: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
									}`}
								>
									{message.sender === "bot" && message.html ? (
										<ChatMarkdown html={message.html} />
									) : (
										<p className="text-sm whitespace-pre-wrap">{message.text}</p>
									)}
									<p
										className={`text-xs mt-1 ${
											message.sender === "user"
												? "text-blue-100"
												: "text-gray-500 dark:text-gray-400"
										}`}
									>
										{message.timestamp.toLocaleTimeString("ja-JP", {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</p>
								</div>
							</div>
						))}

						{isLoading && (
							<div className="flex justify-start">
								<div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
									<div className="flex space-x-2">
										<div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
										<div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
										<div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>

					{/* Input */}
					<div className="p-3 sm:p-4 border-t dark:border-gray-700">
						<div className="flex gap-2">
							<input
								ref={inputRef}
								type="text"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleKeyPress}
								placeholder={(isInitializing || isDatabaseLoading) ? "システム準備中..." : (isAvailable && isDatabaseReady) ? "メッセージを入力..." : "利用できません"}
								className="flex-1 px-3 py-2 sm:px-4 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-base"
								disabled={isInitializing || isDatabaseLoading || !isAvailable || !isDatabaseReady}
							/>
							<button
								type="button"
								onClick={handleSendMessage}
								disabled={!input.trim() || isLoading || isInitializing || isDatabaseLoading || !isAvailable || !isDatabaseReady}
								className="bg-blue-600 text-white rounded-lg px-3 py-2 sm:px-4 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
								aria-label="送信"
							>
								<Send size={20} />
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

// メモ化してグローバルな再レンダリングを防ぐ
export const ChatBot = memo(ChatBotComponent);
