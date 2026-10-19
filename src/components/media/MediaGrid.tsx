import { useState } from 'react';
import type { MediaItem } from '@/lib/media';

function playerUrl(item: MediaItem): string {
  if (item.source === 'music') {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(item.url)}&auto_play=true&hide_related=true&show_comments=false&show_user=true&visual=true`;
  }
  const url = new URL(item.url);
  const id = url.searchParams.get('v') || url.pathname.split('/').pop();
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
}

export default function MediaGrid({ items }: { items: MediaItem[] }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className="music-grid">
      {items.map((item) => {
        const platform = item.source === 'video' ? 'YouTube' : 'SoundCloud';
        const playing = active === item.url;
        return (
          <article className="music-card" key={item.url}>
            <div className={`music-art music-art-${item.source}`}>
              {playing ? (
                <iframe
                  src={playerUrl(item)}
                  title={`${item.title} — ${platform}プレイヤー`}
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <button type="button" className="music-load" onClick={() => setActive(item.url)} aria-label={`${item.title}を再生`}>
                  {item.image ? <img src={item.image} alt="" loading="lazy" /> : <span className="music-no-art" aria-hidden="true">♪</span>}
                  <span className="music-play" aria-hidden="true">▶</span>
                  <span className="music-load-label">再生する</span>
                </button>
              )}
            </div>
            <div className="music-meta">
              <span>{platform}</span>
              {item.date && <time dateTime={item.date}>{new Date(item.date).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '.')}</time>}
            </div>
            <h3><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}<span aria-hidden="true">↗</span></a></h3>
            {item.description && <p className="music-description">{item.description}</p>}
            {playing && <button className="music-close" type="button" onClick={() => setActive(null)}>プレイヤーを閉じる ×</button>}
          </article>
        );
      })}
    </div>
  );
}
