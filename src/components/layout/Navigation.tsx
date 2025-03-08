import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();
  
  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };
  
  return (
    <nav className="main-nav">
      <ul>
        <li className={isActive('/') && !isActive('/blog') && !isActive('/journal') ? 'active' : ''}>
          <Link href="/">ホーム</Link>
        </li>
        <li className={isActive('/blog') ? 'active' : ''}>
          <Link href="/blog">ブログ</Link>
        </li>
        <li className={isActive('/journal') ? 'active' : ''}>
          <Link href="/journal">日記</Link>
        </li>
      </ul>
    </nav>
  );
} 