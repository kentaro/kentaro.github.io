import type { GetStaticProps, GetStaticPaths } from 'next';
import Link from 'next/link';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';

type JournalEntry = {
  slug: string;
  title: string;
  contentHtml: string;
  excerpt: string;
  year: string;
};

type Props = {
  entries: JournalEntry[];
  month: string;
  day: string;
  monthName: string;
  prevDay: { month: string; day: string } | null;
  nextDay: { month: string; day: string } | null;
};

export default function JournalDayPage({ entries, month, day, monthName, prevDay, nextDay }: Props) {
  const pad = (s: string) => s.padStart(2, '0');

  return (
    <Layout activeNav="journal">
      <SEO
        title={`${monthName}${day}日の日記一覧`}
        description={`${monthName}${day}日の栗林健太郎の日記を年を横断して読む。`}
      />

      <section className="sub-hero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">§00 ホーム</Link>
            <span className="sep">/</span>
            <Link href="/journal">§03 日記</Link>
            <span className="sep">/</span>
            <span>{month}/{day}</span>
          </div>
          <div className="sub-hero-grid">
            <div>
              <h1 className="giga">{pad(month)}.{pad(day)}</h1>
              <p className="lede-en">
                Same calendar day, across the years. {monthName}{day}日.
              </p>
            </div>
            <div className="meta-block">
              <b>{entries.length}</b>
              <em>years</em>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: '64px', paddingBottom: '96px' }}>
        {entries.length > 0 ? (
          <div>
            {entries.map((entry) => (
              <article key={entry.slug} style={{ marginBottom: '96px' }}>
                <div className="article-meta-bar">
                  <span>{entry.year}<span className="sep">·</span>{monthName}{day}日</span>
                  <span>
                    <Link href={`/${entry.slug}`} style={{ color: 'var(--accent)' }}>
                      記事ページへ →
                    </Link>
                  </span>
                </div>
                <h2 className="article-title" style={{ fontSize: 'clamp(28px, 4.2vw, 48px)' }}>
                  <Link href={`/${entry.slug}`} style={{ color: 'var(--ink)' }}>
                    {entry.year}年{monthName}{day}日
                  </Link>
                </h2>
                <div className="markdown-content" style={{ color: 'var(--ink-soft)' }}>
                  {/* eslint-disable-next-line react/no-danger */}
                  <div dangerouslySetInnerHTML={{ __html: entry.contentHtml }} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--ink-mute)', padding: '32px 0' }}>この日の日記はありません。</p>
        )}

        <div className="page-nav">
          {prevDay ? (
            <Link href={`/journal/date/${prevDay.month}/${prevDay.day}`}>
              ← {prevDay.month}/{prevDay.day}
            </Link>
          ) : (
            <span className="mid">start</span>
          )}
          <span className="mid">{monthName}{day}日</span>
          {nextDay ? (
            <Link href={`/journal/date/${nextDay.month}/${nextDay.day}`}>
              {nextDay.month}/{nextDay.day} →
            </Link>
          ) : (
            <span className="mid">end</span>
          )}
        </div>
      </section>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const all = getAllMarkdownFiles();
  const journalFiles = all.filter(({ slug }) => slug.startsWith('journal/'));
  const set = new Set<string>();
  for (const { slug } of journalFiles) {
    const parts = slug.split('/');
    if (parts.length >= 4) {
      const m = parts[3].match(/\d{4}年(\d{1,2})月(\d{1,2})日/);
      if (m) set.add(`${m[1]}/${m[2]}`);
    }
  }
  return {
    paths: Array.from(set).map((md) => {
      const [month, day] = md.split('/');
      return { params: { month, day } };
    }),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const month = params?.month as string;
  const day = params?.day as string;
  const monthNames = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const monthName = monthNames[Number(month)];

  const all = getAllMarkdownFiles();
  const journalFiles = all.filter(({ slug }) => slug.startsWith('journal/'));

  const matchFiles = journalFiles.filter(({ slug }) => {
    const parts = slug.split('/');
    if (parts.length < 4) return false;
    const m = parts[3].match(/\d{4}年(\d{1,2})月(\d{1,2})日/);
    return m && m[1] === month && m[2] === day;
  });

  const allMd: { month: string; day: string }[] = [];
  for (const { slug } of journalFiles) {
    const parts = slug.split('/');
    if (parts.length < 4) continue;
    const m = parts[3].match(/\d{4}年(\d{1,2})月(\d{1,2})日/);
    if (!m) continue;
    const key = `${m[1]}-${m[2]}`;
    if (!allMd.some((x) => `${x.month}-${x.day}` === key)) allMd.push({ month: m[1], day: m[2] });
  }
  allMd.sort((a, b) => Number(a.month) * 100 + Number(a.day) - (Number(b.month) * 100 + Number(b.day)));
  const currentIdx = allMd.findIndex((x) => x.month === month && x.day === day);
  const prevDay = currentIdx > 0 ? allMd[currentIdx - 1] : null;
  const nextDay = currentIdx >= 0 && currentIdx < allMd.length - 1 ? allMd[currentIdx + 1] : null;

  const entries = (
    await Promise.all(
      matchFiles.map(async ({ slug }) => {
        const data = await getMarkdownData(slug);
        if (!data) return null;
        const parts = slug.split('/');
        const yearMatch = parts[3].match(/(\d{4})年/);
        const year = yearMatch ? yearMatch[1] : parts[1];
        return {
          slug,
          title: (data.title as string) || parts[3],
          contentHtml: data.contentHtml as string,
          excerpt: ((data.excerpt as string) || '').slice(0, 160),
          year,
        };
      })
    )
  ).filter((x): x is JournalEntry => x !== null);
  entries.sort((a, b) => Number(b.year) - Number(a.year));

  return {
    props: { entries, month, day, monthName, prevDay, nextDay },
  };
};
