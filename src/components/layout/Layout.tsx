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
      <Header activeNav={activeNav} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
