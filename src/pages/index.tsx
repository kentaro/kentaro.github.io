import type { GetStaticProps } from 'next';
import Link from 'next/link';
import fs from 'node:fs';
import path from 'node:path';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import { getAllPhotoGalleries, type PhotoGallery } from '@/lib/photo';
import { fetchPodcastFeed, type PodcastEpisode } from '@/lib/podcast';

type JournalSummary = {
  slug: string;
  title: string;
  date: string | null;
  excerpt: string;
};

type WorkSummary = {
  title: string;
  url: string;
  date: string;
  sourceName: string;
  source: string;
};

type PhotoSummary = {
  slug: string;
  title: string;
  date: string | null;
  cover: string | null;
};

type PodcastSummary = {
  slug: string;
  title: string;
  pubDate: string;
  duration: string;
  description: string;
};

type Props = {
  journals: JournalSummary[];
  works: WorkSummary[];
  photos: PhotoSummary[];
  podcasts: PodcastSummary[];
};

const ATTRACTIONS = [
  {
    roman: 'Lightness & Intimacy',
    title: '軽さと親密さ',
    dropChar: '軽',
    restText: 'さと親密さ',
    body:
      'ロラン・バルトの晩年のテクスト。スカルラッティのソナタ——何の意味もなくコロコロと転がっているような音楽。ロココの室内文化。重厚さや感傷を避け、軽さと運動性のあるものに惹かれる。大きなものより小さなもの、体系より手触り。',
    numRoman: 'i.',
  },
  {
    roman: 'Making Things',
    title: '制作すること',
    dropChar: '制',
    restText: '作すること',
    body:
      'ひとは生きていることそのことが制作であるはず。批評もまた制作、技術もまた制作。あらゆることに制作者として向き合う。「〜のひと」と固定されることへの抵抗。ソフトウェアを書き、文章を書き、写真を撮る。',
    numRoman: 'ii.',
  },
  {
    roman: 'Reading',
    title: '読むこと',
    dropChar: '読',
    restText: 'むこと',
    body:
      '歴史、哲学、アート、社会科学、サイエンス。ジャンルを横断しながら、概念を拾い集めて結びつける。日記を習慣的に書いている。読むことと書くことは同じ運動の表と裏。年に200冊。',
    numRoman: 'iii.',
  },
  {
    roman: 'Concepts into Language',
    title: '概念を言語化すること',
    dropChar: '概',
    restText: '念を言語化すること',
    body:
      '現実の裂け目から概念が生じる。それを言葉にし、構造にする。ソフトウェアアーキテクチャも、組織設計も、批評も、本質的には同じ営み——混沌に形を与えること。',
    numRoman: 'iv.',
  },
  {
    roman: 'The Tangible',
    title: '手触りのあるもの',
    dropChar: '手',
    restText: '触りのあるもの',
    body:
      '美術館と博物館。現代作家のうつわ。江戸前鮨。歌舞伎。落語。公園の散歩。写真。フランス語。シーシャ。アマチュア無線。ソーシャルVR。小さな趣味を数え上げればきりがない——すべては「手触り」という一点に収束する。',
    numRoman: 'v.',
  },
];

const FACTS = [
  { y: '2025', w: '博士（情報科学）学位取得', t: 'JAIST' },
  { y: '2022', w: '博士前期課程・優秀修了', t: 'JAIST' },
  { y: '2020', w: 'JAIST 博士前期課程 入学', t: '学究の道' },
  { y: '2019', w: '日本CTO協会 理事 就任', t: '現任' },
  { y: '2017', w: 'GMOペパボ 取締役CTO 就任', t: '現任' },
  { y: '2016', w: 'ペパボ研究所 所長', t: '現任' },
  { y: '2014', w: '技術責任者に就任', t: '技術統括' },
  { y: '2012', w: 'paperboy&co.（現 GMOペパボ）入社', t: '現職' },
  { y: '2008', w: '株式会社はてな 入社', t: 'Webエンジニア' },
  { y: '2002', w: '奄美市役所 入所', t: '地元へ' },
  { y: '1995', w: '東京都立大学 法学部 入学', t: '政治学科' },
  { y: '1976', w: '奄美大島に生まれる', t: 'origin' },
];

const CREDS = [
  { l: 'Years', v: '23+', s: 'years in software' },
  { l: 'Books / yr', v: '~200', s: 'across disciplines' },
  { l: 'Degree', v: 'Ph.D.', s: 'Information Science' },
];

const KEYWORDS = [
  'バルト', 'スカルラッティ', 'ロココ', 'Elixir', 'IoT',
  '歌舞伎', '落語', '現代アート', '写真', 'フランス語',
  '批評', '哲学', '歴史', '社会科学', 'インゴルド',
  'ナボコフ', 'カヴァフィス', 'うつわ', '江戸前鮨',
  'シーシャ', 'VRChat', 'アマチュア無線', '散歩',
];

const CHANNELS = [
  { idx: 'α', nm: 'X / Twitter', hd: '@kentaro', url: 'https://x.com/kentaro' },
  { idx: 'β', nm: 'GitHub', hd: 'kentaro', url: 'https://github.com/kentaro' },
  { idx: 'γ', nm: 'LinkedIn', hd: 'kentaro-kuribayashi', url: 'https://www.linkedin.com/in/kentaro-kuribayashi' },
  { idx: 'δ', nm: 'Discord', hd: 'Antipop Lounge', url: 'https://discord.gg/SXyKFCyMd5' },
  { idx: 'ε', nm: 'Facebook', hd: 'kentarok', url: 'https://facebook.com/kentarok' },
  { idx: 'ζ', nm: 'Email', hd: 'kentarok@gmail.com', url: 'mailto:kentarok@gmail.com' },
];

function formatDateJP(date: string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function dayOfEntry(slug: string): { year: string; month: string; day: string; weekday: string } {
  const parts = slug.split('/');
  const filename = parts[parts.length - 1];
  const match = filename.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!match) return { year: '', month: '', day: '', weekday: '' };
  const year = match[1];
  const month = match[2].padStart(2, '0');
  const day = match[3].padStart(2, '0');
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  const wk = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return { year, month, day, weekday: wk[d.getDay()] };
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function Home({ journals, works, photos, podcasts }: Props) {
  return (
    <Layout activeNav="home">
      <SEO
        title="栗林健太郎"
        description="栗林健太郎のウェブサイト。概念と構造を制作する。GMOペパボ株式会社 取締役CTO / 博士（情報科学）。"
      />

      {/* ========== HERO ========== */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-meta">
            <span>栗林健太郎のホームページ<span className="dot" />since 2003</span>
            <span>A monograph on concepts &amp; structures</span>
          </div>

          <div className="giga-row">
            <h1 className="giga mincho" aria-label="栗林健太郎">
              <span className="char">栗</span>
              <span className="char">林</span>
              <span className="char">健</span>
              <span className="char">太</span>
              <span className="char">郎</span>
            </h1>
            <div className="giga-en">
              <b>Kentaro Kuribayashi</b>
              Writer, engineer, researcher —<br />
              crafting concepts &amp; structures.
            </div>
          </div>

          <div className="lede">
            <div>
              <p className="statement mincho">
                概念と構造を制作する。<br />
                「傑作」を目指さないこと。ただ運動を続けていくこと、それも多方向へと無目的に展開していくこと——ソフトウェアを書き、文章を書き、写真を撮り、読み、考える。すべては同じひとつの運動の、ちがう顕れかたである。
              </p>
              <div className="sig">
                <img
                  src="https://pbs.twimg.com/profile_images/1964961444673531905/wD3BXCk2_400x400.jpg"
                  alt="栗林健太郎"
                />
                <div className="who">
                  <span className="name">栗林健太郎</span>
                  <span className="role">GMOペパボ株式会社 取締役CTO / 博士（情報科学）</span>
                </div>
              </div>
            </div>

            <div className="pull-meta">
              <ul>
                <li><span className="k">役職</span><span className="v">取締役CTO</span></li>
                <li><span className="k">学位</span><span className="v">博士（情報科学）</span></li>
                <li><span className="k">拠点</span><span className="v">東京 / 奄美</span></li>
                <li><span className="k">関心</span><span className="v">Elixir · IoT · 批評</span></li>
                <li><span className="k">連載</span><span className="v">日記 · 中学生から</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== §01 惹かれるもの ========== */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-num">
              § 01 <span className="slash">/</span> Attractions
            </div>
            <h2 className="sec-title">
              惹かれるもの
              <span className="en">five notes</span>
            </h2>
          </div>

          <div className="attractions">
            {ATTRACTIONS.map((a, i) => (
              <article
                key={a.title}
                className="attr"
                style={i === ATTRACTIONS.length - 1 ? { gridColumn: '1 / -1', borderRight: 'none', borderBottom: 'none' } : undefined}
              >
                <span className="num">{a.numRoman}</span>
                <div className="roman">{a.roman}</div>
                <h3>
                  <span className="drop">{a.dropChar}</span>
                  {a.restText}
                </h3>
                <p>{a.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========== §02 来歴 ========== */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-num">§ 02 <span className="slash">/</span> Profile</div>
            <h2 className="sec-title">
              来歴
              <span className="en">biography</span>
            </h2>
          </div>

          <div className="profile-row">
            <div className="bio">
              <p>
                1976年生まれ。幼少期より高校卒業まで奄美大島で過ごす。1995年、東京都立大学法学部に入学。政治学科に進み、日本政治史および行政学を中心に学ぶ。
                数年のブランクを経て2002年に奄美市役所に入所。PHPでブログを自作したことからプログラミングにのめり込み、HTML/CSSやPerl5のコミュニティで活動する。
              </p>
              <p className="highlight">
                エンジニアであることは、概念と構造を制作する営みのひとつの顕れである。書くこと、読むこと、撮ること、語ること——それぞれが、同じ運動を異なる言語でかたちにしていく実践である。
              </p>
              <p>
                2008年、株式会社はてなにWebエンジニアとして入社。2012年、GMOペパボに移籍。2014年より技術責任者、2017年より取締役CTO。
                2020年、北陸先端科学技術大学院大学に入学し、2025年に博士（情報科学）の学位を取得。IoTシステムの基盤技術、Elixir/Erlang/OTPのIoTシステムへの応用を研究。
              </p>
              <p style={{ marginTop: '28px' }}>
                <Link
                  href="/profile"
                  style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}
                >
                  詳しいプロフィールを読む →
                </Link>
              </p>
            </div>

            <div>
              <div className="creds">
                {CREDS.map((c) => (
                  <div key={c.l} className="cred">
                    <div className="l">{c.l}</div>
                    <div className="v">{c.v}</div>
                    <div className="s">{c.s}</div>
                  </div>
                ))}
              </div>

              <div className="orn" style={{ margin: '32px 0 16px' }}>
                <span className="l" />
                <span className="s">✦</span>
                <span className="l" />
              </div>

              <div className="facts">
                {FACTS.map((f) => (
                  <div key={f.y} className="fact">
                    <span className="y">{f.y}</span>
                    <span className="w">{f.w}</span>
                    <span className="t">{f.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== §03 語彙の星座 ========== */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-num">§ 03 <span className="slash">/</span> Keywords</div>
            <h2 className="sec-title">
              語彙の星座
              <span className="en">constellation</span>
            </h2>
          </div>
          <div className="kw-box">
            <div className="kw-flow">
              {KEYWORDS.map((k) => (
                <span key={k} className="kw">
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== §04 制作物 ========== */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-num">§ 04 <span className="slash">/</span> Works</div>
            <h2 className="sec-title">
              制作物
              <span className="en">selected ledger</span>
            </h2>
          </div>

          {works.length > 0 ? (
            <div className="ledger">
              {works.map((w, i) => (
                <a
                  key={`${w.url}-${i}`}
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lrow"
                >
                  <span className="n">№ {String(i + 1).padStart(2, '0')}</span>
                  <span className="d">{formatDateJP(w.date)}</span>
                  <span className="t">
                    {w.title}
                    <span className="sub">{w.sourceName}</span>
                  </span>
                  <span className="k">{w.source}</span>
                  <span className="arr">→</span>
                </a>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--ink-mute)' }}>制作物はまだ読み込まれていません。</p>
          )}

          <p style={{ marginTop: '32px', textAlign: 'right', fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>
            <Link href="/works" style={{ color: 'var(--accent)' }}>
              すべての制作物を見る →
            </Link>
          </p>
        </div>
      </section>

      {/* ========== §05 日記 ========== */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-num">§ 05 <span className="slash">/</span> Journal</div>
            <h2 className="sec-title">
              日記
              <span className="en">marginalia</span>
            </h2>
          </div>

          {journals.length > 0 ? (
            <div className="journal-grid">
              {journals.slice(0, 3).map((j) => {
                const dt = dayOfEntry(j.slug);
                return (
                  <Link key={j.slug} href={`/${j.slug}`} className="jcard">
                    <div className="dt">
                      <span className="y">
                        {dt.year}.{dt.month}
                      </span>
                      <span className="d">{dt.day}</span>
                    </div>
                    <h4>{j.title}</h4>
                    <p>{j.excerpt}</p>
                    <div className="mg">
                      <span>{dt.weekday}</span>
                      <span>—</span>
                      <span>{formatDateJP(j.date)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--ink-mute)' }}>日記はまだありません。</p>
          )}

          <p style={{ marginTop: '32px', textAlign: 'right', fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>
            <Link href="/journal" style={{ color: 'var(--accent)' }}>
              日記アーカイブへ →
            </Link>
          </p>
        </div>
      </section>

      {/* ========== §06 写真 ========== */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-num">§ 06 <span className="slash">/</span> Photo</div>
            <h2 className="sec-title">
              写真
              <span className="en">selected frames</span>
            </h2>
          </div>

          {photos.length > 0 ? (
            <div className="photo-grid">
              {photos.slice(0, 5).map((p, i) => (
                <Link
                  key={p.slug}
                  href={`/photo/${p.slug}`}
                  className={`ph${i === 0 ? ' main' : ''}`}
                >
                  {p.cover && <img src={p.cover} alt={p.title} />}
                  <span className="cap">{p.title}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--ink-mute)' }}>写真はまだありません。</p>
          )}

          <p style={{ marginTop: '32px', textAlign: 'right', fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>
            <Link href="/photo" style={{ color: 'var(--accent)' }}>
              すべてのシリーズを見る →
            </Link>
          </p>
        </div>
      </section>

      {/* ========== §07 つながる ========== */}
      <section className="sec" style={{ borderBottom: 'none' }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-num">§ 07 <span className="slash">/</span> Podcast</div>
            <h2 className="sec-title">
              ポッドキャスト
              <span className="en">listenable notebooks</span>
            </h2>
          </div>

          <div className="connect">
            <div>
              <h3 className="big-cta mincho">
                声の
                <br />
                <em>notebook</em>
              </h3>
              <p style={{ fontFamily: '"Zen Old Mincho", serif', color: 'var(--ink-soft)', fontSize: '17px', lineHeight: 1.95, maxWidth: '36ch' }}>
                読んだ本、考えたこと、仕事のこと、生活のこと。
                活字にはならない手前のことを、声で残している。
              </p>
              {podcasts.length > 0 && (
                <Link
                  href={`/podcast/${podcasts[0].slug}`}
                  style={{
                    marginTop: '24px',
                    padding: '16px 20px',
                    border: '1px solid var(--rule)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '14px',
                    background: 'var(--paper-2)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: '44px',
                      height: '44px',
                      background: 'var(--accent)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-ink)',
                      fontSize: '16px',
                      flexShrink: 0,
                    }}
                  >
                    ▶
                  </span>
                  <span>
                    <span style={{ display: 'block', fontFamily: '"Zen Old Mincho", serif', fontWeight: 700, fontSize: '16px' }}>
                      最新：{podcasts[0].title}
                    </span>
                    <span style={{ display: 'block', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '12px', color: 'var(--ink-mute)', marginTop: '4px' }}>
                      {formatDateJP(podcasts[0].pubDate)}
                      {podcasts[0].duration && ` · ${podcasts[0].duration}`}
                    </span>
                  </span>
                </Link>
              )}
            </div>

            <ul className="chl">
              {CHANNELS.map((ch, i) => (
                <li key={ch.nm}>
                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '30px 1fr auto 20px',
                      gap: '16px',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                    <span className="nm">{ch.nm}</span>
                    <span className="hd">{ch.hd}</span>
                    <span className="ar">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Journals — latest 3
  let journals: JournalSummary[] = [];
  try {
    const allFiles = getAllMarkdownFiles();
    const journalFiles = allFiles.filter(({ slug }) => slug.startsWith('journal/'));
    const data = await Promise.all(
      journalFiles.map(async ({ slug }) => {
        const d = await getMarkdownData(slug);
        let date: string | null = null;
        if (d?.date instanceof Date) date = d.date.toISOString();
        else if (typeof d?.date === 'string') date = d.date;
        return {
          slug,
          title: (d?.title as string) || slug.split('/').pop() || '',
          date,
          excerpt: ((d?.excerpt as string) || '').slice(0, 140),
        };
      })
    );
    journals = data
      .filter((j) => j.date)
      .sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())
      .slice(0, 3);
  } catch (e) {
    console.error('Top: journal load failed', e);
  }

  // Works — top 6
  let works: WorkSummary[] = [];
  try {
    const feedPath = path.join(process.cwd(), 'public', 'works', 'feed-data.json');
    if (fs.existsSync(feedPath)) {
      const raw = fs.readFileSync(feedPath, 'utf8');
      const feed = JSON.parse(raw) as {
        items: Array<{ title: string; url: string; date: string; sourceName: string; source: string }>;
      };
      works = feed.items.slice(0, 6).map((i) => ({
        title: i.title,
        url: i.url,
        date: i.date,
        sourceName: i.sourceName,
        source: i.source,
      }));
    }
  } catch (e) {
    console.error('Top: works load failed', e);
  }

  // Photos — top 5
  let photos: PhotoSummary[] = [];
  try {
    const galleries = getAllPhotoGalleries() as PhotoGallery[];
    photos = galleries.slice(0, 5).map((g) => ({
      slug: g.slug,
      title: g.title,
      date: g.date ?? null,
      cover: g.images?.[0] ?? null,
    }));
  } catch (e) {
    console.error('Top: photo load failed', e);
  }

  // Podcast — top 3
  let podcasts: PodcastSummary[] = [];
  try {
    const rssUrl = 'https://anchor.fm/s/6877a570/podcast/rss';
    const data = await fetchPodcastFeed(rssUrl);
    podcasts = (data.episodes as PodcastEpisode[]).slice(0, 3).map((ep) => ({
      slug: ep.slug,
      title: ep.title,
      pubDate: ep.pubDate,
      duration: ep.duration || '',
      description: stripTags(ep.description || '').slice(0, 120),
    }));
  } catch (e) {
    console.error('Top: podcast load failed', e);
  }

  return {
    props: {
      journals,
      works,
      photos,
      podcasts,
    },
  };
};
