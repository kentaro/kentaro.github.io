import Link from 'next/link';
import Image from 'next/image';
import { FaTwitter, FaGithub, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/" className="flex items-center gap-2">
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
            <p className="hidden md:block text-gray-300 ml-4">
              GMOペパボ株式会社取締役CTO / 一般社団法人日本CTO協会理事 / 博士（情報科学）
            </p>
          </div>
          
          <div className="flex space-x-4">
            <a href="https://x.com/kentaro" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
              <FaTwitter size={20} />
              <span className="sr-only">X (Twitter)</span>
            </a>
            <a href="https://github.com/kentaro" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
              <FaGithub size={20} />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="https://youtube.com/@kentarok" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
              <FaYoutube size={20} />
              <span className="sr-only">YouTube</span>
            </a>
            <a href="https://facebook.com/kentarok" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
              <FaFacebook size={20} />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="https://www.linkedin.com/in/kentaro-kuribayashi/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
              <FaLinkedin size={20} />
              <span className="sr-only">LinkedIn</span>
            </a>
            <a href="mailto:kentarok@gmail.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
              <MdEmail size={20} />
              <span className="sr-only">Email</span>
            </a>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-800 pt-6">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
              ホーム
            </Link>
            <Link href="/profile" className="text-gray-300 hover:text-white transition-colors text-sm">
              プロフィール
            </Link>
            <Link href="/blog" className="text-gray-300 hover:text-white transition-colors text-sm">
              ブログ
            </Link>
            <Link href="/journal" className="text-gray-300 hover:text-white transition-colors text-sm">
              日記
            </Link>
          </div>
          
          <p className="text-gray-400 text-sm">
            © {currentYear} 栗林健太郎. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 