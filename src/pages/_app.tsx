import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { GlobalPGliteProvider } from '@/lib/PGliteContext';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchModalStore } from '@/store/useSearchModalStore';

const SearchModal = dynamic(() => import('@/components/search/SearchModal'), { ssr: false });

function SearchModalPortal() {
  const isOpen = useSearchModalStore((s: { isOpen: boolean }) => s.isOpen);
  const close = useSearchModalStore((s: { close: () => void }) => s.close);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(<SearchModal isOpen={isOpen} onClose={close} />, document.body);
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalPGliteProvider>
        <Component {...pageProps} />
        <SearchModalPortal />
      </GlobalPGliteProvider>
    </>
  );
}
