import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Noto_Sans_JP, Montserrat, Source_Code_Pro } from 'next/font/google';
import { useEffect, useState } from 'react';
import { initializeSearchDB, loadSearchData } from '@/lib/search';
import { PGliteProvider } from '@electric-sql/pglite-react';
import type { PGlite } from '@electric-sql/pglite';

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
  const [pglite, setPglite] = useState<PGlite | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // PGliteの初期化と検索データのロード
  useEffect(() => {
    // ブラウザ環境でのみ実行
    if (typeof window === 'undefined') return;
    
    const initSearch = async () => {
      try {
        // 既に初期化済みの場合は何もしない
        if (pglite) return;
        
        setIsInitializing(true);
        console.log('Initializing search database...');
        
        const db = await initializeSearchDB();
        if (db) {
          setPglite(db);
          await loadSearchData();
          console.log('Search database initialized successfully');
        } else {
          console.error('Failed to initialize search database');
        }
      } catch (error) {
        console.error('Error initializing search:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    // 初期化を開始するが、ユーザーの操作を待たずにアプリを表示
    initSearch();
  }, [pglite]);
  
  // アプリケーションのレンダリング
  const appContent = (
    <div className={`${notoSansJp.variable} ${montserrat.variable} ${sourceCodePro.variable} font-sans`}>
      <Component {...pageProps} />
    </div>
  );
  
  // PGliteが初期化されている場合はProviderでラップ
  // 初期化されていない場合はそのまま表示
  return pglite ? (
    <PGliteProvider db={pglite}>
      {appContent}
    </PGliteProvider>
  ) : (
    appContent
  );
} 