import type { GetStaticProps } from 'next';
import Link from 'next/link';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';

type Entry = {
  slug: string;
  title: string;
  excerpt: string;
  year: string;
  month: string;
  date: string;
};

type YearStat = { year: string; count: number };

type Props = {
  entries: Entry[];
  years: YearStat[];
  totalCount: number;
};

const MONTH_JA = ['', '睦月', '如月', '弥生', '卯月', '皐月', '水無月', '文月', '葉月', '長月', '神無月', '霜月', '師走'];
const MONTH_EN = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmt(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function BlogIndex({ entries, years, totalCount }: Props) {
  const currentYear = years[0]?.year;

  const grouped: Record<string, Record<string, Entry[]>> = {};
  for (const e of entries) {
    if (!grouped[e.year]) grouped[e.year] = {};
    if (!grouped[e.year][e.month]) grouped[e.year][e.month] = [];
    grouped[e.year][e.month].push(e);
  }
  const yearList = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <Layout activeNav="blog">
      <SEO title="ブログ" description="栗林健太郎のブログ記事一覧。技術、マネジメント、読書などの記事。" />

      <section className="sub-hero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">ホーム</Link>
            <span className="sep">/</span>
            <span>ブログ</span>
          </div>

          <div className="sub-hero-grid">
            <div>
              <h1 className="giga">ブログ</h1>
              <p className="lede-en">技術、組織、読書について書いています。</p>
            </div>
            <div className="meta-block">
              <b>{totalCount.toLocaleString()}</b>
              <em>posts</em>
              <span style={{ display: 'block', marginTop: '10px' }}>{years.length} 年分のアーカイブ</span>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap page-cols">
        <aside className="side">
          <h5>Years</h5>
          <ul>
            {years.map((y) => (
              <li key={y.year} className={y.year === currentYear ? 'active' : ''}>
                <Link href={`/blog/${y.year}`}>{y.year}</Link>
                <span className="c">{y.count}</span>
              </li>
            ))}
          </ul>

          <h5>This Blog</h5>
          <div className="summary">
            <b>{totalCount.toLocaleString()}</b>
            件の記事を掲載しています。
          </div>
        </aside>

        <div className="main-col">
          <div className="year-strip" role="navigation" aria-label="年別ナビゲーション">
            {years.map((y) => (
              <Link key={y.year} href={`/blog/${y.year}`} className={y.year === currentYear ? 'on' : ''}>
                {y.year}
                <span className="c">{y.count}</span>
              </Link>
            ))}
          </div>

          {yearList.slice(0, 2).map((year) => {
            const monthsInYear = Object.keys(grouped[year]).sort((a, b) => Number(b) - Number(a));
            return (
              <div key={year}>
                <h3 className="year-hd">
                  {year}
                  <em>ISSUE {year}</em>
                </h3>
                <div className="year-rule">
                  <span>{Object.values(grouped[year]).flat().length} 件の記事</span>
                  <Link href={`/blog/${year}`} style={{ color: 'var(--accent)' }}>
                    {year}年のすべてを見る →
                  </Link>
                </div>

                {monthsInYear.map((month) => {
                  const monthEntries = grouped[year][month].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
                  );
                  const monthNum = Number(month);
                  return (
                    <div key={`${year}-${month}`} className="month-block">
                      <div className="month-hd">
                        <span className="mn">{MONTH_EN[monthNum]}</span>
                        <span className="mj">
                          {year}年 {monthNum}月{' '}
                          <span style={{ fontSize: '13px', fontStyle: 'normal', fontFamily: 'var(--font-sans)', color: 'var(--ink-mute)', marginLeft: '8px' }}>
                            {MONTH_JA[monthNum]}
                          </span>
                        </span>
                        <span className="ct">{monthEntries.length} 編</span>
                      </div>

                      {monthEntries.slice(0, 8).map((e) => (
                        <Link key={e.slug} href={`/${e.slug}`} className="entry" style={{ textDecoration: 'none', color: 'inherit', display: 'grid' }}>
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

                      {monthEntries.length > 8 && (
                        <p style={{ marginTop: '16px', fontFamily: 'var(--font-sans)', fontStyle: 'normal', textAlign: 'right' }}>
                          <Link href={`/blog/${year}/${month}`} style={{ color: 'var(--accent)' }}>
                            {year}年{monthNum}月のすべて（{monthEntries.length}件）→
                          </Link>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          <div className="page-nav">
            <Link href="/">← ホームへ戻る</Link>
            <span className="mid">recent — older issues in the sidebar</span>
            <a href="/blog/feed.xml">RSS →</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const all = getAllMarkdownFiles();
  const blogFiles = all.filter(({ slug }) => slug.startsWith('blog/'));

  const yearCounts: Record<string, number> = {};
  for (const { slug } of blogFiles) {
    const y = slug.split('/')[1];
    if (y) yearCounts[y] = (yearCounts[y] || 0) + 1;
  }
  const years: YearStat[] = Object.entries(yearCounts)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => Number(b.year) - Number(a.year));

  // 直近2年分だけ本文メタを読み込む（getStaticPropsを軽く保つ）
  const recentYears = new Set(years.slice(0, 2).map((y) => y.year));
  const recentFiles = blogFiles.filter(({ slug }) => recentYears.has(slug.split('/')[1]));

  const entries: Entry[] = await Promise.all(
    recentFiles.map(async ({ slug }) => {
      const parts = slug.split('/');
      const data = await getMarkdownData(slug);
      let date = '';
      if (data?.date instanceof Date) date = data.date.toISOString();
      else if (typeof data?.date === 'string') date = data.date;
      return {
        slug,
        title: (data?.title as string) || parts[parts.length - 1] || '',
        excerpt: ((data?.excerpt as string) || '').slice(0, 160),
        year: parts[1] || '',
        month: parts[2] || '',
        date,
      };
    })
  );

  return { props: { entries, years, totalCount: blogFiles.length } };
};
