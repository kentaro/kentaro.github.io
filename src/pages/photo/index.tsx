import type { GetStaticProps } from 'next';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import { getAllPhotoGalleries, type PhotoGallery } from '@/lib/photo';

type Props = {
  galleries: PhotoGallery[];
};

function formatYear(date?: string) {
  if (!date) return '';
  const m = date.match(/(\d{4})/);
  return m ? m[1] : '';
}

function totalImages(galleries: PhotoGallery[]): number {
  return galleries.reduce((s, g) => s + (g.images?.length || 0), 0);
}

export default function PhotoIndex({ galleries }: Props) {
  return (
    <Layout activeNav="photo">
      <SEO title="写真" description="栗林健太郎の写真シリーズ。散歩と旅のスナップを編みもののように並べる。" />

      <section className="sub-hero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">§00 ホーム</Link>
            <span className="sep">/</span>
            <span>§04 写真</span>
          </div>
          <div className="sub-hero-grid">
            <div>
              <h1 className="giga">写真</h1>
              <p className="lede-en">
                Photographic notebook — series from strolls, travels, and small rooms.
              </p>
            </div>
            <div className="meta-block">
              <b>{galleries.length}</b>
              <em>series</em>
              <span style={{ display: 'block', marginTop: '10px' }}>
                全{totalImages(galleries)}枚
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: '48px', paddingBottom: '96px' }}>
        {galleries.length === 0 ? (
          <p style={{ color: 'var(--ink-mute)', padding: '48px 0' }}>写真シリーズはまだありません。</p>
        ) : (
          galleries.map((g) => {
            const cover = g.images[0];
            const rest = g.images.slice(1, 10);
            const year = formatYear(g.date);
            return (
              <div key={g.slug} style={{ marginBottom: '96px' }}>
                <div className="series-head">
                  <h3>
                    <Link href={`/photo/${g.slug}`} style={{ color: 'inherit' }}>
                      {g.title}
                    </Link>
                    <em>{year || g.images.length + ' photos'}</em>
                  </h3>
                  <div className="cnt">
                    {g.images.length}枚 ·{' '}
                    <Link href={`/photo/${g.slug}`} style={{ color: 'var(--accent)' }}>
                      シリーズを見る →
                    </Link>
                  </div>
                </div>

                <div className="photo-wall" style={{ marginTop: '24px' }}>
                  {cover && (
                    <Link href={`/photo/${g.slug}`} className="tile wide">
                      <img src={cover} alt={g.title} loading="lazy" />
                      <div className="meta">
                        <span className="t">{g.title}</span>
                        <span className="d">{year}</span>
                      </div>
                    </Link>
                  )}
                  {rest.map((src, i) => (
                    <Link
                      key={`${g.slug}-${i}`}
                      href={`/photo/${g.slug}`}
                      className={`tile${i === 0 ? ' tall' : ''}`}
                    >
                      <img src={src} alt={`${g.title} ${i + 2}`} loading="lazy" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const galleries = getAllPhotoGalleries();
  return { props: { galleries } };
};
