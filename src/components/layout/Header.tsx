import Link from 'next/link';
import Navigation from './Navigation';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="site-title">
          Kentaro Kuribayashi
        </Link>
        <Navigation />
      </div>
    </header>
  );
} 