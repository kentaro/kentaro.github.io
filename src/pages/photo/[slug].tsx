import type { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import { getAllPhotoSlugs, getPhotoGallery, getAllPhotoGalleries, type PhotoGallery as PhotoGalleryType } from '@/lib/photo';
import PhotoGallery from '@/components/photo/PhotoGallery';
import PhotoLightbox from '@/components/photo/PhotoLightbox';

type Props = {
  gallery: PhotoGalleryType;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

function formatDate(date?: string) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    const m = date.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (m) return `${m[1]}.${m[2].padStart(2, '0')}.${m[3].padStart(2, '0')}`;
    return date;
  }
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function PhotoPage({ gallery, prev, next }: Props) {
  const hero = gallery.images[0];
  const rest = gallery.images.slice(1);

  return (
    <Layout activeNav="photo">
      <SEO
        title={gallery.title}
        description={gallery.description || `写真: ${gallery.title}`}
        ogImage={hero}
      />

      <section className="sub-hero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">§00 ホーム</Link>
            <span className="sep">/</span>
            <Link href="/photo">§04 写真</Link>
            <span className="sep">/</span>
            <span>{gallery.title}</span>
          </div>
          <div className="sub-hero-grid">
            <div>
              <h1 className="giga" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
                {gallery.title}
              </h1>
              {gallery.description && (
                <p className="lede-en" style={{ maxWidth: '48ch', color: 'var(--ink-soft)' }}>
                  {gallery.description}
                </p>
              )}
            </div>
            <div className="meta-block">
              <b>{gallery.images.length}</b>
              <em>photos</em>
              {gallery.date && <span style={{ display: 'block', marginTop: '10px' }}>{formatDate(gallery.date)}</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: '48px', paddingBottom: '24px' }}>
        {hero && (
          <div className="photo-hero" style={{ marginBottom: '14px' }}>
            <img src={hero} alt={gallery.title} />
          </div>
        )}

        <div className="photo-caption-bar">
          <span>
            <span className="nr">001</span>
            <span style={{ margin: '0 12px', color: 'var(--accent)' }}>·</span>
            {gallery.title}
          </span>
          <span>
            {formatDate(gallery.date)}
            <span style={{ margin: '0 12px', color: 'var(--accent)' }}>·</span>
            {gallery.images.length} photos
          </span>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: 0, paddingBottom: '48px' }}>
        <PhotoGallery images={gallery.images} />
      </section>

      <PhotoLightbox />

      {(prev || next) && (
        <section className="wrap" style={{ paddingTop: '24px', paddingBottom: '96px' }}>
          <div className="article-nav">
            {prev ? (
              <Link href={`/photo/${prev.slug}`}>
                <div className="l">← 前のシリーズ</div>
                <div className="t">{prev.title}</div>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/photo/${next.slug}`} className="next">
                <div className="l">次のシリーズ →</div>
                <div className="t">{next.title}</div>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </section>
      )}
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllPhotoSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const gallery = getPhotoGallery(slug);
  if (!gallery) return { notFound: true };

  const all = getAllPhotoGalleries();
  const idx = all.findIndex((g) => g.slug === slug);
  const prev = idx > 0 ? { slug: all[idx - 1].slug, title: all[idx - 1].title } : null;
  const next = idx < all.length - 1 && idx >= 0 ? { slug: all[idx + 1].slug, title: all[idx + 1].title } : null;

  return { props: { gallery, prev, next } };
};
