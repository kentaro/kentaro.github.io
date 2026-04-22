import type { GetStaticProps } from 'next';
import Link from 'next/link';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';

type Entry = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  year: string;
  month: string;
  day: string;
};

type YearStat = {
  year: string;
  count: number;
};

type Props = {
  entries: Entry[];
  years: YearStat[];
  totalCount: number;
};

const WEEKDAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_JA = ['', '睦月', '如月', '弥生', '卯月', '皐月', '水無月', '文月', '葉月', '長月', '神無月', '霜月', '師走'];
const MONTH_EN = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dateFromSlug(slug: string) {
  const filename = slug.split('/').pop() || '';
  const m = filename.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!m) return null;
  return {
    year: m[1],
    month: m[2].padStart(2, '0'),
    day: m[3].padStart(2, '0'),
  };
}

export default function JournalIndex({ entries, years, totalCount }: Props) {
  const currentYear = years[0]?.year;

  // Group entries by year then month
  const grouped: Record<string, Record<string, Entry[]>> = {};
  for (const e of entries) {
    if (!grouped[e.year]) grouped[e.year] = {};
    if (!grouped[e.year][e.month]) grouped[e.year][e.month] = [];
    grouped[e.year][e.month].push(e);
  }

  const yearList = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <Layout activeNav="journal">
      <SEO
        title="日記"
        description="栗林健太郎の日記。日々の活動や考えを記録しています。"
      />

      <section className="sub-hero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">§00 ホーム</Link>
            <span className="sep">/</span>
            <span>§03 日記</span>
          </div>

          <div className="sub-hero-grid">
            <div>
              <h1 className="giga">日記</h1>
              <p className="lede-en">
                A running journal kept since junior high — read like newspaper columns.
              </p>
            </div>
            <div className="meta-block">
              <b>{totalCount.toLocaleString()}</b>
              <em>entries</em>
              <span style={{ display: 'block', marginTop: '10px' }}>
                {years.length} 年分のアーカイブ
              </span>
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
                <Link href={`/journal/${y.year}`}>{y.year}</Link>
                <span className="c">{y.count}</span>
              </li>
            ))}
          </ul>

          <h5>This Journal</h5>
          <div className="summary">
            <b>{totalCount.toLocaleString()}</b>
            件の記録。ほぼ毎日、起きたこと・考えたこと・読んだものを書き残しています。
          </div>

          <h5 style={{ marginTop: '32px' }}>By month–day</h5>
          <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '12px', color: 'var(--ink-mute)', lineHeight: 1.7 }}>
            同じ月日のエントリーを年を横断して読めます。記事ページの日付 →{' '}
            <code style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px' }}>/journal/date/MM/DD</code>
          </p>
        </aside>

        <div className="main-col">
          <div className="year-strip" role="navigation" aria-label="年別ナビゲーション">
            {years.map((y) => (
              <Link
                key={y.year}
                href={`/journal/${y.year}`}
                className={y.year === currentYear ? 'on' : ''}
              >
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
                  <span>{grouped[year] && Object.values(grouped[year]).flat().length} 件の日記</span>
                  <Link href={`/journal/${year}`} style={{ color: 'var(--accent)' }}>
                    {year}年のすべてを見る →
                  </Link>
                </div>

                {monthsInYear.map((month) => {
                  const monthEntries = grouped[year][month];
                  const monthNum = Number(month);
                  return (
                    <div key={`${year}-${month}`} className="month-block">
                      <div className="month-hd">
                        <span className="mn">{MONTH_EN[monthNum]}</span>
                        <span className="mj">
                          {year}年 {monthNum}月 <span style={{ fontSize: '13px', fontStyle: 'italic', fontFamily: 'Fraunces, serif', color: 'var(--ink-mute)', marginLeft: '8px' }}>
                            {MONTH_JA[monthNum]}
                          </span>
                        </span>
                        <span className="ct">{monthEntries.length} 編</span>
                      </div>

                      {monthEntries.slice(0, 8).map((e, i) => {
                        const weekday = (() => {
                          const d = new Date(Number(e.year), Number(e.month) - 1, Number(e.day));
                          return WEEKDAY[d.getDay()];
                        })();
                        const featured = i === 0 && monthEntries.length > 3;
                        return (
                          <Link
                            key={e.slug}
                            href={`/${e.slug}`}
                            className={`entry${featured ? ' featured' : ''}`}
                            style={{ textDecoration: 'none', color: 'inherit', display: 'grid' }}
                          >
                            <div className="day">
                              <span className="d">{Number(e.day)}</span>
                              <span className="w">{weekday}</span>
                            </div>
                            <div className="body">
                              <h4>
                                <span>{e.title}</span>
                              </h4>
                              {e.excerpt && <p>{e.excerpt}</p>}
                              <div className="tags">
                                <span>{e.year}.{e.month}.{e.day}</span>
                              </div>
                            </div>
                            {!featured && (
                              <div className="aside">
                                <span className="rt">read</span>
                                <span className="nm">{weekday}</span>
                                <span className="arr">→</span>
                              </div>
                            )}
                          </Link>
                        );
                      })}

                      {monthEntries.length > 8 && (
                        <p style={{ marginTop: '16px', fontFamily: 'Fraunces, serif', fontStyle: 'italic', textAlign: 'right' }}>
                          <Link href={`/journal/${year}/${month}`} style={{ color: 'var(--accent)' }}>
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
            <Link href="/">← §00 ホームへ戻る</Link>
            <span className="mid">End of recent — older issues in the sidebar</span>
            <Link href={`/journal/${yearList[yearList.length - 1] || ''}`}>
              {yearList[yearList.length - 1]}年 アーカイブ →
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const all = getAllMarkdownFiles();
  const journalFiles = all.filter(({ slug }) => slug.startsWith('journal/'));

  // Build year counts first (cheap)
  const yearCounts: Record<string, number> = {};
  for (const { slug } of journalFiles) {
    const parts = slug.split('/');
    const y = parts[1];
    if (y) yearCounts[y] = (yearCounts[y] || 0) + 1;
  }
  const years: YearStat[] = Object.entries(yearCounts)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => Number(b.year) - Number(a.year));

  // For the "recent entries" section, only load the last ~40 entries to keep getStaticProps fast
  const sortable = journalFiles
    .map(({ slug }) => ({ slug, d: dateFromSlug(slug) }))
    .filter((x) => x.d !== null)
    .sort((a, b) => {
      const da = Number((a.d as NonNullable<typeof a.d>).year) * 10000 + Number((a.d as NonNullable<typeof a.d>).month) * 100 + Number((a.d as NonNullable<typeof a.d>).day);
      const db = Number((b.d as NonNullable<typeof b.d>).year) * 10000 + Number((b.d as NonNullable<typeof b.d>).month) * 100 + Number((b.d as NonNullable<typeof b.d>).day);
      return db - da;
    })
    .slice(0, 40);

  const entries: Entry[] = await Promise.all(
    sortable.map(async ({ slug, d }) => {
      const data = await getMarkdownData(slug);
      let date = '';
      if (data?.date instanceof Date) date = data.date.toISOString();
      else if (typeof data?.date === 'string') date = data.date;
      return {
        slug,
        title: (data?.title as string) || slug.split('/').pop() || '',
        date,
        excerpt: ((data?.excerpt as string) || '').slice(0, 160),
        year: (d as NonNullable<typeof d>).year,
        month: (d as NonNullable<typeof d>).month,
        day: (d as NonNullable<typeof d>).day,
      };
    })
  );

  return {
    props: {
      entries,
      years,
      totalCount: journalFiles.length,
    },
  };
};
