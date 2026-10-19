import { useMemo, useState } from 'react';
import type { GetStaticProps } from 'next';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import MediaGrid from '@/components/media/MediaGrid';
import { getMediaItems, type MediaItem } from '@/lib/media';

type Props = { items: MediaItem[] };
type Filter = 'all' | 'video' | 'music';

export default function MusicPage({ items }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => items.filter((item) =>
    (filter === 'all' || item.source === filter) &&
    `${item.title} ${item.description}`.normalize('NFKC').toLocaleLowerCase().includes(query.normalize('NFKC').trim().toLocaleLowerCase()),
  ), [items, filter, query]);
  const filters = [{ key: 'all', label: 'すべて' }, { key: 'video', label: 'YouTube' }, { key: 'music', label: 'SoundCloud' }] as const;

  return (
    <Layout activeNav="music">
      <SEO title="音楽" description="栗林健太郎の音楽作品、演奏、ミュージックビデオ。YouTubeとSoundCloudで公開している作品を聴く。" />
      <div className="music-page">
        <section className="music-intro wrap">
          <div className="crumb"><Link href="/">ホーム</Link><span className="sep">/</span><span>音楽</span></div>
          <span className="music-kicker">MUSIC / KENTARO KURIBAYASHI</span>
          <h1>音楽</h1>
          <p>つくった曲、ピアノの演奏、音楽の映像。</p>
          <p>YouTubeとSoundCloudで公開している作品を、ここから聴けます。</p>
          <div className="music-channels">
            <a href="https://www.youtube.com/channel/UCePhLXeZjDdNEosOqpmD19A" target="_blank" rel="noopener noreferrer">YouTube ↗</a>
            <a href="https://soundcloud.com/kentarok" target="_blank" rel="noopener noreferrer">SoundCloud ↗</a>
          </div>
        </section>
        <section className="music-collection wrap" aria-label="音楽作品の一覧">
          <div className="music-toolbar">
            <div className="music-filters" aria-label="掲載先で絞り込む">
              {filters.map(({ key, label }) => (
                <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>
                  {label}<span>{key === 'all' ? items.length : items.filter((item) => item.source === key).length}</span>
                </button>
              ))}
            </div>
            <label className="music-search"><span className="sr-only">曲名・説明から探す</span><input type="search" placeholder="曲名・説明から探す" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          </div>
          <p className="music-results" role="status">{filtered.length}作品{query.trim() && ` · 「${query.trim()}」の検索結果`}</p>
          <MediaGrid key={`${filter}:${query}`} items={filtered} />
          {filtered.length === 0 && <p className="music-empty">該当する作品がありません。検索語や掲載先を変えてみてください。</p>}
        </section>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => ({ props: { items: getMediaItems() } });
