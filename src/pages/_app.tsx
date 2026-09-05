import '@/styles/globals.css';
import '@/styles/archive.css';
import '@/styles/editorial.css';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { registerWebMcpTools } from '@/lib/webmcp';

const CommandPalette = dynamic(() => import('@/components/palette/CommandPalette'), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    registerWebMcpTools();
  }, []);
  return (
    <>
        <Component {...pageProps} />
        <CommandPalette />
    </>
  );
}
