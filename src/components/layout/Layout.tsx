import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

export type NavKey = 'home' | 'profile' | 'works' | 'journal' | 'photo' | 'podcast' | 'blog';

interface LayoutProps {
  children: ReactNode;
  activeNav?: NavKey;
}

export default function Layout({ children, activeNav = 'home' }: LayoutProps) {
  return (
    <div className="page">
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header activeNav={activeNav} />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer />
    </div>
  );
}
