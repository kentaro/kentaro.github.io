import type { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import { fetchPodcastFeed, type PodcastEpisode, type PodcastInfo } from '@/lib/podcast';

type Props = {
  episode: PodcastEpisode;
  podcastInfo: Partial<PodcastInfo>;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

function strip(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function processHtml(html: string): string {
  if (!html) return '';
  let processed = html.replace(
    /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*)>/gi,
    '<a $1href="$2" target="_blank" rel="noopener noreferrer"$3>'
  );
  processed = processed.replace(
    /(^|[^">])(https?:\/\/[^\s<]+)/gi,
    (match, prefix, url) => {
      if (prefix.includes('href=') || prefix.includes('src=')) return match;
      return `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    }
  );
  return processed;
}

function formatJP(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatDuration(raw?: string): string {
  if (!raw) return '';
  if (/^\d+$/.test(raw)) {
    const secs = Number(raw);
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  }
  return raw;
}

export default function EpisodePage({ episode, podcastInfo, prev, next }: Props) {
  const desc160 = strip(episode.description || '').slice(0, 160);

  return (
    <Layout activeNav="podcast">
      <SEO
        title={`${episode.title}`}
        description={desc160}
        ogType="article"
        twitterCard="player"
        audioUrl={episode.audioUrl}
        audioType={episode.audioType}
        ogImage={podcastInfo.imageUrl}
      />

      <section className="sub-hero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">§00 ホーム</Link>
            <span className="sep">/</span>
            <Link href="/podcast">§05 ポッドキャスト</Link>
            <span className="sep">/</span>
            <span>{episode.title}</span>
          </div>
          <div className="article-kicker" style={{ marginTop: '16px' }}>
            {podcastInfo.title || 'Antipop FM'} · Episode
          </div>
          <h1 className="article-title" style={{ marginTop: '16px' }}>{episode.title}</h1>
          <p className="article-subtitle" style={{ marginTop: '12px' }}>
            {formatJP(episode.pubDate)}
            {episode.duration && (
              <>
                <span style={{ color: 'var(--accent)', margin: '0 10px' }}>·</span>
                {formatDuration(episode.duration)}
              </>
            )}
          </p>
        </div>
      </section>

      <article className="wrap article-wrap">
        <div className="player-panel">
          <div className="play-lg" aria-hidden>
            ▶
          </div>
          <div>
            <div className="info">
              <div className="t">{episode.title}</div>
              <div className="s">{podcastInfo.title || 'Antipop FM'}</div>
            </div>
            {episode.audioUrl && (
              <audio controls preload="metadata" style={{ marginTop: '14px' }}>
                <source src={episode.audioUrl} type={episode.audioType || 'audio/mpeg'} />
                お使いのブラウザは音声再生に対応していません。
              </audio>
            )}
          </div>
        </div>

        <div className="prose markdown-content">
          <h2>エピソードについて</h2>
          <div
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: processHtml(episode.description || '') }}
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </div>

        {(prev || next) && (
          <div className="article-nav">
            {prev ? (
              <Link href={`/podcast/${prev.slug}`}>
                <div className="l">← 前のエピソード</div>
                <div className="t">{prev.title}</div>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/podcast/${next.slug}`} className="next">
                <div className="l">次のエピソード →</div>
                <div className="t">{next.title}</div>
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const rssUrl = 'https://anchor.fm/s/6877a570/podcast/rss';
    const podcast = await fetchPodcastFeed(rssUrl);
    return {
      paths: podcast.episodes.map((ep) => ({ params: { slug: ep.slug } })),
      fallback: false,
    };
  } catch (e) {
    console.error('podcast paths failed', e);
    return { paths: [], fallback: false };
  }
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  try {
    const rssUrl = 'https://anchor.fm/s/6877a570/podcast/rss';
    const podcast = await fetchPodcastFeed(rssUrl);
    const idx = podcast.episodes.findIndex((ep) => ep.slug === params?.slug);
    if (idx === -1) return { notFound: true };
    const episode = podcast.episodes[idx];
    const prev = idx < podcast.episodes.length - 1 ? podcast.episodes[idx + 1] : null;
    const next = idx > 0 ? podcast.episodes[idx - 1] : null;
    return {
      props: {
        episode,
        podcastInfo: {
          title: podcast.title,
          description: podcast.description,
          imageUrl: podcast.imageUrl,
        },
        prev: prev ? { slug: prev.slug, title: prev.title } : null,
        next: next ? { slug: next.slug, title: next.title } : null,
      },
    };
  } catch (e) {
    console.error('episode fetch failed', e);
    return { notFound: true };
  }
};
