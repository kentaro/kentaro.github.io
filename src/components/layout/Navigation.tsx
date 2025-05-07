import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiSearch } from 'react-icons/fi';
import { useSearchModalStore } from '@/store/useSearchModalStore';

export default function Navigation() {
  const router = useRouter();
  const open = useSearchModalStore((s) => s.open);
  
  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };
  
  return (
    <>
      <nav className="main-nav">
        <ul className="flex items-center space-x-10">
          <li>
            <Link 
              href="/" 
              className={`py-2 font-medium transition-colors duration-200 ${
                isActive('/') && !isActive('/blog') && !isActive('/journal') && !isActive('/profile') && !isActive('/works')
                  ? 'text-primary font-bold' 
                  : 'text-dark hover:text-primary'
              }`}
            >
              ホーム
            </Link>
          </li>
          <li>
            <Link 
              href="/profile" 
              className={`py-2 font-medium transition-colors duration-200 ${
                isActive('/profile') 
                  ? 'text-primary font-bold' 
                  : 'text-dark hover:text-primary'
              }`}
            >
              プロフィール
            </Link>
          </li>
          <li>
            <Link 
              href="/works" 
              className={`py-2 font-medium transition-colors duration-200 ${
                isActive('/works') 
                  ? 'text-primary font-bold' 
                  : 'text-dark hover:text-primary'
              }`}
            >
              制作物
            </Link>
          </li>
          <li>
            <Link 
              href="/blog" 
              className={`py-2 font-medium transition-colors duration-200 ${
                isActive('/blog') 
                  ? 'text-primary font-bold' 
                  : 'text-dark hover:text-primary'
              }`}
            >
              ブログ
            </Link>
          </li>
          <li>
            <Link 
              href="/journal" 
              className={`py-2 font-medium transition-colors duration-200 ${
                isActive('/journal') 
                  ? 'text-primary font-bold' 
                  : 'text-dark hover:text-primary'
              }`}
            >
              日記
            </Link>
          </li>
          <li>
            <button
              onClick={open}
              className="p-2 text-dark hover:text-primary transition-colors duration-200 focus:outline-none"
              aria-label="検索"
              type="button"
            >
              <FiSearch className="w-5 h-5" />
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
} 