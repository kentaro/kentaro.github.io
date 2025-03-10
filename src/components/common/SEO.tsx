import Head from 'next/head';
import { useRouter } from 'next/router';

type SEOProps = {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
};

export default function SEO({
  title = '栗林健太郎',
  description = 'GMOペパボ株式会社取締役CTO / 一般社団法人日本CTO協会理事 / 博士（情報科学）/ 情報処理安全確保支援士',
  ogImage = 'https://pbs.twimg.com/profile_images/1893532407988367361/5EfifO80_400x400.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
}: SEOProps) {
  const fullTitle = title === '栗林健太郎' ? title : `${title} | 栗林健太郎`;
  const router = useRouter();
  
  // RSSフィードのリンクを決定
  let rssLink = null;
  if (router.pathname === '/blog' || router.pathname.startsWith('/blog/')) {
    rssLink = '/blog/feed';
  } else if (router.pathname === '/journal' || router.pathname.startsWith('/journal/')) {
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
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="栗林健太郎" />
      <meta property="og:locale" content="ja_JP" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@kentaro" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
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