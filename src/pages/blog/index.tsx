import type { GetStaticProps } from 'next';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';

type Post = {
  slug: string;
  title: string;
  date: string | null;
  excerpt: string;
};

type Props = {
  posts: Post[];
};

function formatDate(date: string | null): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function BlogPage({ posts }: Props) {
  return (
    <Layout activeNav="blog">
      <SEO
        title="ブログ"
        description="栗林健太郎のブログ記事一覧。技術、マネジメント、読書などの記事。"
      />

      <section className="sub-hero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">§00 ホーム</Link>
            <span className="sep">/</span>
            <span>§· ブログ</span>
          </div>
          <div className="sub-hero-grid">
            <div>
              <h1 className="giga">ブログ</h1>
              <p className="lede-en">
                Long-form essays — technology, management, reading, and thought.
              </p>
            </div>
            <div className="meta-block">
              <b>{posts.length}</b>
              <em>posts</em>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: '48px', paddingBottom: '96px' }}>
        {posts.length === 0 ? (
          <p style={{ color: 'var(--ink-mute)', padding: '48px 0' }}>ブログ記事はまだありません。</p>
        ) : (
          <div className="ledger">
            {posts.map((p, i) => (
              <Link
                key={p.slug}
                href={`/${p.slug}`}
                className="lrow"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <span className="n">№ {String(i + 1).padStart(2, '0')}</span>
                <span className="d">{formatDate(p.date)}</span>
                <span className="t">
                  {p.title}
                  {p.excerpt && <span className="sub">{p.excerpt.slice(0, 100)}</span>}
                </span>
                <span className="k">essay</span>
                <span className="arr">→</span>
              </Link>
            ))}
          </div>
        )}

        <div className="page-nav">
          <Link href="/">← §00 ホーム</Link>
          <span className="mid">blog</span>
          <a href="/blog/feed.xml">RSS →</a>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const allFiles = getAllMarkdownFiles();
  const blogFiles = allFiles.filter(({ slug }) => slug.startsWith('blog/'));
  const posts: Post[] = await Promise.all(
    blogFiles.map(async ({ slug }) => {
      const data = await getMarkdownData(slug);
      let date: string | null = null;
      if (data?.date instanceof Date) date = data.date.toISOString();
      else if (typeof data?.date === 'string') date = data.date;
      return {
        slug,
        title: (data?.title as string) || slug.split('/').pop() || '',
        date,
        excerpt: (data?.excerpt as string) || '',
      };
    })
  );
  posts.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  return { props: { posts } };
};
