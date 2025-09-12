import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/layout/Navigation';
import { FaBars, FaTimes, FaTwitter, FaGithub, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { MdEmail } from 'react-icons/md';
import { useSearchModalStore } from '@/store/useSearchModalStore';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const open = useSearchModalStore((s) => s.open);

  // スクロール検出
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // モバイルメニューが開いているときは背景スクロールを無効化
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const openSearch = () => {
    open();
    setIsMenuOpen(false); // 検索を開くときにメニューを閉じる
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 h-16 md:h-20 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg border-b-2 border-primary/20' : 'bg-transparent'
      }`}>
      <div className="container flex items-center justify-between h-full min-w-0">
        <Link href="/" className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 overflow-hidden rounded-full border-2 border-primary/30 hover:border-primary transition-all duration-300 hover:scale-110">
            <Image
              src="https://pbs.twimg.com/profile_images/1964961444673531905/wD3BXCk2_400x400.jpg"
              alt="栗林健太郎"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-base sm:text-lg md:text-xl font-bold font-display text-dark truncate">栗林健太郎</span>
        </Link>

        {/* デスクトップナビゲーション */}
        <div className="hidden md:block flex-shrink-0">
          <Navigation />
        </div>

        {/* モバイルメニューボタン */}
        <button
          className="block md:hidden text-dark p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300 flex-shrink-0"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          type="button"
        >
          {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {/* モバイルナビゲーション */}
        <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          <div className="flex flex-col h-full p-4 pt-6">
            <div className="flex justify-between items-center mb-6">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <div className="relative w-8 h-8 overflow-hidden rounded-full">
                  <Image
                    src="https://pbs.twimg.com/profile_images/1964961444673531905/wD3BXCk2_400x400.jpg"
                    alt="栗林健太郎"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-lg font-bold font-sans text-dark">栗林健太郎</span>
              </Link>
              <button
                className="text-dark p-1.5 rounded-md hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
                aria-label="メニューを閉じる"
                type="button"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <nav className="flex-1">
              <ul className="flex flex-col space-y-4 text-lg">
                <li>
                  <Link href="/" className="block py-3 px-4 text-dark hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300" onClick={() => setIsMenuOpen(false)}>
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="block py-3 px-4 text-dark hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300" onClick={() => setIsMenuOpen(false)}>
                    プロフィール
                  </Link>
                </li>
                <li>
                  <Link href="/works" className="block py-3 px-4 text-dark hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300" onClick={() => setIsMenuOpen(false)}>
                    制作物
                  </Link>
                </li>
                <li>
                  <Link href="/journal" className="block py-3 px-4 text-dark hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300" onClick={() => setIsMenuOpen(false)}>
                    日記
                  </Link>
                </li>
                <li>
                  <button
                    onClick={openSearch}
                    className="flex items-center py-3 px-4 text-dark hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300 w-full text-left"
                    aria-label="検索"
                    type="button"
                  >
                    <FiSearch className="w-5 h-5 mr-2" />
                    <span>検索</span>
                  </button>
                </li>
              </ul>
            </nav>
            <div className="mt-auto pt-6 border-t border-gray-100">
              <div className="flex justify-center space-x-4">
                <a href="https://twitter.com/kentaro" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
                  <FaTwitter size={24} />
                </a>
                <a href="https://github.com/kentaro" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
                  <FaGithub size={24} />
                </a>
                <a href="https://www.youtube.com/@kentarok" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
                  <FaYoutube size={24} />
                </a>
                <a href="https://facebook.com/kentarok" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
                  <FaFacebook size={24} />
                </a>
                <a href="https://www.linkedin.com/in/kentaro-kuribayashi" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
                  <FaLinkedin size={24} />
                </a>
                <a href="mailto:kentarok@gmail.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
                  <MdEmail size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 