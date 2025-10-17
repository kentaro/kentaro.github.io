import fs from 'node:fs';
import path from 'node:path';
import { fetchPodcastFeed } from '../lib/podcast';

const SITE_URL = 'https://kentarokuribayashi.com';

function generatePlayerHTML(episode: any, podcastTitle: string, podcastImage: string): string {
  // HTMLタグを除去して概要を抽出（最初の160文字）
  const description = episode.description
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
    .slice(0, 160);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${episode.title} - ${podcastTitle}</title>

  <!-- OG tags for sharing -->
  <meta property="og:title" content="${episode.title} - ${podcastTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${SITE_URL}/assets/podcast-banner.png">
  <meta property="og:type" content="music.song">
  <meta property="og:audio" content="${episode.audioUrl}">
  <meta property="og:audio:type" content="${episode.audioType || 'audio/mpeg'}">

  <!-- Twitter Card tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${episode.title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${SITE_URL}/assets/podcast-banner.png">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background: #f9fafb;
      min-height: 100vh;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .player-card {
      width: 100%;
      max-width: 600px;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      margin: 16px;
    }

    .player-content {
      display: flex;
      gap: 16px;
      padding: 20px;
    }

    .image-container {
      position: relative;
      width: 140px;
      height: 140px;
      flex-shrink: 0;
      cursor: pointer;
    }

    .podcast-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 12px;
    }

    .play-button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 56px;
      height: 56px;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .play-button:hover {
      background: rgba(0, 0, 0, 0.35);
      transform: translate(-50%, -50%) scale(1.1);
    }

    .play-button svg {
      width: 24px;
      height: 24px;
      color: white;
    }

    .play-button.playing svg.play-icon {
      display: none;
    }

    .play-button svg.pause-icon {
      display: none;
    }

    .play-button.playing svg.pause-icon {
      display: block;
    }

    .episode-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .episode-title {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.4;
      margin-bottom: 8px;
      color: #111827;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .episode-title a {
      color: #111827;
      text-decoration: none;
      transition: color 0.2s;
    }

    .episode-title a:hover {
      color: #3b82f6;
    }

    .podcast-title {
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .podcast-title a {
      color: #6b7280;
      text-decoration: none;
      transition: color 0.2s;
    }

    .podcast-title a:hover {
      color: #3b82f6;
    }

    .episode-description {
      font-size: 13px;
      line-height: 1.5;
      color: #9ca3af;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    audio {
      display: none;
    }

    /* 埋め込み用のコンパクト表示 */
    @media (max-width: 600px) {
      .player-card {
        margin: 0;
        border-radius: 0;
      }

      .player-content {
        padding: 16px;
        gap: 12px;
      }

      .image-container {
        width: 100px;
        height: 100px;
      }

      .play-button {
        width: 48px;
        height: 48px;
      }

      .play-button svg {
        width: 20px;
        height: 20px;
      }

      .episode-title {
        font-size: 16px;
      }

      .podcast-title {
        font-size: 13px;
        margin-bottom: 6px;
      }

      .episode-description {
        font-size: 12px;
      }
    }
  </style>
</head>
<body>
  <div class="player-card">
    <div class="player-content">
      <div class="image-container" onclick="togglePlay()">
        <img
          src="${podcastImage}"
          alt="${podcastTitle}"
          class="podcast-image"
        />
        <div class="play-button" id="playButton">
          <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <svg class="pause-icon" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </div>
      </div>
      <div class="episode-info">
        <h1 class="episode-title"><a href="${SITE_URL}/podcast/${episode.slug}">${episode.title}</a></h1>
        <p class="podcast-title"><a href="${SITE_URL}/podcast">${podcastTitle}</a></p>
        <p class="episode-description">${description}</p>
      </div>
    </div>
    <audio id="audio" preload="metadata">
      <source src="${episode.audioUrl}" type="${episode.audioType || 'audio/mpeg'}">
    </audio>
  </div>

  <script>
    const audio = document.getElementById('audio');
    const playButton = document.getElementById('playButton');

    function togglePlay() {
      if (audio.paused) {
        audio.play();
        playButton.classList.add('playing');
      } else {
        audio.pause();
        playButton.classList.remove('playing');
      }
    }

    // 音声が終了したらボタンを元に戻す
    audio.addEventListener('ended', () => {
      playButton.classList.remove('playing');
    });

    // 自動再生
    audio.play().catch(() => {
      // 自動再生がブロックされた場合は何もしない
    });
  </script>
</body>
</html>`;
}

async function generatePodcastPlayers() {
  console.log('Generating podcast player pages...');

  try {
    const rssUrl = 'https://anchor.fm/s/6877a570/podcast/rss';
    const podcastData = await fetchPodcastFeed(rssUrl);

    // 出力ディレクトリを作成
    const outputDir = path.join(process.cwd(), 'public', 'podcast', 'player');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 各エピソードのプレイヤーページを生成
    for (const episode of podcastData.episodes) {
      const html = generatePlayerHTML(episode, podcastData.title, podcastData.imageUrl || '');
      const filename = `${episode.slug}.html`;
      fs.writeFileSync(path.join(outputDir, filename), html);
    }

    console.log(`Generated ${podcastData.episodes.length} podcast player pages`);
  } catch (error) {
    console.error('Error generating podcast player pages:', error);
    throw error;
  }
}

// 実行
generatePodcastPlayers().catch(console.error);
