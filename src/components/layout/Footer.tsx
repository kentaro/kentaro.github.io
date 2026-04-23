import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="cph">
      <div className="wrap">
        <div className="row">
          <div>
            <h5>Colophon</h5>
            <p className="big">栗林健太郎</p>
            <p
              className="set"
              style={{ marginTop: '20px', color: 'color-mix(in srgb, var(--paper) 76%, transparent)' }}
            >
              概念と構造を制作する。
              <br />
              GMOペパボ株式会社 取締役CTO。
              <br />
              博士（情報科学）。
            </p>
          </div>

          <div>
            <h5>Sections</h5>
            <div className="set">
              <p><Link href="/">§00 ホーム</Link></p>
              <p><Link href="/profile">§01 プロフィール</Link></p>
              <p><Link href="/works">§02 制作物</Link></p>
              <p><Link href="/journal">§03 日記</Link></p>
              <p><Link href="/photo">§04 写真</Link></p>
              <p><Link href="/podcast">§05 ポッドキャスト</Link></p>
            </div>
          </div>

          <div>
            <h5>Channels</h5>
            <div className="set">
              <p><a href="https://x.com/kentaro" target="_blank" rel="noopener noreferrer">X / Twitter</a></p>
              <p><a href="https://github.com/kentaro" target="_blank" rel="noopener noreferrer">GitHub</a></p>
              <p><a href="https://www.linkedin.com/in/kentaro-kuribayashi" target="_blank" rel="noopener noreferrer">LinkedIn</a></p>
              <p><a href="https://facebook.com/kentarok" target="_blank" rel="noopener noreferrer">Facebook</a></p>
              <p><a href="https://discord.gg/SXyKFCyMd5" target="_blank" rel="noopener noreferrer">Discord</a></p>
              <p><a href="mailto:kentarok@gmail.com">Email</a></p>
            </div>
          </div>
        </div>

        <div className="meta">
          <span>© {year} Kentaro Kuribayashi</span>
          <span>Set in Zen Old Mincho &amp; Fraunces</span>
          <span>Printed on the web</span>
        </div>
      </div>
    </footer>
  );
}
