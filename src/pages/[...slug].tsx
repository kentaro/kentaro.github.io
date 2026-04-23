import type { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';

type PostData = {
  title: string;
  contentHtml: string;
  date: string | null;
  excerpt?: string;
  [key: string]: unknown;
};

type NavRef = { slug: string; title: string } | null;

type Props = {
  postData: PostData | null;
  mode: 'journal' | 'profile' | 'article';
  dayOfMonth: { year: string; month: string; day: string; weekday: string; monthName: string } | null;
  prevPost: NavRef;
  nextPost: NavRef;
  slugPath: string[];
};

const WEEKDAY = ['日', '月', '火', '水', '木', '金', '土'];
const MONTH_NAMES = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function extractJournalDate(slug: string) {
  const filename = slug.split('/').pop() || '';
  const m = filename.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!m) return null;
  const year = m[1];
  const month = m[2].padStart(2, '0');
  const day = m[3].padStart(2, '0');
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return { year, month, day, weekday: WEEKDAY[d.getDay()], monthName: MONTH_NAMES[Number(m[2])] };
}

function formatDateJP(date: string | null | undefined) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function Post({ postData, mode, dayOfMonth, prevPost, nextPost, slugPath }: Props) {
  const router = useRouter();

  if (!postData) {
    return (
      <Layout>
        <section className="sub-hero">
          <div className="wrap">
            <div className="crumb">
              <Link href="/">§00 ホーム</Link>
              <span className="sep">/</span>
              <span>404</span>
            </div>
            <h1 className="giga">404</h1>
            <p className="lede-en">お探しのページは存在しないか、移動した可能性があります。</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (mode === 'profile') {
    return (
      <Layout activeNav="profile">
        <SEO
          title="プロフィール"
          description={postData.excerpt || 'GMOペパボ取締役CTO / 博士（情報科学）/ 情報処理安全確保支援士'}
        />
        <section className="sub-hero">
          <div className="wrap">
            <div className="crumb">
              <Link href="/">§00 ホーム</Link>
              <span className="sep">/</span>
              <span>§01 プロフィール</span>
            </div>
            <div className="sub-hero-grid">
              <div>
                <h1 className="giga"><span className="name-unit">栗林健太郎</span></h1>
                <p className="lede-en">Kentaro Kuribayashi — a brief biography in editorial form.</p>
              </div>
              <div className="meta-block">
                <b>{new Date().getFullYear() - 1976}</b>
                <em>years · since 1976</em>
              </div>
            </div>
          </div>
        </section>

        <section className="wrap cv-grid">
          <aside className="cv-side">
            <div className="portrait">
              <img
                src="https://pbs.twimg.com/profile_images/1964961444673531905/wD3BXCk2_400x400.jpg"
                alt="栗林健太郎"
              />
            </div>
            <div className="name"><span className="name-unit">栗林健太郎</span></div>
            <div className="name-en">Kentaro Kuribayashi</div>
            <div className="role">
              GMOペパボ株式会社 取締役CTO
              <br />
              博士（情報科学）
              <br />
              情報処理安全確保支援士
            </div>
            <div className="contact">
              <div className="k">Writes</div>
              <Link href="/journal">日記</Link>
              <Link href="/works">制作物</Link>

              <div className="k">Sounds</div>
              <Link href="/podcast">Antipop FM</Link>

              <div className="k">Images</div>
              <Link href="/photo">写真</Link>

              <div className="k">Channels</div>
              <a href="https://x.com/kentaro" target="_blank" rel="noopener noreferrer">X / Twitter</a>
              <a href="https://github.com/kentaro" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/kentaro-kuribayashi" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="mailto:kentarok@gmail.com">kentarok@gmail.com</a>
            </div>
          </aside>

          <div>
            <div className="cv-block">
              <article className="prose markdown-content">
                {/* eslint-disable-next-line react/no-danger */}
                <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
              </article>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const isJournal = mode === 'journal';
  const navActive = isJournal ? 'journal' : slugPath[0] === 'blog' ? 'blog' : 'home';

  return (
    <Layout activeNav={navActive as 'journal' | 'blog' | 'home'}>
      <SEO
        title={postData.title}
        description={postData.excerpt || postData.title}
        ogType="article"
      />

      <article className="wrap article-wrap">
        <div className="article-meta-bar">
          <span>
            {isJournal ? '§03 Journal' : '§· Writing'}
            <span className="sep">·</span>
            {formatDateJP(postData.date)}
          </span>
          <span>
            <Link href={isJournal ? '/journal' : '/'} style={{ color: 'var(--ink-mute)' }}>
              ← 一覧へ戻る
            </Link>
          </span>
        </div>

        {isJournal && dayOfMonth && (
          <div className="article-kicker">
            {dayOfMonth.year} / {dayOfMonth.monthName} / {dayOfMonth.weekday}曜日
          </div>
        )}

        {isJournal && dayOfMonth ? (
          <div className="article-date">
            <span className="big">{Number(dayOfMonth.day)}</span>
            <span>
              {dayOfMonth.year}年 {dayOfMonth.monthName} 第{Math.ceil(Number(dayOfMonth.day) / 7)}週 /{' '}
              {dayOfMonth.weekday}曜
            </span>
          </div>
        ) : null}

        <h1 className="article-title">{postData.title}</h1>
        {postData.excerpt && (
          <p className="article-subtitle">
            {postData.excerpt.slice(0, 160)}
            {postData.excerpt.length > 160 ? '…' : ''}
          </p>
        )}

        <div className="prose markdown-content">
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </div>

        {isJournal && dayOfMonth && (
          <div className="article-tags" style={{ marginTop: '48px' }}>
            <Link href={`/journal/${dayOfMonth.year}`}>— {dayOfMonth.year}年</Link>
            <Link href={`/journal/${dayOfMonth.year}/${dayOfMonth.month}`}>— {dayOfMonth.year}年 {dayOfMonth.monthName}</Link>
            <Link href={`/journal/date/${Number(dayOfMonth.month)}/${Number(dayOfMonth.day)}`}>
              — 毎年の {dayOfMonth.monthName}{Number(dayOfMonth.day)}日
            </Link>
          </div>
        )}

        {(prevPost || nextPost) && (
          <div className="article-nav">
            {prevPost ? (
              <Link href={`/${prevPost.slug}`} className="prev">
                <div className="l">← 前の記事</div>
                <div className="t">{prevPost.title}</div>
              </Link>
            ) : (
              <span />
            )}
            {nextPost ? (
              <Link href={`/${nextPost.slug}`} className="next">
                <div className="l">次の記事 →</div>
                <div className="t">{nextPost.title}</div>
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = getAllMarkdownFiles();
  const filtered = files.filter(({ slug }) => !slug.startsWith('photo/'));
  const paths = filtered.map(({ slug }) => ({
    params: { slug: slug.split('/').filter(Boolean) },
  }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slugPath = (params?.slug as string[]) || [];
  const slug = slugPath.join('/');
  const isJournal = slugPath[0] === 'journal';
  const isProfile = slugPath[0] === 'profile';

  const postData = await getMarkdownData(slug);
  if (!postData) {
    return { notFound: true };
  }

  let date: string | null = null;
  if (postData.date instanceof Date) date = postData.date.toISOString();
  else if (typeof postData.date === 'string') date = postData.date;

  let prevPost: NavRef = null;
  let nextPost: NavRef = null;
  let dayOfMonth: Props['dayOfMonth'] = null;

  if (isJournal) {
    dayOfMonth = extractJournalDate(slug);
    const parts = slug.split('/');
    if (parts.length >= 4) {
      const year = parts[1];
      const month = parts[2];
      const allFiles = getAllMarkdownFiles();
      const journalFiles = allFiles.filter((f) => f.slug.startsWith('journal/'));
      type Cell = { slug: string; day: number; filename: string; year: string; month: string };
      const buckets: Record<string, Cell[]> = {};
      for (const { slug: s } of journalFiles) {
        const sp = s.split('/');
        if (sp.length < 4) continue;
        const y = sp[1];
        const mo = sp[2];
        const fn = sp[3];
        const m = fn.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (!m) continue;
        const key = `${y}-${mo}`;
        if (!buckets[key]) buckets[key] = [];
        buckets[key].push({ slug: s, day: Number(m[3]), filename: fn, year: y, month: mo });
      }
      for (const k in buckets) buckets[k].sort((a, b) => a.day - b.day);
      const cur = buckets[`${year}-${month}`] || [];
      const idx = cur.findIndex((c) => c.slug === slug);
      if (idx > 0) prevPost = { slug: cur[idx - 1].slug, title: cur[idx - 1].filename };
      else if (idx === 0) {
        const d = new Date(Number(year), Number(month) - 1, 1);
        d.setDate(0);
        const pmy = d.getFullYear().toString();
        const pmm = (d.getMonth() + 1).toString().padStart(2, '0');
        const pm = buckets[`${pmy}-${pmm}`] || [];
        if (pm.length) {
          const last = pm[pm.length - 1];
          prevPost = { slug: last.slug, title: last.filename };
        }
      }
      if (idx >= 0 && idx < cur.length - 1) nextPost = { slug: cur[idx + 1].slug, title: cur[idx + 1].filename };
      else if (idx === cur.length - 1) {
        const d = new Date(Number(year), Number(month) - 1, 1);
        d.setMonth(d.getMonth() + 1);
        const nmy = d.getFullYear().toString();
        const nmm = (d.getMonth() + 1).toString().padStart(2, '0');
        const nm = buckets[`${nmy}-${nmm}`] || [];
        if (nm.length) prevPost = prevPost; // keep
        if (nm.length) nextPost = { slug: nm[0].slug, title: nm[0].filename };
      }
    }
  }

  return {
    props: {
      postData: {
        title: (postData.title as string) || '',
        contentHtml: (postData.contentHtml as string) || '',
        date,
        excerpt: (postData.excerpt as string) || '',
      },
      mode: isJournal ? 'journal' : isProfile ? 'profile' : 'article',
      dayOfMonth,
      prevPost,
      nextPost,
      slugPath,
    },
  };
};
