import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchModalStore } from '@/store/useSearchModalStore';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import {
  getJournalByDate,
  loadPodcastData,
  loadSearchData,
  loadWorksData,
  onThisDay,
  randomPage,
  recentUpdates,
  searchSite,
  sectionOf,
  siteStats,
  type OnThisDayEntry,
  type RecentUpdate,
  type SearchHit,
  type SearchSort,
  type SiteStats,
} from '@/lib/siteTools';

type View =
  | { kind: 'home' }
  | { kind: 'search'; hits: SearchHit[]; query: string }
  | { kind: 'onThisDay'; month: number; day: number; entries: OnThisDayEntry[] }
  | { kind: 'list'; title: string; items: RecentUpdate[] }
  | { kind: 'stats'; stats: SiteStats };

type QuickAction =
  | 'onThisDay'
  | 'random'
  | 'recent'
  | 'blog'
  | 'journal'
  | 'podcast'
  | 'works'
  | 'stats';

const QUICK_ACTIONS: [QuickAction, string, string][] = [
  ['onThisDay', '歴代の今日の日記', '同じ日付の日記を全年分さかのぼる'],
  ['random', 'ランダムに1本読む', 'まだ読んでいない記録に出会う'],
  ['recent', '最近の更新', '全コンテンツを日付順に横断'],
  ['stats', 'このサイトの統計', '何がどれだけあるか'],
  ['blog', 'ブログ記事一覧', '2002年からの記事を新しい順に'],
  ['journal', '日記一覧', 'ほぼ毎日の日記を新しい順に'],
  ['podcast', 'ポッドキャスト一覧', '「情報科学のまわり道」全エピソード'],
  ['works', '制作物一覧', 'スライド・記事・音楽など外部発信'],
];

const DATE_QUERY = /^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?$/;

const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: 'new', label: '新しい順' },
  { value: 'old', label: '古い順' },
  { value: 'relevance', label: '関連度順' },
];

const SECTION_LABELS: Record<string, string> = {
  blog: 'ブログ',
  journal: '日記',
  profile: 'プロフィール',
  podcast: 'ポッドキャスト',
  other: 'その他',
};

function typeLabel(type: string): string {
  if (type.startsWith('work:')) return '制作物';
  return SECTION_LABELS[type] ?? type;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function Highlighted({ text, query }: { text: string; query: string }) {
  const terms = query
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0)
    .map(escapeRegExp);
  if (terms.length === 0) return <>{text}</>;
  const parts = text.split(new RegExp(`(${terms.join('|')})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split result
          <mark key={index} className="rounded bg-[#DCE7FF] px-0.5 font-semibold text-ink">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function formatDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export default function CommandPalette() {
  const router = useRouter();
  const isOpen = useSearchModalStore((state) => state.isOpen);
  const open = useSearchModalStore((state) => state.open);
  const closeStore = useSearchModalStore((state) => state.close);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SearchSort>('new');
  const [view, setView] = useState<View>({ kind: 'home' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);
  const lastActionRef = useRef<QuickAction | null>(null);

  const close = useCallback(() => {
    requestRef.current += 1;
    closeStore();
    setQuery('');
    setError('');
    setIsLoading(false);
    setView({ kind: 'home' });
  }, [closeStore]);

  const navigate = useCallback(
    (path: string) => {
      close();
      if (path.startsWith('http')) {
        window.open(path, '_blank', 'noopener,noreferrer');
      } else {
        void router.push(path);
      }
    },
    [close, router],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (isOpen) close();
        else open();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close, open]);

  useEffect(() => {
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events, close]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const background = document.getElementById('__next');
    const previousInert = background?.inert ?? false;
    document.body.style.overflow = 'hidden';
    if (background) background.inert = true;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
      if (event.key !== 'Tab') return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>('input, button:not([disabled]), a[href]');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      requestRef.current += 1;
      document.body.style.overflow = previousOverflow;
      if (background) background.inert = previousInert;
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocus?.isConnected && previousFocus !== document.body) previousFocus.focus();
      else document.querySelector<HTMLButtonElement>('.bar-menu-btn')?.focus();
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const request = ++requestRef.current;
    const trimmed = query.trim();
    setError('');
    if (trimmed === '') {
      setIsLoading(false);
      setView((current) => (current.kind === 'search' ? { kind: 'home' } : current));
      return;
    }
    lastActionRef.current = null;
    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const hits = await searchSite(trimmed, 12, sort);
        const dateMatch = trimmed.match(DATE_QUERY);
        if (dateMatch) {
          const isoDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
          const journal = await getJournalByDate(isoDate);
          if (journal && !hits.some((hit) => hit.path === journal.path)) {
            hits.unshift({
              title: `${journal.title} の日記を開く`,
              path: journal.path,
              date: journal.date,
              snippet: journal.content.slice(0, 160).trim(),
              score: Number.MAX_SAFE_INTEGER,
              section: 'journal',
            });
          }
        }
        if (request === requestRef.current) setView({ kind: 'search', hits, query: trimmed });
      } catch {
        if (request === requestRef.current) setError('検索データを読み込めませんでした。接続を確認して、もう一度お試しください。');
      } finally {
        if (request === requestRef.current) setIsLoading(false);
      }
    }, 180);
    return () => { clearTimeout(timer); requestRef.current += 1; };
  }, [query, isOpen, sort, retry]);

  const runAction = useCallback(
    async (action: QuickAction) => {
      const request = ++requestRef.current;
      lastActionRef.current = action;
      setError('');
      setIsLoading(true);
      const show = (nextView: View) => {
        if (request === requestRef.current) setView(nextView);
      };
      try {
        if (action === 'onThisDay') {
          const result = await onThisDay();
          show({ kind: 'onThisDay', ...result });
        } else if (action === 'random') {
          const doc = await randomPage('all');
          if (request === requestRef.current) {
            if (doc) navigate(doc.path);
            else setError('表示できるページが見つかりませんでした。');
          }
        } else if (action === 'recent') {
          const updates = await recentUpdates(15);
          show({ kind: 'list', title: '最近の更新', items: updates });
        } else if (action === 'blog' || action === 'journal') {
          const documents = await loadSearchData();
          const items = documents
            .filter((doc) => sectionOf(doc) === action)
            .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
            .slice(0, 30)
            .map((doc) => ({
              type: action,
              title: doc.title,
              path: doc.path,
              date: doc.date ?? '',
            }));
          show({
            kind: 'list',
            title: action === 'blog' ? 'ブログ記事（最新30件）' : '日記（最新30件）',
            items,
          });
        } else if (action === 'podcast') {
          const podcast = await loadPodcastData();
          const items = podcast.episodes.map((episode) => ({
            type: 'podcast',
            title: episode.title,
            path: `/podcast/${episode.slug}`,
            date: new Date(episode.pubDate).toISOString(),
          }));
          show({ kind: 'list', title: `${podcast.title} — 全${items.length}話`, items });
        } else if (action === 'works') {
          const works = await loadWorksData();
          const items = works.allItems.slice(0, 30).map((item) => ({
            type: `work:${item.source}`,
            title: item.title,
            path: item.url,
            date: item.date,
          }));
          show({ kind: 'list', title: '制作物（最新30件）', items });
        } else {
          const stats = await siteStats();
          show({ kind: 'stats', stats });
        }
      } catch {
        if (request === requestRef.current) setError('データを読み込めませんでした。接続を確認して、もう一度お試しください。');
      } finally {
        if (request === requestRef.current) setIsLoading(false);
      }
    },
    [navigate],
  );
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-[rgba(23,35,52,0.45)] p-4 pt-[8vh] backdrop-blur-[2px]"
      onClick={close}
      onKeyDown={() => {}}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="flex max-h-[84dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--hairline)] bg-[#f2f3f0] text-[#20231e] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.5)]"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={() => {}}
        role="dialog"
        aria-modal="true"
        aria-label="サイト内検索"
      >
        <div className="flex items-center gap-3 border-b border-[var(--hairline)] px-5 py-4">
          <Search size={20} className="shrink-0 text-[#315c40]" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            aria-label="検索キーワード"
            placeholder="キーワードや日付で検索"
            className="min-w-0 w-full rounded bg-transparent px-1 py-2 text-base text-ink placeholder:text-ink-mute focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#315c40]"
          />
          {isLoading && <span role="status" className="shrink-0 text-xs text-ink-mute">検索中</span>}
          <button
            type="button"
            onClick={close}
            aria-label="検索を閉じる"
            className="min-h-11 shrink-0 px-2 text-sm text-ink-mute transition hover:text-ink"
          >
            閉じる
          </button>
        </div>

        <div className="overflow-y-auto px-2 py-2" aria-busy={isLoading}>
          {error && (
            <div role="alert" className="m-3 rounded-lg border border-[#E2B5B5] bg-[#FFF2F2] p-4 text-sm text-[#7B2525]">
              <p>{error}</p>
              <button type="button" className="mt-3 min-h-11 font-bold underline" onClick={() => { if (lastActionRef.current) void runAction(lastActionRef.current); else setRetry((value) => value + 1); }}>もう一度読み込む</button>
            </div>
          )}
          {view.kind === 'home' && !query.trim() && (
            <div className="grid grid-cols-1 gap-0.5 p-1 sm:grid-cols-2">
              {QUICK_ACTIONS.map(([action, title, desc]) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => { void runAction(action); }}
                  disabled={isLoading}
                  className="group rounded-lg px-4 py-2.5 text-left transition hover:bg-paper-2"
                >
                  <div className="font-bold text-ink group-hover:text-accent">
                    {title}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-mute">{desc}</div>
                </button>
              ))}
            </div>
          )}

          {view.kind === 'search' && (
            <ul>
              <li className="flex items-center gap-1 px-4 pb-1 pt-2">
                <span className="mr-1 text-[10px] text-ink-mute">並び順:</span>
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSort(option.value)}
                    aria-pressed={sort === option.value}
                    className={`min-h-11 rounded-full px-2.5 py-1 text-xs transition ${
                      sort === option.value
                        ? 'bg-ink text-paper'
                        : 'text-ink-mute hover:text-ink'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </li>
              {view.hits.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-ink-mute">
                  「{view.query}」に一致するページはありませんでした
                </li>
              )}
              {view.hits.map((hit) => (
                <li key={hit.path}>
                  <button
                    type="button"
                    onClick={() => navigate(hit.path)}
                    className="w-full rounded-lg px-4 py-3 text-left transition hover:bg-paper-2"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="shrink-0 text-[10px] uppercase tracking-wide text-accent">
                        {SECTION_LABELS[hit.section] ?? hit.section}
                      </span>
                      <span className="truncate font-bold text-ink">
                        <Highlighted text={hit.title} query={view.query} />
                      </span>
                      <span className="ml-auto shrink-0 text-[10px] text-ink-mute">
                        {formatDate(hit.date)}
                      </span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-mute">
                      <Highlighted text={hit.snippet} query={view.query} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {view.kind === 'onThisDay' && (
            <div className="p-2">
              <div className="px-2 pb-2 text-sm font-bold text-ink">
                歴代の{view.month}月{view.day}日 — {view.entries.length}年分
              </div>
              <ul>
                {view.entries.map((entry) => (
                  <li key={entry.path}>
                    <button
                      type="button"
                      onClick={() => navigate(entry.path)}
                      className="w-full rounded-lg px-4 py-3 text-left transition hover:bg-paper-2"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-accent">
                          {entry.date?.slice(0, 4)}
                        </span>
                        <span className="line-clamp-1 text-xs leading-relaxed text-ink-mute">
                          {entry.excerpt}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view.kind === 'list' && (
            <div className="p-2">
              <div className="px-2 pb-2 text-sm font-bold text-ink">{view.title}</div>
              <ul>
                {view.items.map((item) => (
                  <li key={`${item.type}-${item.path}`}>
                    <button
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="w-full rounded-lg px-4 py-2.5 text-left transition hover:bg-paper-2"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="shrink-0 text-[10px] uppercase tracking-wide text-accent">
                          {typeLabel(item.type)}
                        </span>
                        <span className="truncate font-bold text-ink">{item.title}</span>
                        <span className="ml-auto shrink-0 text-[10px] text-ink-mute">
                          {formatDate(item.date)}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view.kind === 'stats' && (
            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
              {[
                ['ブログ', `${view.stats.sections.blog?.count ?? 0}本`, `${view.stats.sections.blog?.first?.slice(0, 4)}年〜`],
                ['日記', `${view.stats.sections.journal?.count ?? 0}本`, `${view.stats.sections.journal?.first?.slice(0, 4)}年〜`],
                ['ポッドキャスト', `${view.stats.podcast.episodes}話`, view.stats.podcast.title],
                [
                  '制作物',
                  `${Object.values(view.stats.works).reduce((a, b) => a + b, 0)}点`,
                  'スライド・記事・音楽ほか',
                ],
              ].map(([label, value, note]) => (
                <div
                  key={label}
                  className="rounded-lg border border-[var(--hairline)] px-4 py-3"
                >
                  <div className="text-xs text-ink-mute">{label}</div>
                  <div className="mt-1 text-xl font-bold text-ink">{value}</div>
                  <div className="mt-0.5 truncate text-[10px] text-ink-mute">{note}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {view.kind !== 'home' && (
          <button
            type="button"
            onClick={() => {
              requestRef.current += 1;
              setError('');
              setIsLoading(false);
              setQuery('');
              setView({ kind: 'home' });
            }}
            className="border-t border-[var(--hairline)] px-5 py-2 text-left text-[11px] text-ink-mute transition hover:text-ink"
          >
            ← もどる
          </button>
        )}

        <div className="border-t border-[var(--hairline)] bg-[#EEF2F8] px-5 py-3 text-xs text-ink-mute">
          日付でも検索できます。例：2025-01-01
        </div>
      </div>
    </div>,
    document.body,
  );
}
