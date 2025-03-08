import Head from 'next/head';

type SEOProps = {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
};

export default function SEO({
  title = 'Kentaro Kuribayashi',
  description = 'Kentaro Kuribayashのウェブサイト',
  ogImage = '/og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
}: SEOProps) {
  const fullTitle = title === 'Kentaro Kuribayashi' ? title : `${title} | Kentaro Kuribayashi`;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Kentaro Kuribayashi" />
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <link rel="canonical" href="https://kentarokuribayashi.com" />
    </Head>
  );
} 