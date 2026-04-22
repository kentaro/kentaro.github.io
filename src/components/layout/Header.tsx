import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiSearch } from 'react-icons/fi';
import { useSearchModalStore } from '@/store/useSearchModalStore';
import type { NavKey } from './Layout';

const NAV: { key: NavKey; href: string; idx: string; label: string }[] = [
  { key: 'profile', href: '/profile', idx: '01', label: 'プロフィール' },
  { key: 'works', href: '/works', idx: '02', label: '制作物' },
  { key: 'journal', href: '/journal', idx: '03', label: '日記' },
  { key: 'photo', href: '/photo', idx: '04', label: '写真' },
  { key: 'podcast', href: '/podcast', idx: '05', label: 'ポッドキャスト' },
];

interface Props {
  activeNav?: NavKey;
}

export default function Header({ activeNav = 'home' }: Props) {
  const router = useRouter();
  const openSearch = useSearchModalStore((s) => s.open);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  return (
    <Fragment>
    <header className="bar">
      <div className="wrap bar-inner">
        <Link href="/" className="mast" aria-label="トップへ">
          <span className="title">栗林健太郎</span>
          <span className="sub">— a monograph</span>
        </Link>

        <nav className="top" aria-label="グローバルナビゲーション">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={activeNav === item.key ? 'active' : ''}
            >
              <span className="idx">{item.idx}</span>
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={openSearch}
            aria-label="検索"
            className="bar-search"
          >
            <FiSearch size={16} />
          </button>
        </nav>

        <button
          type="button"
          className="bar-menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="メニューを開く"
        >
          MENU
        </button>
      </div>
    </header>

      <div className={`mobile-nav${menuOpen ? ' on' : ''}`} aria-hidden={!menuOpen}>
        <button
          type="button"
          className="close"
          onClick={() => setMenuOpen(false)}
          aria-label="閉じる"
        >
          CLOSE ×
        </button>
        <ul>
          <li>
            <Link href="/">
              <span className="idx">00</span>ホーム
            </Link>
          </li>
          {NAV.map((item) => (
            <li key={item.key}>
              <Link href={item.href}>
                <span className="idx">{item.idx}</span>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openSearch();
              }}
              className="mobile-search-btn"
            >
              <span className="idx">06</span>検索
            </button>
          </li>
        </ul>
      </div>
    </Fragment>
  );
}
