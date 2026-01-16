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
        <ul className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 xl:space-x-6">
          <li>
            <Link 
              href="/" 
              className={`py-2 px-2 sm:px-3 md:px-4 lg:px-5 font-medium transition-all duration-300 rounded-full text-xs sm:text-sm md:text-base whitespace-nowrap ${
                isActive('/')
                  ? 'bg-primary text-white shadow-md hover:bg-primary-dark hover:text-white' 
                  : 'text-dark hover:text-primary hover:bg-primary/10'
              }`}
            >
              <span className="hidden sm:inline">ホーム</span>
              <span className="sm:hidden">🏠</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/profile" 
              className={`py-2 px-2 sm:px-3 md:px-4 lg:px-5 font-medium transition-all duration-300 rounded-full text-xs sm:text-sm md:text-base whitespace-nowrap ${
                isActive('/profile') 
                  ? 'bg-primary text-white shadow-md hover:bg-primary-dark hover:text-white' 
                  : 'text-dark hover:text-primary hover:bg-primary/10'
              }`}
            >
              <span className="hidden lg:inline">プロフィール</span>
              <span className="lg:hidden hidden sm:inline">プロフ</span>
              <span className="sm:hidden">👤</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/works" 
              className={`py-2 px-2 sm:px-3 md:px-4 lg:px-5 font-medium transition-all duration-300 rounded-full text-xs sm:text-sm md:text-base whitespace-nowrap ${
                isActive('/works') 
                  ? 'bg-primary text-white shadow-md hover:bg-primary-dark hover:text-white' 
                  : 'text-dark hover:text-primary hover:bg-primary/10'
              }`}
            >
              <span className="hidden sm:inline">制作物</span>
              <span className="sm:hidden">🎨</span>
            </Link>
          </li>
          <li>
            <Link
              href="/journal"
              className={`py-2 px-2 sm:px-3 md:px-4 lg:px-5 font-medium transition-all duration-300 rounded-full text-xs sm:text-sm md:text-base whitespace-nowrap ${
                isActive('/journal')
                  ? 'bg-primary text-white shadow-md hover:bg-primary-dark hover:text-white'
                  : 'text-dark hover:text-primary hover:bg-primary/10'
              }`}
            >
              <span className="hidden sm:inline">日記</span>
              <span className="sm:hidden">📖</span>
            </Link>
          </li>
          <li>
            <Link
              href="/photo"
              className={`py-2 px-2 sm:px-3 md:px-4 lg:px-5 font-medium transition-all duration-300 rounded-full text-xs sm:text-sm md:text-base whitespace-nowrap ${
                isActive('/photo')
                  ? 'bg-primary text-white shadow-md hover:bg-primary-dark hover:text-white'
                  : 'text-dark hover:text-primary hover:bg-primary/10'
              }`}
            >
              <span className="hidden sm:inline">写真</span>
              <span className="sm:hidden">📷</span>
            </Link>
          </li>
          <li>
            <Link
              href="/podcast"
              className={`py-2 px-2 sm:px-3 md:px-4 lg:px-5 font-medium transition-all duration-300 rounded-full text-xs sm:text-sm md:text-base whitespace-nowrap ${
                isActive('/podcast')
                  ? 'bg-primary text-white shadow-md hover:bg-primary-dark hover:text-white'
                  : 'text-dark hover:text-primary hover:bg-primary/10'
              }`}
            >
              <span className="hidden sm:inline">ポッドキャスト</span>
              <span className="sm:hidden">🎙️</span>
            </Link>
          </li>
          <li>
            <button
              onClick={open}
              className="p-2 sm:p-2.5 md:p-3 text-dark hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300 focus:outline-none hover:scale-110 flex-shrink-0"
              aria-label="検索"
              type="button"
            >
              <FiSearch className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
} 