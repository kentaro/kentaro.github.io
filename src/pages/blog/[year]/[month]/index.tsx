import type { GetStaticProps, GetStaticPaths } from 'next';
import Link from 'next/link';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';

type Entry = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};

type Props = {
  year: string;
  month: string;
  entries: Entry[];
  monthCounts: { month: string; count: number }[];
  totalInYear: number;
};

const MONTH_JA = ['', '睦月', '如月', '弥生', '卯月', '皐月', '水無月', '文月', '葉月', '長月', '神無月', '霜月', '師走'];
const MONTH_EN = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmt(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function BlogMonthPage({ year, month, entries, monthCounts, totalInYear }: Props) {
  const monthNum = Number(month);
  return (
    <Layout activeNav="blog">
      <SEO title={`${year}年${monthNum}月のブログ`} description={`${year}年${monthNum}月の栗林健太郎のブログ記事一覧。`} />

      <section className="sub-hero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">ホーム</Link>
            <span className="sep">/</span>
            <Link href="/blog">ブログ</Link>
            <span className="sep">/</span>
            <Link href={`/blog/${year}`}>{year}</Link>
            <span className="sep">/</span>
            <span>{monthNum}月</span>
          </div>

          <div className="sub-hero-grid">
            <div>
              <h1 className="giga">
                {year}.{month}
              </h1>
              <p className="lede-en">
                {MONTH_EN[monthNum]} {year} — {entries.length} {entries.length === 1 ? 'post' : 'posts'}.
              </p>
            </div>
            <div className="meta-block">
              <b>{entries.length}</b>
              <em>posts</em>
              <span style={{ display: 'block', marginTop: '10px' }}>{year}年 全{totalInYear}件</span>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap page-cols">
        <aside className="side">
          <h5>Months — {year}</h5>
          <ul>
            {monthCounts.map((m) => (
              <li key={m.month} className={m.month === month ? 'active' : ''}>
                <Link href={`/blog/${year}/${m.month}`}>
                  {Number(m.month)}月{' '}
                  <em style={{ fontStyle: 'normal', color: 'var(--ink-mute)', fontSize: '12px', marginLeft: '6px' }}>
                    {MONTH_EN[Number(m.month)]}
                  </em>
                </Link>
                <span className="c">{m.count}</span>
              </li>
            ))}
          </ul>
          <h5 style={{ marginTop: '32px' }}>Archive</h5>
          <ul>
            <li>
              <Link href={`/blog/${year}`}>{year}年すべて</Link>
              <span className="c">{totalInYear}</span>
            </li>
            <li>
              <Link href="/blog">ブログトップ</Link>
            </li>
          </ul>
        </aside>

        <div className="main-col">
          <h3 className="year-hd">
            {year}年 {monthNum}月
            <em>{MONTH_JA[monthNum]}</em>
          </h3>
          <div className="year-rule">
            <span>{entries.length} 編</span>
            <Link href={`/blog/${year}`} style={{ color: 'var(--accent)' }}>
              {year}年のすべて →
            </Link>
          </div>

          <div className="month-block">
            {entries.map((e) => (
              <Link key={e.slug} href={`/${e.slug}`} className="entry" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="day">
                  <span className="d">{new Date(e.date).getDate() || ''}</span>
                  <span className="w">{MONTH_EN[monthNum]}</span>
                </div>
                <div className="body">
                  <h4>
                    <span>{e.title}</span>
                  </h4>
                  {e.excerpt && <p>{e.excerpt}</p>}
                  <div className="tags">
                    <span>{fmt(e.date)}</span>
                  </div>
                </div>
                <div className="aside">
                  <span className="rt">read</span>
                  <span className="nm">essay</span>
                  <span className="arr">→</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="page-nav">
            <Link href={`/blog/${year}`}>← {year}年</Link>
            <span className="mid">{year}.{month}</span>
            <Link href="/blog">ブログトップ →</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const all = getAllMarkdownFiles();
  const paths = new Set<string>();
  for (const { slug } of all) {
    if (!slug.startsWith('blog/')) continue;
    const parts = slug.split('/');
    if (parts[1] && parts[2]) paths.add(`${parts[1]}/${parts[2]}`);
  }
  return {
    paths: Array.from(paths).map((p) => {
      const [year, month] = p.split('/');
      return { params: { year, month } };
    }),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const year = params?.year as string;
  const month = params?.month as string;
  const all = getAllMarkdownFiles();
  const blogFiles = all.filter(({ slug }) => slug.startsWith('blog/'));
  const yearFiles = blogFiles.filter(({ slug }) => slug.split('/')[1] === year);

  const monthMap: Record<string, number> = {};
  for (const { slug } of yearFiles) {
    const m = slug.split('/')[2];
    if (m) monthMap[m] = (monthMap[m] || 0) + 1;
  }
  const monthCounts = Object.entries(monthMap)
    .map(([m, count]) => ({ month: m, count }))
    .sort((a, b) => Number(b.month) - Number(a.month));

  const monthFiles = yearFiles.filter(({ slug }) => slug.split('/')[2] === month);
  const entries: Entry[] = await Promise.all(
    monthFiles.map(async ({ slug }) => {
      const parts = slug.split('/');
      const data = await getMarkdownData(slug);
      let date = '';
      if (data?.date instanceof Date) date = data.date.toISOString();
      else if (typeof data?.date === 'string') date = data.date;
      return {
        slug,
        title: (data?.title as string) || parts[parts.length - 1] || '',
        excerpt: ((data?.excerpt as string) || '').slice(0, 160),
        date,
      };
    })
  );
  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { props: { year, month, entries, monthCounts, totalInYear: yearFiles.length } };
};
