import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Noto_Sans_JP, Montserrat, Source_Code_Pro } from 'next/font/google';
import { GlobalPGliteProvider } from '@/lib/PGliteContext';
import dynamic from 'next/dynamic';

// 検索モーダルを動的にインポート（サーバーサイドレンダリング無効）
const SearchModalWrapper = dynamic(
  () => import('@/components/search/SearchModalWrapper'),
  { ssr: false }
);

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

export default function App({ Component, pageProps }: AppProps) {
  // GlobalPGliteProviderでラップして、PGliteの状態を管理
  return (
    <GlobalPGliteProvider>
      <div className={`${notoSansJp.variable} ${montserrat.variable} ${sourceCodePro.variable} font-sans`}>
        <Component {...pageProps} />
        {/* 検索モーダルをアプリケーション全体で利用可能にする */}
        <SearchModalWrapper />
      </div>
    </GlobalPGliteProvider>
  );
} 