// Command palette: human-facing UI over the same site tool layer that is
// exposed to AI agents via MCP / WebMCP. Opens with Cmd+K / Ctrl+K or the
// floating trigger button.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  isWebMcpAvailable,
  onThisDay,
  randomPage,
  recentUpdates,
  searchSite,
  siteStats,
  type OnThisDayEntry,
  type RecentUpdate,
  type SearchHit,
  type SiteStats,
} from '@/lib/siteTools';

type View =
  | { kind: 'home' }
  | { kind: 'search'; hits: SearchHit[]; query: string }
  | { kind: 'onThisDay'; month: number; day: number; entries: OnThisDayEntry[] }
  | { kind: 'recent'; updates: RecentUpdate[] }
  | { kind: 'stats'; stats: SiteStats };

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

function formatDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>({ kind: 'home' });
  const [isLoading, setIsLoading] = useState(false);
  const [hasWebMcp, setHasWebMcp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setView({ kind: 'home' });
  }, []);

  const navigate = useCallback(
    (path: string) => {
      close();
      if (path.startsWith('http')) {
        window.open(path, '_blank', 'noopener');
      } else {
        router.push(path);
      }
    },
    [close, router],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((open) => !open);
      } else if (event.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close]);

  useEffect(() => {
    if (isOpen) {
      setHasWebMcp(isWebMcpAvailable());
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed === '') {
      setView((current) => (current.kind === 'search' ? { kind: 'home' } : current));
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const hits = await searchSite(trimmed, 12);
        setView({ kind: 'search', hits, query: trimmed });
      } finally {
        setIsLoading(false);
      }
    }, 180);
  }, [query, isOpen]);

  const runAction = useCallback(
    async (action: 'onThisDay' | 'random' | 'recent' | 'stats') => {
      setIsLoading(true);
      try {
        if (action === 'onThisDay') {
          const result = await onThisDay();
          setView({ kind: 'onThisDay', ...result });
        } else if (action === 'random') {
          const doc = await randomPage('all');
          if (doc) navigate(doc.path);
        } else if (action === 'recent') {
          const updates = await recentUpdates(15);
          setView({ kind: 'recent', updates });
        } else {
          const stats = await siteStats();
          setView({ kind: 'stats', stats });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="サイト内ツールを開く"
        className="fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-paper px-4 py-2 text-sm text-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] transition hover:border-ink"
      >
        <span className="mincho font-bold">探す・遊ぶ</span>
        <kbd className="mono hidden text-[10px] text-ink-mute sm:inline">⌘K</kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-[rgba(26,23,20,0.45)] p-4 pt-[12vh] backdrop-blur-[2px]"
      onClick={close}
      onKeyDown={() => {}}
      role="presentation"
    >
      <div
        className="flex max-h-[72vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--hairline)] bg-paper shadow-[0_40px_120px_-30px_rgba(0,0,0,0.5)]"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={() => {}}
        role="dialog"
        aria-modal="true"
        aria-label="サイト内ツール"
      >
        <div className="flex items-center gap-3 border-b border-[var(--hairline)] px-5 py-4">
          <span className="mono text-xs text-accent">&gt;</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="検索 — ブログ・日記・プロフィールを横断"
            className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-mute"
          />
          {isLoading && <span className="mono animate-pulse text-xs text-ink-mute">…</span>}
          <button
            type="button"
            onClick={close}
            className="mono text-xs text-ink-mute transition hover:text-ink"
          >
            esc
          </button>
        </div>

        <div className="overflow-y-auto px-2 py-2">
          {view.kind === 'home' && (
            <div className="grid grid-cols-1 gap-1 p-1 sm:grid-cols-2">
              {(
                [
                  ['onThisDay', '歴代の今日の日記', '同じ日付の日記を全年分さかのぼる'],
                  ['random', 'ランダムに1本読む', '3,800ページからどれかへ飛ぶ'],
                  ['recent', '最近の更新', 'ブログ・日記・ポッドキャスト・制作物を横断'],
                  ['stats', 'このサイトの統計', '何がどれだけあるか'],
                ] as const
              ).map(([action, title, desc]) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => runAction(action)}
                  className="group rounded-lg px-4 py-3 text-left transition hover:bg-paper-2"
                >
                  <div className="mincho font-bold text-ink group-hover:text-accent">
                    {title}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-mute">{desc}</div>
                </button>
              ))}
            </div>
          )}

          {view.kind === 'search' && (
            <ul>
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
                      <span className="mono shrink-0 text-[10px] uppercase tracking-wide text-accent">
                        {SECTION_LABELS[hit.section] ?? hit.section}
                      </span>
                      <span className="truncate font-bold text-ink">{hit.title}</span>
                      <span className="mono ml-auto shrink-0 text-[10px] text-ink-mute">
                        {formatDate(hit.date)}
                      </span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-mute">
                      {hit.snippet}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {view.kind === 'onThisDay' && (
            <div className="p-2">
              <div className="mincho px-2 pb-2 text-sm font-bold text-ink">
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
                        <span className="mono text-xs font-bold text-accent">
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

          {view.kind === 'recent' && (
            <ul>
              {view.updates.map((update) => (
                <li key={`${update.type}-${update.path}`}>
                  <button
                    type="button"
                    onClick={() => navigate(update.path)}
                    className="w-full rounded-lg px-4 py-3 text-left transition hover:bg-paper-2"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="mono shrink-0 text-[10px] uppercase tracking-wide text-accent">
                        {typeLabel(update.type)}
                      </span>
                      <span className="truncate font-bold text-ink">{update.title}</span>
                      <span className="mono ml-auto shrink-0 text-[10px] text-ink-mute">
                        {formatDate(update.date)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
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
                  <div className="mincho mt-1 text-xl font-bold text-ink">{value}</div>
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
              setQuery('');
              setView({ kind: 'home' });
            }}
            className="mono border-t border-[var(--hairline)] px-5 py-2 text-left text-[11px] text-ink-mute transition hover:text-ink"
          >
            ← もどる
          </button>
        )}

        <div className="flex items-center gap-2 border-t border-[var(--hairline)] bg-paper-2 px-5 py-2.5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${hasWebMcp ? 'bg-emerald-600' : 'bg-ink-mute opacity-40'}`}
          />
          <span className="mono text-[10px] leading-relaxed text-ink-mute">
            このパネルと同じツールを MCP / WebMCP で AI エージェントにも公開中
            {hasWebMcp ? '（このブラウザは WebMCP 有効）' : ''} — /mcp
          </span>
        </div>
      </div>
    </div>
  );
}
