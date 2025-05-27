import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* プロフィール情報 */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-full border-2 border-primary shadow-lg hover:scale-110 transition-transform duration-300">
              <Image 
                src="https://pbs.twimg.com/profile_images/1893532407988367361/5EfifO80_400x400.jpg"
                alt="栗林健太郎"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-white font-bold text-base md:text-lg">栗林健太郎</p>
              <p className="text-sm text-gray-300 mt-1">GMOペパボ株式会社取締役CTO / 博士（情報科学）</p>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm md:text-base mt-2 md:mt-0">
            © {currentYear} <span className="font-medium">栗林健太郎</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 