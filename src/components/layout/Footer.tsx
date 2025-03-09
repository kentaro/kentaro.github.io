import Link from 'next/link';
import Image from 'next/image';
import { FaTwitter, FaGithub, FaYoutube, FaFacebook } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* ロゴと説明 */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10 overflow-hidden rounded-full bg-white">
                <Image 
                  src="https://pbs.twimg.com/profile_images/1893532407988367361/5EfifO80_400x400.jpg"
                  alt="栗林健太郎"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-bold font-heading">栗林健太郎</span>
            </Link>
            <p className="text-gray-300 mb-4">
              GMOペパボ株式会社取締役CTO / 一般社団法人日本CTO協会理事 / 博士（情報科学）
            </p>
            <div className="flex space-x-4">
              <a href="https://x.com/kentaro" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaTwitter size={24} />
                <span className="sr-only">X (Twitter)</span>
              </a>
              <a href="https://github.com/kentaro" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaGithub size={24} />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="https://youtube.com/@kentarok" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaYoutube size={24} />
                <span className="sr-only">YouTube</span>
              </a>
              <a href="https://facebook.com/kentarok" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaFacebook size={24} />
                <span className="sr-only">Facebook</span>
              </a>
            </div>
          </div>
          
          {/* サイトマップ */}
          <div>
            <h3 className="text-lg font-bold mb-4">サイトマップ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  ホーム
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
                  プロフィール
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                  ブログ
                </Link>
              </li>
              <li>
                <Link href="/journal" className="text-gray-300 hover:text-white transition-colors">
                  日記
                </Link>
              </li>
            </ul>
          </div>
          
          {/* SNSリンク */}
          <div>
            <h3 className="text-lg font-bold mb-4">フォロー</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://x.com/kentaro" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <FaTwitter />
                  <span>X (Twitter)</span>
                </a>
              </li>
              <li>
                <a href="https://github.com/kentaro" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <FaGithub />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a href="https://youtube.com/@kentarok" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <FaYoutube />
                  <span>YouTube</span>
                </a>
              </li>
              <li>
                <a href="https://facebook.com/kentarok" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <FaFacebook />
                  <span>Facebook</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© {currentYear} 栗林健太郎. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 