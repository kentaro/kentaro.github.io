import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Noto_Sans_JP, Montserrat, Source_Code_Pro } from 'next/font/google';
import { GlobalPGliteProvider } from '@/lib/PGliteContext';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchModalStore } from '@/store/useSearchModalStore';

const SearchModal = dynamic(() => import('@/components/search/SearchModal'), { ssr: false });
const ChatBot = dynamic(() => import('@/components/chat/ChatBot').then(mod => mod.ChatBot), { ssr: false });

// フォントの設定
const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
  preload: true,
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  preload: true,
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-source-code-pro',
  preload: true,
});

function SearchModalPortal() {
  const isOpen = useSearchModalStore((s: { isOpen: boolean }) => s.isOpen);
  const close = useSearchModalStore((s: { close: () => void }) => s.close);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(<SearchModal isOpen={isOpen} onClose={close} />, document.body);
}

export default function App({ Component, pageProps }: AppProps) {
  // GlobalPGliteProviderでラップして、PGliteの状態を管理
  return (
    <>
      <GlobalPGliteProvider>
        <div className={`${notoSansJp.variable} ${montserrat.variable} ${sourceCodePro.variable} font-sans`}>
          <Component {...pageProps} />
        </div>
        <SearchModalPortal />
      </GlobalPGliteProvider>
      <ChatBot />
    </>
  );
} 