import Link from 'next/link';
import { NOTE_URL } from '@/lib/creator-content';
import { SITE_NAME } from '@/lib/site';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="cph">
      <div className="wrap">
        <div className="row">
          <div>
            <p className="big">{SITE_NAME}</p>
            <p className="set footer-description">文章、音楽、写真と日々の記録。</p>
          </div>
          <nav aria-label="フッターナビゲーション">
            <p className="footer-label">このサイト</p>
            <div className="set">
              <p><Link href="/journal">日記</Link></p>
              <p><a href={NOTE_URL}>note ↗</a></p>
              <p><Link href="/works">制作物</Link></p>
              <p><Link href="/music">音楽</Link></p>
              <p><Link href="/photo">写真</Link></p>
              <p><Link href="/podcast">音声</Link></p>
            </div>
          </nav>
          <div>
            <p className="footer-label">つながる</p>
            <div className="set">
              <p><a href="https://x.com/kentareaux">X / Twitter ↗</a></p>
              <p><a href="https://www.youtube.com/@kentarok">YouTube ↗</a></p>
              <p><a href="https://soundcloud.com/kentarok">SoundCloud ↗</a></p>
              <p><a href="mailto:kentarok@gmail.com">メール</a></p>
            </div>
          </div>
        </div>
        <div className="meta">
          <span>© {year} {SITE_NAME}</span>
          <Link href="/">ホームへ戻る ↑</Link>
        </div>
      </div>
    </footer>
  );
}
