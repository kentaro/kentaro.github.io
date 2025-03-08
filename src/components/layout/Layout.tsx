import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="site-wrapper">
      <Header />
      <main className="site-main">
        <div className="container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
} 