import { useMemo, useState } from 'react';
import type { GetStaticProps } from 'next';
import Link from 'next/link';
import fs from 'node:fs';
import path from 'node:path';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';

interface FeedItem {
  title: string;
  description: string;
  url: string;
  date: string;
  source: string;
  sourceName: string;
  image: string | null;
}

interface FeedSource {
  url: string;
  type: string;
  name: string;
}

interface FeedData {
  items: FeedItem[];
  sources: FeedSource[];
  lastUpdated: string;
  allItems: FeedItem[];
  itemsByCategory: Record<string, FeedItem[]>;
}

type Props = {
  feedData: FeedData;
};

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function WorksPage({ feedData }: Props) {
  const [tab, setTab] = useState<string>('all');

  const filtered = useMemo<FeedItem[]>(() => {
    if (tab === 'all') return feedData.items;
    return feedData.itemsByCategory[tab] || [];
  }, [tab, feedData]);

  const grouped = useMemo<{ year: string; items: FeedItem[] }[]>(() => {
    const map = new Map<string, FeedItem[]>();
    for (const item of filtered) {
      const year = String(new Date(item.date).getFullYear()) || 'unknown';
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(item);
    }
    return Array.from(map.entries())
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([year, items]) => ({ year, items }));
  }, [filtered]);

  return (
    <Layout activeNav="works">
      <SEO
        title="制作物"
        description="栗林健太郎の note、技術ブログ、スライド、動画、音楽などの制作物のアーカイブ。"
      />

      <section className="sub-hero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">§00 ホーム</Link>
            <span className="sep">/</span>
            <span>§02 制作物</span>
          </div>
          <div className="sub-hero-grid">
            <div>
              <h1 className="giga">制作物</h1>
              <p className="lede-en">
                An editor&apos;s ledger of notes, essays, slides, audio, and video — across the web.
              </p>
            </div>
            <div className="meta-block">
              <b>{feedData.items.length}</b>
              <em>recent · {feedData.sources.length} sources</em>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: '48px', paddingBottom: '96px' }}>
        <div className="works-filter">
          <button
            type="button"
            className={tab === 'all' ? 'on' : ''}
            onClick={() => setTab('all')}
          >
            すべて
            <span className="c">{feedData.items.length}</span>
          </button>
          {feedData.sources.map((s) => (
            <button
              key={s.type}
              type="button"
              className={tab === s.type ? 'on' : ''}
              onClick={() => setTab(s.type)}
            >
              {s.name}
              <span className="c">{(feedData.itemsByCategory[s.type] || []).length}</span>
            </button>
          ))}
        </div>

        {grouped.length === 0 ? (
          <p style={{ color: 'var(--ink-mute)', padding: '48px 0' }}>表示する制作物がありません。</p>
        ) : (
          grouped.map((g) => (
            <div key={g.year}>
              <div className="works-year">
                <span className="yn">{g.year}</span>
                <span className="ylabel">
                  {g.items.length} works · year {g.year}
                </span>
              </div>
              <div className="ledger">
                {g.items.map((item, i) => (
                  <a
                    key={`${item.url}-${i}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lrow work-row"
                  >
                    <span className="n">№ {String(i + 1).padStart(2, '0')}</span>
                    <span className="d">{formatDate(item.date)}</span>
                    <span className="t">
                      {item.title}
                      {item.description && (
                        <span className="sub">{item.description.slice(0, 100)}</span>
                      )}
                    </span>
                    <span className="venue">{item.sourceName}</span>
                    <span className="k">{item.source}</span>
                    <span className="arr">→</span>
                  </a>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="page-nav">
          <Link href="/">← §00 ホーム</Link>
          <span className="mid">{feedData.lastUpdated && `updated: ${formatDate(feedData.lastUpdated)}`}</span>
          <a href="/works/feed.xml">RSS Feed →</a>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    const dataFilePath = path.join(process.cwd(), 'public', 'works', 'feed-data.json');
    if (!fs.existsSync(dataFilePath)) {
      return {
        props: {
          feedData: {
            items: [],
            sources: [],
            lastUpdated: new Date().toISOString(),
            allItems: [],
            itemsByCategory: {},
          },
        },
      };
    }
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    const feedData: FeedData = JSON.parse(raw);
    const optimized: FeedData = {
      items: feedData.items.slice(0, 100),
      sources: feedData.sources,
      lastUpdated: feedData.lastUpdated,
      allItems: [],
      itemsByCategory: Object.entries(feedData.itemsByCategory).reduce(
        (acc, [key, items]) => {
          acc[key] = items.slice(0, 50);
          return acc;
        },
        {} as Record<string, FeedItem[]>
      ),
    };
    return { props: { feedData: optimized } };
  } catch (e) {
    console.error('Works: feed load failed', e);
    return {
      props: {
        feedData: { items: [], sources: [], lastUpdated: new Date().toISOString(), allItems: [], itemsByCategory: {} },
      },
    };
  }
};
