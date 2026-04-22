import type { GetStaticProps } from 'next';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import { fetchPodcastFeed, type PodcastInfo } from '@/lib/podcast';

type Props = {
  podcast: PodcastInfo;
};

const SUBSCRIBE = [
  { name: 'Apple Podcasts', url: 'https://podcasts.apple.com/us/podcast/antipop-fm/id1616592596', accent: true },
  { name: 'Spotify', url: 'https://open.spotify.com/show/35L7VOknYyZw1wuM9NdRuL' },
  { name: 'Amazon Music', url: 'https://music.amazon.co.jp/podcasts/75ad5614-fa57-478e-8727-469042997eae' },
  { name: 'RSS', url: 'https://anchor.fm/s/6877a570/podcast/rss' },
];

function strip(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatJP(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function formatDuration(raw?: string): string {
  if (!raw) return '';
  // raw is either "HH:MM:SS" or "MM:SS" or seconds count
  if (/^\d+$/.test(raw)) {
    const secs = Number(raw);
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  }
  return raw;
}

export default function PodcastIndex({ podcast }: Props) {
  const episodes = podcast.episodes;
  const totalEp = episodes.length;

  return (
    <Layout activeNav="podcast">
      <SEO
        title="ポッドキャスト"
        description={strip(podcast.description || 'Antipop FM — 栗林健太郎のポッドキャスト')}
      />

      <section className="sub-hero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">§00 ホーム</Link>
            <span className="sep">/</span>
            <span>§05 ポッドキャスト</span>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className="podcast-hero">
          <div className="art">
            {podcast.imageUrl ? (
              <img src={podcast.imageUrl} alt={podcast.title} />
            ) : (
              <>
                <div className="big">AFM</div>
                <div className="label">Antipop FM</div>
              </>
            )}
          </div>
          <div>
            <div className="article-kicker" style={{ marginBottom: '12px' }}>
              A podcast by Kentaro Kuribayashi
            </div>
            <h1 className="giga" style={{ fontSize: 'clamp(52px, 9vw, 120px)', marginBottom: '20px' }}>
              {podcast.title || 'Antipop FM'}
            </h1>
            <p style={{ fontFamily: '"Zen Old Mincho", serif', fontSize: '17px', lineHeight: 1.9, color: 'var(--ink-soft)', maxWidth: '48ch' }}>
              {strip(podcast.description || '').split('。')[0]}。
            </p>
            <div className="subscribe-row">
              {SUBSCRIBE.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className={s.accent ? 'accent' : ''}>
                  {s.name} →
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: '72px', paddingBottom: '96px' }}>
        <div className="month-hd" style={{ marginBottom: '24px' }}>
          <span className="mn">Episodes</span>
          <span className="mj">エピソード</span>
          <span className="ct">{totalEp}本</span>
        </div>

        {totalEp === 0 ? (
          <p style={{ color: 'var(--ink-mute)' }}>エピソードはまだありません。</p>
        ) : (
          <div>
            {episodes.map((ep, i) => (
              <Link key={ep.guid || ep.slug || i} href={`/podcast/${ep.slug}`} className="ep-row" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="n">№ {String(totalEp - i).padStart(3, '0')}</span>
                <span className="play" aria-hidden>▶</span>
                <div className="body">
                  <div className="t">{ep.title}</div>
                  <div className="desc">{strip(ep.description || '').slice(0, 140)}</div>
                </div>
                <span className="dt">{formatJP(ep.pubDate)}</span>
                <span className="dur">{formatDuration(ep.duration) || '—'}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="page-nav">
          <Link href="/">← §00 ホームへ</Link>
          <span className="mid">Antipop FM</span>
          <a href="https://anchor.fm/s/6877a570/podcast/rss" target="_blank" rel="noopener noreferrer">
            RSS Feed →
          </a>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    const rssUrl = 'https://anchor.fm/s/6877a570/podcast/rss';
    const podcast = await fetchPodcastFeed(rssUrl);
    return { props: { podcast } };
  } catch (e) {
    console.error('Podcast fetch failed', e);
    return {
      props: {
        podcast: { title: 'Antipop FM', description: '', episodes: [] } as PodcastInfo,
      },
    };
  }
};
