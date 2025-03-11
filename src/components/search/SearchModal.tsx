import { useState, useEffect, type MouseEvent, type KeyboardEvent, type ReactElement } from 'react';
import Link from 'next/link';
import { FiX, FiSearch } from 'react-icons/fi';
import { searchDocumentsAsync, getSearchSnippetAsync, initializeSearchDB, loadSearchData } from '@/lib/search';
import { usePGlite } from '@electric-sql/pglite-react';

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

export default function SearchModal({ isOpen, onClose }: SearchModalProps): ReactElement {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const pglite = usePGlite();

  // PGliteが初期化されているかチェック
  const isPGliteReady = !!pglite;

  // 検索結果を取得（PGliteが初期化されている場合のみ）
  useEffect(() => {
    if (isPGliteReady && debouncedQuery) {
      setIsLoading(true);
      const fetchResults = async () => {
        try {
          // 特殊文字をエスケープして検索を実行
          const escapedQuery = escapeSearchQuery(debouncedQuery);
          const results = await searchDocumentsAsync(escapedQuery);
          setSearchResults(results as SearchResult[]);
          setShowResults(true);
        } catch (error) {
          console.error('Error fetching search results:', error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchResults();
    } else if (!debouncedQuery) {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery, isPGliteReady]);

  // 検索クエリをデバウンス
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // モーダルが開いたときにフォーカスとPGlite初期化
  useEffect(() => {
    if (isOpen) {
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
      }

      // PGliteが初期化されていない場合は初期化を開始
      if (!isPGliteReady) {
        const initSearch = async () => {
          try {
            setIsInitializing(true);
            console.log('Initializing search database from modal...');

            const db = await initializeSearchDB();
            if (db) {
              await loadSearchData();
              console.log('Search database initialized successfully from modal');
            } else {
              console.error('Failed to initialize search database from modal');
            }
          } catch (error) {
            console.error('Error initializing search from modal:', error);
          } finally {
            setIsInitializing(false);
          }
        };

        initSearch();
      }

      // 背景のスクロールを無効化
      document.body.style.overflow = 'hidden';
    } else {
      // モーダルが閉じられたらスクロールを有効化
      document.body.style.overflow = '';
      // モーダルが閉じられたら検索結果を非表示に
      setShowResults(false);
      setQuery('');
      setDebouncedQuery('');
    }

    // クリーンアップ関数
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isPGliteReady]);

  // Escキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // オーバーレイをクリックしたときの処理
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    onClose();
  };

  // キーボードでの操作
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // モーダル内のスクロールイベントを処理
  const handleModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop === target.clientHeight) {
      // スクロールが最下部に達したらイベントを停止
      e.stopPropagation();
    }
  };

  return (
    <dialog
      open={isOpen}
      className={`fixed inset-0 z-50 ${isOpen ? 'visible' : 'invisible'
        } m-0 p-0 bg-transparent border-none outline-none`}
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
        onKeyDown={handleKeyDown}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 sm:px-6 flex flex-col items-center">
        {/* 検索ボックス - 常に表示 */}
        <div className="w-full bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 flex items-center">
            <FiSearch className="text-gray-500 mr-3 sm:mr-4 flex-shrink-0" size={20} />
            <input
              id="search-input"
              type="text"
              className="flex-1 outline-none text-lg sm:text-xl py-1 sm:py-2"
              placeholder="キーワードで検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="検索キーワード"
              disabled={!isPGliteReady && isInitializing}
            />
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors ml-3 sm:ml-4 flex-shrink-0"
              aria-label="閉じる"
              type="button"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* 検索結果 - 条件付きで表示 */}
        {showResults && (
          <div className="w-full mt-2 bg-white rounded-lg shadow-xl max-h-[70vh] overflow-hidden flex flex-col transition-all duration-300 ease-in-out animate-slideDown">
            <div
              className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain"
              onScroll={handleModalScroll}
            >
              {!isPGliteReady && isInitializing ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-500">検索システムを準備中...</p>
                </div>
              ) : !isPGliteReady ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-500">検索システムを初期化中...</p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-500">検索中...</p>
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
    </dialog>
  );
}

function SearchResultItem({ result, query, onClose }: SearchResultItemProps): ReactElement {
  const [snippet, setSnippet] = useState<string | null>(null);
  const pglite = usePGlite();

  // PGliteが初期化されている場合のみスニペットを取得
  const isPGliteReady = !!pglite;

  // スニペットを取得
  useEffect(() => {
    if (isPGliteReady && result.id && query) {
      const fetchSnippet = async () => {
        try {
          // 特殊文字をエスケープしてスニペットを取得
          const escapedQuery = escapeSearchQuery(query);
          const snippetResult = await getSearchSnippetAsync(result.id, escapedQuery);
          setSnippet(snippetResult);
        } catch (error) {
          console.error('Error fetching snippet:', error);
          setSnippet(null);
        }
      };

      fetchSnippet();
    } else {
      setSnippet(null);
    }
  }, [result.id, query, isPGliteReady]);

  // 日付をフォーマット
  const formattedDate = result.date
    ? new Date(result.date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    : null;

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
        onClick={onClose}
        className="block hover:bg-gray-50 rounded-lg transition-colors p-2 -m-2"
      >
        {/* 日付があれば表示 */}
        {result.date && (
          <p className="text-sm text-primary mb-1">
            {formattedDate}
          </p>
        )}

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
}
