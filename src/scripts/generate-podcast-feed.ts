import fs from 'node:fs';
import path from 'node:path';
import { Feed } from 'feed';
import { fetchPodcastFeed } from '../lib/podcast';

const SITE_URL = 'https://kentarokuribayashi.com';
const AUTHOR_NAME = '栗林健太郎';

async function generatePodcastFeed() {
  console.log('Generating podcast feed...');

  try {
    // 元のRSSフィードからデータを取得
    const rssUrl = 'https://anchor.fm/s/6877a570/podcast/rss';
    const podcastData = await fetchPodcastFeed(rssUrl);

    // フィードを生成
    const feed = new Feed({
      title: podcastData.title,
      description: podcastData.description,
      id: `${SITE_URL}/podcast`,
      link: `${SITE_URL}/podcast`,
      language: 'ja',
      image: podcastData.imageUrl || `${SITE_URL}/images/profile.jpg`,
      favicon: `${SITE_URL}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${AUTHOR_NAME}`,
      updated: new Date(),
      feedLinks: {
        rss2: `${SITE_URL}/podcast/feed.xml`,
      },
      author: {
        name: AUTHOR_NAME,
        link: SITE_URL,
      },
    });

    // エピソードをフィードに追加
    for (const episode of podcastData.episodes) {
      feed.addItem({
        title: episode.title,
        id: `${SITE_URL}/podcast/${episode.slug}`,
        link: `${SITE_URL}/podcast/${episode.slug}`, // 詳細ページへのリンク
        description: episode.description,
        content: episode.description,
        date: new Date(episode.pubDate),
        enclosure: episode.audioUrl ? {
          url: episode.audioUrl, // 元のRSSの音声URLを維持
          type: episode.audioType || 'audio/mpeg',
          length: episode.audioLength,
        } : undefined,
      });
    }

    // 出力ディレクトリを作成
    const outputDir = path.join(process.cwd(), 'public', 'podcast');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // フィードをファイルに書き込み
    fs.writeFileSync(path.join(outputDir, 'feed.xml'), feed.rss2());

    console.log(`Generated podcast feed with ${podcastData.episodes.length} episodes`);
  } catch (error) {
    console.error('Error generating podcast feed:', error);
    throw error;
  }
}

// 実行
generatePodcastFeed().catch(console.error);
