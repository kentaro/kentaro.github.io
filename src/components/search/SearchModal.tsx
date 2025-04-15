import { useState, useEffect, useRef, type MouseEvent, type ReactElement, useCallback, memo } from 'react';
import Link from 'next/link';
import { FiX, FiSearch } from 'react-icons/fi';
import { searchDocumentsAsync, getSearchSnippetAsync, type LoadingProgress, defaultProgress } from '@/lib/search';
import { getGlobalPglite, useGlobalPGlite } from '@/lib/PGliteContext';
import {
  initSearch,
  registerProgressCallback,
  unregisterProgressCallback,
  getInitializationStatus,
  addCompletionListener
} from '@/lib/searchInitializer';

// 特殊文字を含む検索クエリを安全に処理する関数
function escapeSearchQuery(query: string): string {
  if (!query) return '';

  // 空白で単語を分割
  const words = query.split(/\s+/).filter(Boolean);

  // 各単語を処理
  const escapedWords = words.map(word => {
    // PostgreSQL全文検索の特殊文字を含む場合は引用符で囲む
    if (/[&|!():'"<>@*~]/.test(word)) {
      // 単語内の引用符をエスケープ（"を\"に変換）
      const escapedWord = word.replace(/"/g, '\\"');
      return `"${escapedWord}"`;
    }
    return word;
  });

  // 処理した単語を空白で結合して返す
  return escapedWords.join(' ');
}

type SearchResult = {
  id: string;
  title: string;
  path: string;
  date?: string;
  excerpt?: string;
  rank?: number;
};

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SearchResultItemProps = {
  result: SearchResult;
  query: string;
  onClose: () => void;
};

// ユニークなIDを生成する関数
function generateId(): string {
  return `modal-${Math.random().toString(36).substring(2, 9)}`;
}

// コンポーネントをmemoでラップしてpropsが変更されない限り再レンダリングしないように
const SearchModal = memo(function SearchModal({ isOpen, onClose }: SearchModalProps): ReactElement {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>(defaultProgress);

  // コンテキストと各種参照
  const { pglite, setPglite } = useGlobalPGlite();
  const hasStartedInitialization = useRef(false);
  const mountedRef = useRef(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackIdRef = useRef<string>(generateId());

  // 内部初期化状態 - モーダル表示時のみチェックするためrefを使用（ステートを減らす）
  const initStateRef = useRef(getInitializationStatus());

  // PGliteが初期化されているかチェック（コンテキスト経由）
  const isPGliteReady = !!pglite || !!getGlobalPglite();

  // pglite, setPgliteをrefで保持
  const pgliteRef = useRef(pglite);
  const setPgliteRef = useRef(setPglite);
  useEffect(() => { pgliteRef.current = pglite; }, [pglite]);
  useEffect(() => { setPgliteRef.current = setPglite; }, [setPglite]);

  // 初期化成功時の内部処理 - ここでのみPGliteを更新し、状態更新を1回に抑える
  const handleInitSuccess = useCallback(() => {
    if (!mountedRef.current) return;
    if (pgliteRef.current) return;
    const db = getGlobalPglite();
    if (db) {
      setPgliteRef.current(db);
      setIsLoading(false);
    }
  }, []);

  // プログレスコールバック関数 - 初期化中の進捗のみを取り扱い、完了は別途処理
  const progressCallback = useCallback((progress: LoadingProgress) => {
    if (!mountedRef.current) return;

    // 進捗表示のみを更新（UIの状態更新を最小限に）
    setLoadingProgress(progress);

    // 初期化中状態のみを扱う（完了は別途処理）
    if (progress.isLoading) {
      setIsLoading(true);
    }
  }, []);

  // 初期化完了時のイベントハンドラ - このハンドラはコンポーネントのマウント中にただ1度だけ呼ばれるべき
  const handleInitializationComplete = useCallback(() => {
    console.log("[SearchModal] Initialization complete event received");
    // 初期化成功時の処理を呼び出し
    handleInitSuccess();
  }, [handleInitSuccess]);

  // handleInitializationCompleteをrefで保持
  const handleInitializationCompleteRef = useRef(handleInitializationComplete);
  useEffect(() => { handleInitializationCompleteRef.current = handleInitializationComplete; }, [handleInitializationComplete]);

  // 初期化完了リスナーを登録（コンポーネントのマウント時に一度だけ）
  useEffect(() => {
    // 安定したハンドラ参照
    const handler: () => void = () => handleInitializationCompleteRef.current();
    console.log("[SearchModal] Registering completion listener (mount)");

    // 完了イベントリスナーを登録
    const removeListener = addCompletionListener(handler);

    return () => {
      console.log("[SearchModal] Unregistering completion listener (unmount)");
      removeListener();
    };
  }, []); // 依存配列を空にしてマウント時に1回だけ実行

  // コンポーネントのマウント状態を追跡
  useEffect(() => {
    mountedRef.current = true;
    console.log("[SearchModal] Component mounted");

    return () => {
      console.log("[SearchModal] Component unmounting, cleaning up");
      mountedRef.current = false;
      // コンポーネントのアンマウント時にコールバックを解除
      unregisterProgressCallback(callbackIdRef.current);
    };
  }, []);

  // プログレスコールバックの登録・解除（モーダルが開いている間のみ）
  useEffect(() => {
    if (!isOpen) return;

    // コールバックIDを固定して重複を避ける
    const callbackId = callbackIdRef.current;
    console.log("[SearchModal] Registering progress callback:", callbackId);

    registerProgressCallback(callbackId, progressCallback);

    return () => {
      console.log("[SearchModal] Unregistering progress callback:", callbackId);
      unregisterProgressCallback(callbackId);
    };
  }, [isOpen, progressCallback]);

  // モーダルオープン時の初期化処理
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    console.log("[SearchModal] Modal opened, checking initialization status");
    initStateRef.current = getInitializationStatus();
    const { isInitialized, isInitializing } = initStateRef.current;
    console.log("[SearchModal] Current initialization status:", { isInitialized, isInitializing });
    if (!isInitialized && !isInitializing && !hasStartedInitialization.current) {
      console.log("[SearchModal] Starting initialization");
      hasStartedInitialization.current = true;
      setIsLoading(true);
      console.log("[SearchModal] Calling initSearch()");
      initSearch().catch(error => {
        console.error("[SearchModal] Error initializing search:", error);
        if (mountedRef.current) {
          setIsLoading(false);
        }
      });
    } else if (isInitializing) {
      console.log("[SearchModal] Search is already initializing");
      setIsLoading(true);
    } else if (isInitialized) {
      console.log("[SearchModal] Search is already initialized");
      const db = getGlobalPglite();
      if (db && !pgliteRef.current) {
        console.log("[SearchModal] Updating PGlite context (already initialized)");
        setPgliteRef.current(db);
      }
      setIsLoading(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // フォーカス処理
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // 検索結果を取得する関数
  const fetchResults = useCallback(async (query: string) => {
    if (!isPGliteReady || !query) return;

    // 検索実行中は読み込み中表示
    setIsLoading(true);

    try {
      // 特殊文字をエスケープして検索を実行
      const escapedQuery = escapeSearchQuery(query);
      const results = await searchDocumentsAsync(escapedQuery);

      if (mountedRef.current) {
        setSearchResults(results as SearchResult[]);
        setShowResults(true);
      }
    } catch (error) {
      console.error('[SearchModal] Error fetching search results:', error);
      if (mountedRef.current) {
        setSearchResults([]);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isPGliteReady]);

  // 検索結果を取得（PGliteが初期化されている場合のみ）
  useEffect(() => {
    if (debouncedQuery) {
      fetchResults(debouncedQuery);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery, fetchResults]);

  // 検索クエリをデバウンス
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Escキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault(); // デフォルトの動作をキャンセル
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [isOpen, onClose]);

  // モーダル外クリックでモーダルを閉じる
  const handleModalClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target instanceof Node && !modalRef.current.contains(e.target)) {
      e.preventDefault(); // イベントの伝播を停止
      e.stopPropagation();
      onClose();
    }
  }, [onClose]);

  // モーダル内のスクロールイベントを処理
  const handleModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop === target.clientHeight) {
      // スクロールが最下部に達したらイベントを停止
      e.stopPropagation();
    }
  };

  // 進捗バーのレンダリング
  const renderProgressBar = () => {
    const percent = loadingProgress.total > 0
      ? Math.min(Math.round((loadingProgress.progress / loadingProgress.total) * 100), 100)
      : 0;

    return (
      <div className="w-full mt-4 mb-2">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1 text-center">
          {loadingProgress.status} {percent}%
        </p>
      </div>
    );
  };

  // isOpenがfalseの場合は空のdivを表示（nullではなく）
  if (!isOpen) {
    return <div className="hidden" aria-hidden="true" />;
  }

  // レンダリング
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity flex items-start justify-center pt-24"
      onClick={handleModalClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleModalClick(e as unknown as MouseEvent<HTMLDivElement>);
        }
      }}
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl px-4 sm:px-6 flex flex-col items-center animate-fadeIn"
      >
        {/* 検索ボックス - 常に表示 */}
        <div className="w-full bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 flex items-center">
            <FiSearch className="text-gray-500 mr-3 sm:mr-4 flex-shrink-0" size={20} />
            <input
              id="search-input"
              type="text"
              className="flex-1 outline-none text-lg sm:text-xl py-1 sm:py-2"
              placeholder={isLoading ? "検索システムを準備中..." : "キーワードで検索..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="検索キーワード"
              disabled={isLoading && !initStateRef.current.isDataLoaded}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors ml-3 sm:ml-4 flex-shrink-0"
              aria-label="閉じる"
              type="button"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* 初期化中の進捗バー */}
          {isLoading && loadingProgress.isLoading && renderProgressBar()}
        </div>

        {/* 検索結果 - 条件付きで表示 */}
        {showResults && (
          <div className="w-full mt-2 bg-white rounded-lg shadow-xl max-h-[70vh] overflow-hidden flex flex-col transition-all duration-300 ease-in-out animate-slideDown">
            <div
              className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain"
              onScroll={handleModalScroll}
            >
              {isLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-500">検索システムを準備中...</p>
                </div>
              ) : loadingProgress.error ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-red-500">{loadingProgress.error}</p>
                </div>
              ) : debouncedQuery && searchResults.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-500">検索結果がありません</p>
                </div>
              ) : debouncedQuery ? (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchResults.length}件の検索結果
                  </p>
                  <ul className="space-y-5 sm:space-y-6">
                    {searchResults.map((result: SearchResult) => (
                      <SearchResultItem
                        key={result.id}
                        result={result}
                        query={debouncedQuery}
                        onClose={onClose}
                      />
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// SearchResultItemコンポーネントもmemoでラップして不要な再レンダリングを防止
const SearchResultItem = memo(function SearchResultItem({ result, query, onClose }: SearchResultItemProps): ReactElement {
  const [snippet, setSnippet] = useState<string | null>(null);
  const { pglite } = useGlobalPGlite();
  const mountedRef = useRef(true);

  // コンポーネントのマウント状態を追跡
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // PGliteが初期化されているかチェック（コンテキスト経由）
  const isPGliteReady = !!pglite || !!getGlobalPglite();

  // スニペットを取得
  useEffect(() => {
    if (isPGliteReady && result.id && query) {
      const fetchSnippet = async () => {
        try {
          // 特殊文字をエスケープしてスニペットを取得
          const escapedQuery = escapeSearchQuery(query);
          const snippetResult = await getSearchSnippetAsync(result.id, escapedQuery);
          if (mountedRef.current) {
            setSnippet(snippetResult);
          }
        } catch (error) {
          console.error('Error fetching snippet:', error);
          if (mountedRef.current) {
            setSnippet(null);
          }
        }
      };

      fetchSnippet();
    } else {
      setSnippet(null);
    }
  }, [result.id, query, isPGliteReady]);

  // 検索キーワードをハイライトする
  const highlightText = (text: string): string => {
    if (!text) return '';

    // 元のクエリを使用してハイライト（エスケープ前のクエリを使用）
    const keywords = query.split(/\s+/).filter(Boolean);
    let highlightedText = text;

    for (const keyword of keywords) {
      // 特殊文字をRegExpで安全に扱えるようにエスケープ
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedKeyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 rounded px-1">$1</mark>');
    }

    return highlightedText;
  };

  // スニペットをハイライト済みHTMLからテキストに変換
  const renderHighlightedSnippet = () => {
    if (!snippet) return null;

    // eslint-disable-next-line react/no-danger
    return <span dangerouslySetInnerHTML={{ __html: highlightText(snippet) }} />;
  };

  return (
    <li className="border-b border-gray-100 pb-5 sm:pb-6 last:border-0 last:pb-0">
      <Link
        href={`${result.path}?q=${encodeURIComponent(query)}`}
        className="block hover:bg-gray-50 rounded-lg transition-colors p-2 -m-2"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        {/* タイトル */}
        <h3 className="text-lg font-semibold mb-2">{result.title}</h3>

        {/* スニペットまたは抜粋 */}
        {snippet ? (
          <p className="text-sm text-gray-600">
            {renderHighlightedSnippet()}
          </p>
        ) : result.excerpt ? (
          <p className="text-sm text-gray-600 line-clamp-2">{result.excerpt}</p>
        ) : null}
      </Link>
    </li>
  );
});

// 必要なexport設定
SearchModal.displayName = 'SearchModal';
SearchResultItem.displayName = 'SearchResultItem';

export default SearchModal;
