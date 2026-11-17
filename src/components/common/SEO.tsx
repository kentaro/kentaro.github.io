import Head from 'next/head';
import { useRouter } from 'next/router';
import { SITE_NAME } from '@/lib/site';

type SEOProps = {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image' | 'player';
  audioUrl?: string;
  audioType?: string;
};

export default function SEO({
  title = SITE_NAME,
  description = '栗林健太郎の日記、エッセイ、音楽、写真、ポッドキャスト。',
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  audioUrl,
  audioType,
}: SEOProps) {
  const fullTitle = title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`;
  const router = useRouter();

  // デフォルトアイコンURL
  const defaultIconUrl = 'https://pbs.twimg.com/profile_images/1964961444673531905/wD3BXCk2_400x400.jpg';

  // 日記記事ではタイトルに著者名を重ねない。
  const isJournalPost = router.pathname.startsWith('/journal/') && router.pathname !== '/journal';
  const ogTitle = isJournalPost ? title : fullTitle;
  const ogImageUrl = ogImage || `https://ogen-sigma.vercel.app/api/og?title=${encodeURIComponent(ogTitle)}&username=${encodeURIComponent(SITE_NAME)}&iconUrl=${encodeURIComponent(defaultIconUrl)}`;

  // RSSフィードのリンクを決定
  let rssLink = null;
  if (router.pathname === '/journal' || router.pathname.startsWith('/journal/')) {
    rssLink = '/journal/feed';
  }

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />

      {/* OGP */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ja_JP" />

      {/* OG Audio for podcast episodes */}
      {audioUrl && (
        <>
          <meta property="og:audio" content={audioUrl} />
          {audioType && <meta property="og:audio:type" content={audioType} />}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@kentareaux" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Twitter Player for audio */}
      {audioUrl && twitterCard === 'player' && (
        <>
          <meta name="twitter:player" content={audioUrl} />
          <meta name="twitter:player:width" content="600" />
          <meta name="twitter:player:height" content="180" />
          <meta name="twitter:player:stream" content={audioUrl} />
          {audioType && <meta name="twitter:player:stream:content_type" content={audioType} />}
        </>
      )}

      {/* RSS Feed */}
      {rssLink && (
        <link rel="alternate" type="application/rss+xml" title={`${title} RSS Feed`} href={rssLink} />
      )}

      {/* Canonical */}
      <link rel="canonical" href="https://kentarokuribayashi.com" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
