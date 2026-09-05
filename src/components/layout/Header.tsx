import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiSearch } from 'react-icons/fi';
import { useSearchModalStore } from '@/store/useSearchModalStore';
import type { NavKey } from './Layout';

const NAV: { key: NavKey; href: string; label: string }[] = [
  { key: 'journal', href: '/journal', label: '日記' },
  { key: 'blog', href: '/blog', label: 'ブログ' },
  { key: 'works', href: '/works', label: '制作物' },
  { key: 'photo', href: '/photo', label: '写真' },
  { key: 'podcast', href: '/podcast', label: '音声' },
  { key: 'profile', href: '/profile', label: 'プロフィール' },
];

interface Props {
  activeNav?: NavKey;
}

export default function Header({ activeNav = 'home' }: Props) {
  const router = useRouter();
  const openSearch = useSearchModalStore((s) => s.open);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(true);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = menu.current;
    const background = Array.from(document.querySelectorAll<HTMLElement>('.page > header, .page > main, .page > footer, .skip-link'));
    const previousInert = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    panel?.querySelector<HTMLButtonElement>('button')?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
      }
      if (event.key !== 'Tab' || !panel) return;
      const controls = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach((element, index) => { element.inert = previousInert[index]; });
      document.removeEventListener('keydown', handleKeyDown);
      if (restoreFocus.current) menuButton.current?.focus();
    };
  }, [menuOpen]);

  useEffect(() => {
    const close = () => {
      restoreFocus.current = false;
      setMenuOpen(false);
    };
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  return (
    <Fragment>
      <header className="bar">
        <div className="wrap bar-inner">
          <Link href="/" className="mast" aria-label="栗林健太郎 ホーム" aria-current={activeNav === 'home' ? 'page' : undefined}>
            <span className="title">栗林健太郎</span>
            <span className="sub">Kentaro Kuribayashi</span>
          </Link>
          <nav className="top" aria-label="メインナビゲーション">
            {NAV.map((item) => (
              <Link key={item.key} href={item.href} className={activeNav === item.key ? 'active' : ''} aria-current={activeNav === item.key ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
            <button type="button" onClick={openSearch} aria-label="サイト内を検索" className="bar-search">
              <FiSearch size={18} aria-hidden="true" />
            </button>
          </nav>
          <button ref={menuButton} type="button" className="bar-menu-btn" onClick={() => { restoreFocus.current = true; setMenuOpen(true); }} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-haspopup="dialog">
            メニュー
          </button>
        </div>
      </header>
      {menuOpen && (
        <div ref={menu} id="mobile-navigation" className="mobile-nav on" role="dialog" aria-modal="true" aria-label="サイトメニュー">
          <button type="button" className="close" onClick={() => setMenuOpen(false)}>閉じる ×</button>
          <nav aria-label="メインナビゲーション">
            <ul>
              <li><Link href="/" onClick={() => setMenuOpen(false)} aria-current={activeNav === 'home' ? 'page' : undefined}>ホーム</Link></li>
              {NAV.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} onClick={() => setMenuOpen(false)} className={activeNav === item.key ? 'active' : ''} aria-current={activeNav === item.key ? 'page' : undefined}>{item.label}</Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={() => { restoreFocus.current = false; setMenuOpen(false); openSearch(); }} className="mobile-search-btn">サイト内を検索</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </Fragment>
  );
}
