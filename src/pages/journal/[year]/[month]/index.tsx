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

type Props = {
  year: string;
  month: string;
  monthName: string;
  entries: Entry[];
  monthsOfYear: string[];
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

export default function MonthPage({ year, month, monthName, entries, monthsOfYear }: Props) {
  const monthNum = Number(month);

  return (
    <Layout activeNav="journal">
      <SEO
        title={`${year}年${monthName}の日記`}
        description={`${year}年${monthName}の栗林健太郎の日記一覧。`}
      />

      <section className="sub-hero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">§00 ホーム</Link>
            <span className="sep">/</span>
            <Link href="/journal">§03 日記</Link>
            <span className="sep">/</span>
            <Link href={`/journal/${year}`}>{year}</Link>
            <span className="sep">/</span>
            <span>{monthName}</span>
          </div>
          <div className="sub-hero-grid">
            <div>
              <h1 className="giga">{year}.{month}</h1>
              <p className="lede-en">
                {MONTH_EN[monthNum]} — {MONTH_JA[monthNum]} · month {monthNum} of {year}.
              </p>
            </div>
            <div className="meta-block">
              <b>{entries.length}</b>
              <em>entries</em>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap page-cols">
        <aside className="side">
          <h5>{year}年の月</h5>
          <ul>
            {monthsOfYear.map((m) => (
              <li key={m} className={m === month ? 'active' : ''}>
                <Link href={`/journal/${year}/${m}`}>
                  {Number(m)}月{' '}
                  <em style={{ fontStyle: 'italic', color: 'var(--ink-mute)', fontSize: '12px', marginLeft: '6px' }}>
                    {MONTH_EN[Number(m)]}
                  </em>
                </Link>
              </li>
            ))}
          </ul>

          <h5>Year</h5>
          <div className="summary">
            <b>{year}</b>
            全{entries.length}件の{monthName}記。他の月は左のリストから。
          </div>

          <p style={{ marginTop: '24px', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '13px' }}>
            <Link href={`/journal/${year}`} style={{ color: 'var(--accent)' }}>
              ← {year}年の全体へ
            </Link>
          </p>
        </aside>

        <div className="main-col">
          <h3 className="year-hd">
            {monthNum}月
            <em>{MONTH_EN[monthNum]} — {MONTH_JA[monthNum]}</em>
          </h3>
          <div className="year-rule">
            <span>{year}年 {monthName}</span>
            <span>{entries.length} 編</span>
          </div>

          {entries.length > 0 ? (
            <div>
              {entries.map((e, i) => {
                const weekday = (() => {
                  const d = new Date(Number(e.year), Number(e.month) - 1, Number(e.day));
                  return WEEKDAY[d.getDay()];
                })();
                const featured = i === 0 && entries.length > 2;
                return (
                  <Link
                    key={e.slug}
                    href={`/${e.slug}`}
                    className={`entry${featured ? ' featured' : ''}`}
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
            </div>
          ) : (
            <p style={{ color: 'var(--ink-mute)', padding: '32px 0' }}>この月の日記はありません。</p>
          )}

          <div className="page-nav">
            <Link href={`/journal/${year}`}>← {year}年へ</Link>
            <span className="mid">{year} · {monthNum}月</span>
            <Link href="/journal">日記のトップへ →</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const all = getAllMarkdownFiles();
  const set = new Set<string>();
  for (const { slug } of all) {
    if (!slug.startsWith('journal/')) continue;
    const parts = slug.split('/');
    if (parts[1] && parts[2]) set.add(`${parts[1]}/${parts[2]}`);
  }
  return {
    paths: Array.from(set).map((ym) => {
      const [year, month] = ym.split('/');
      return { params: { year, month } };
    }),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const year = params?.year as string;
  const month = params?.month as string;
  const monthNames = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const monthName = monthNames[Number(month)];

  const all = getAllMarkdownFiles();
  const monthFiles = all.filter(({ slug }) => {
    const parts = slug.split('/');
    return parts[0] === 'journal' && parts[1] === year && parts[2] === month;
  });

  const entries: Entry[] = await Promise.all(
    monthFiles.map(async ({ slug }) => {
      const d = dateFromSlug(slug);
      const data = await getMarkdownData(slug);
      return {
        slug,
        title: (data?.title as string) || slug.split('/').pop() || '',
        excerpt: ((data?.excerpt as string) || '').slice(0, 180),
        year: d?.year || year,
        month: d?.month || month,
        day: d?.day || '',
      };
    })
  );
  entries.sort((a, b) => Number(b.day) - Number(a.day));

  // All months of this year for sidebar
  const yearMonths = new Set<string>();
  for (const { slug } of all) {
    if (!slug.startsWith('journal/')) continue;
    const parts = slug.split('/');
    if (parts[1] === year && parts[2]) yearMonths.add(parts[2]);
  }
  const monthsOfYear = Array.from(yearMonths).sort((a, b) => Number(a) - Number(b));

  return {
    props: { year, month, monthName, entries, monthsOfYear },
  };
};
