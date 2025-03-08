import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="site-title">
          栗林健太郎
        </Link>
        <Navigation />
      </div>
    </header>
  );
} 