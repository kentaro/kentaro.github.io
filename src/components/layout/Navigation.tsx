import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiSearch } from 'react-icons/fi';
import { useSearchModalStore } from '@/store/useSearchModalStore';

export default function Navigation() {
  const router = useRouter();
  const open = useSearchModalStore((s) => s.open);
  
  const isActive = (path: string) => {
    // ホームページの特別な処理
    if (path === '/') {
      return router.pathname === '/';
    }
    
    // 動的ルートの場合、asPathを使用
    const currentPath = router.asPath || router.pathname;
    
    // その他のページ
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };
  
  return (
    <>
      <nav className="main-nav">
        <ul className="flex items-center space-x-4 lg:space-x-6">
          <li>
            <Link 
              href="/" 
              className={`py-2.5 px-5 font-medium transition-all duration-300 rounded-full ${
                isActive('/')
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-dark hover:text-primary hover:bg-primary/10'
              }`}
            >
              ホーム
            </Link>
          </li>
          <li>
            <Link 
              href="/profile" 
              className={`py-2.5 px-5 font-medium transition-all duration-300 rounded-full ${
                isActive('/profile') 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-dark hover:text-primary hover:bg-primary/10'
              }`}
            >
              プロフィール
            </Link>
          </li>
          <li>
            <Link 
              href="/works" 
              className={`py-2.5 px-5 font-medium transition-all duration-300 rounded-full ${
                isActive('/works') 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-dark hover:text-primary hover:bg-primary/10'
              }`}
            >
              制作物
            </Link>
          </li>
          <li>
            <Link 
              href="/blog" 
              className={`py-2.5 px-5 font-medium transition-all duration-300 rounded-full ${
                isActive('/blog') 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-dark hover:text-primary hover:bg-primary/10'
              }`}
            >
              ブログ
            </Link>
          </li>
          <li>
            <Link 
              href="/journal" 
              className={`py-2.5 px-5 font-medium transition-all duration-300 rounded-full ${
                isActive('/journal') 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-dark hover:text-primary hover:bg-primary/10'
              }`}
            >
              日記
            </Link>
          </li>
          <li>
            <button
              onClick={open}
              className="p-3 text-dark hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300 focus:outline-none hover:scale-110"
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