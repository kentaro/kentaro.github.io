import type { GetStaticProps, GetStaticPaths } from 'next';
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
  day: string;
};

type YearStat = { year: string; count: number };

type Props = {
  year: string;
  entries: Entry[];
  monthCounts: { month: string; count: number }[];
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
  return { year: m[1], month: m[2].padStart(2, '0'), day: m[3].padStart(2, '0') };
}

export default function YearPage({ year, entries, monthCounts, years, totalCount }: Props) {
  const byMonth: Record<string, Entry[]> = {};
  for (const e of entries) {
    if (!byMonth[e.month]) byMonth[e.month] = [];
    byMonth[e.month].push(e);
  }
  const monthList = Object.keys(byMonth).sort((a, b) => Number(b) - Number(a));

  return (
    <Layout activeNav="journal">
      <SEO
        title={`${year}年の日記`}
        description={`${year}年の栗林健太郎の日記アーカイブ。`}
      />

      <section className="sub-hero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">§00 ホーム</Link>
            <span className="sep">/</span>
            <Link href="/journal">§03 日記</Link>
            <span className="sep">/</span>
            <span>{year}</span>
          </div>

          <div className="sub-hero-grid">
            <div>
              <h1 className="giga">{year}</h1>
              <p className="lede-en">
                All entries of the year {year} — grouped by month.
              </p>
            </div>
            <div className="meta-block">
              <b>{entries.length}</b>
              <em>entries · this year</em>
              <span style={{ display: 'block', marginTop: '10px' }}>
                全{totalCount.toLocaleString()}件の内 {entries.length} 件
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
              <li key={y.year} className={y.year === year ? 'active' : ''}>
                <Link href={`/journal/${y.year}`}>{y.year}</Link>
                <span className="c">{y.count}</span>
              </li>
            ))}
          </ul>

          <h5>Months — {year}</h5>
          <ul>
            {monthCounts.map((m) => (
              <li key={m.month}>
                <Link href={`/journal/${year}/${m.month}`}>
                  {Number(m.month)}月 <em style={{ fontStyle: 'italic', color: 'var(--ink-mute)', fontSize: '12px', marginLeft: '6px' }}>{MONTH_EN[Number(m.month)]}</em>
                </Link>
                <span className="c">{m.count}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="main-col">
          <div className="year-strip">
            {years.map((y) => (
              <Link key={y.year} href={`/journal/${y.year}`} className={y.year === year ? 'on' : ''}>
                {y.year}
                <span className="c">{y.count}</span>
              </Link>
            ))}
          </div>

          <h3 className="year-hd">
            {year}
            <em>annual ledger</em>
          </h3>
          <div className="year-rule">
            <span>{entries.length} 編</span>
            <span>
              {monthCounts.length > 0 && `${Number(monthCounts[0].month)}月 → ${Number(monthCounts[monthCounts.length - 1].month)}月`}
            </span>
          </div>

          {monthList.map((month) => {
            const list = byMonth[month].sort((a, b) => Number(b.day) - Number(a.day));
            const monthNum = Number(month);
            return (
              <div key={month} className="month-block" id={`m-${month}`}>
                <div className="month-hd">
                  <span className="mn">{MONTH_EN[monthNum]}</span>
                  <span className="mj">
                    {monthNum}月
                    <span style={{ fontSize: '13px', fontStyle: 'italic', fontFamily: 'Fraunces, serif', color: 'var(--ink-mute)', marginLeft: '8px' }}>
                      {MONTH_JA[monthNum]}
                    </span>
                  </span>
                  <Link href={`/journal/${year}/${month}`} className="ct" style={{ color: 'var(--accent)' }}>
                    {list.length}件 · 詳細 →
                  </Link>
                </div>

                {list.map((e) => {
                  const weekday = (() => {
                    const d = new Date(Number(e.year), Number(e.month) - 1, Number(e.day));
                    return WEEKDAY[d.getDay()];
                  })();
                  return (
                    <Link
                      key={e.slug}
                      href={`/${e.slug}`}
                      className="entry"
                      style={{ textDecoration: 'none', color: 'inherit' }}
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
                      <div className="aside">
                        <span className="rt">read</span>
                        <span className="nm">{weekday}</span>
                        <span className="arr">→</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}

          <div className="page-nav">
            <Link href={`/journal/${Number(year) - 1}`}>← {Number(year) - 1}年</Link>
            <span className="mid">{year}</span>
            <Link href={`/journal/${Number(year) + 1}`}>{Number(year) + 1}年 →</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const all = getAllMarkdownFiles();
  const years = new Set<string>();
  for (const { slug } of all) {
    if (!slug.startsWith('journal/')) continue;
    const parts = slug.split('/');
    if (parts[1]) years.add(parts[1]);
  }
  return {
    paths: Array.from(years).map((y) => ({ params: { year: y } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const year = params?.year as string;
  const all = getAllMarkdownFiles();
  const journalFiles = all.filter(({ slug }) => slug.startsWith('journal/'));

  const yearCounts: Record<string, number> = {};
  for (const { slug } of journalFiles) {
    const parts = slug.split('/');
    const y = parts[1];
    if (y) yearCounts[y] = (yearCounts[y] || 0) + 1;
  }
  const years: YearStat[] = Object.entries(yearCounts)
    .map(([y, count]) => ({ year: y, count }))
    .sort((a, b) => Number(b.year) - Number(a.year));

  const yearFiles = journalFiles.filter(({ slug }) => slug.split('/')[1] === year);

  const monthMap: Record<string, number> = {};
  for (const { slug } of yearFiles) {
    const d = dateFromSlug(slug);
    if (!d) continue;
    monthMap[d.month] = (monthMap[d.month] || 0) + 1;
  }
  const monthCounts = Object.entries(monthMap)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => Number(b.month) - Number(a.month));

  const entries: Entry[] = await Promise.all(
    yearFiles.map(async ({ slug }) => {
      const d = dateFromSlug(slug);
      const data = await getMarkdownData(slug);
      return {
        slug,
        title: (data?.title as string) || slug.split('/').pop() || '',
        excerpt: ((data?.excerpt as string) || '').slice(0, 160),
        year: d?.year || year,
        month: d?.month || '',
        day: d?.day || '',
      };
    })
  );

  return {
    props: {
      year,
      entries,
      monthCounts,
      years,
      totalCount: journalFiles.length,
    },
  };
};
