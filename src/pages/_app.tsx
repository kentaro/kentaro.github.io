import '@/styles/globals.css';
import '@/styles/archive.css';
import '@/styles/editorial.css';
import '@/styles/music.css';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';

const CommandPalette = dynamic(() => import('@/components/palette/CommandPalette'), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
        <Component {...pageProps} />
        <CommandPalette />
    </>
  );
}
