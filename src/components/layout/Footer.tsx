import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="cph">
      <div className="wrap">
        <div className="row">
          <div>
            <p className="big">栗林健太郎</p>
            <p className="set footer-description">日記、ブログ、制作物などを掲載しています。</p>
          </div>
          <nav aria-label="フッターナビゲーション">
            <p className="footer-label">このサイト</p>
            <div className="set">
              <p><Link href="/journal">日記</Link></p>
              <p><Link href="/blog">ブログ</Link></p>
              <p><Link href="/works">制作物</Link></p>
              <p><Link href="/photo">写真</Link></p>
              <p><Link href="/podcast">音声</Link></p>
              <p><Link href="/profile">プロフィール</Link></p>
            </div>
          </nav>
          <div>
            <p className="footer-label">つながる</p>
            <div className="set">
              <p><a href="https://x.com/kentaro">X / Twitter ↗</a></p>
              <p><a href="https://github.com/kentaro">GitHub ↗</a></p>
              <p><a href="https://www.linkedin.com/in/kentaro-kuribayashi">LinkedIn ↗</a></p>
              <p><a href="https://facebook.com/kentarok">Facebook ↗</a></p>
              <p><a href="https://discord.gg/SXyKFCyMd5">Discord ↗</a></p>
              <p><a href="mailto:kentarok@gmail.com">メール</a></p>
            </div>
          </div>
        </div>
        <div className="meta">
          <span>© {year} Kentaro Kuribayashi</span>
          <Link href="/">ホームへ戻る ↑</Link>
        </div>
      </div>
    </footer>
  );
}
