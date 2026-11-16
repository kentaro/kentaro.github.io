import axios from 'axios';
import xml2js from 'xml2js';
import savedPodcast from '../../public/data/podcast.json';

/**
 * タイトルからスラッグを生成（エピソード番号のみ）
 */
function generateSlug(title: string, pubDate: string): string {
  // タイトルから #数字 パターンを抽出
  const match = title.match(/#(\d+)/);
  if (match) {
    return match[1]; // 数字のみを返す（例：#35 → 35）
  }

  // フォールバック：エピソード番号が見つからない場合は日付ベースのスラッグを生成
  const date = new Date(pubDate);
  const timestamp = date.getTime();
  return `episode-${timestamp}`;
}

export interface PodcastEpisode {
  title: string;
  description: string;
  pubDate: string;
  audioUrl: string;
  audioLength?: number;
  audioType?: string;
  duration?: string;
  link?: string;
  guid?: string;
  slug: string;
}

export interface PodcastInfo {
  title: string;
  description: string;
  imageUrl?: string;
  episodes: PodcastEpisode[];
}

// The creator site publishes the episodes without the professional bio and
// contact footer supplied by the external feed.
function forCreatorSite(podcast: PodcastInfo): PodcastInfo {
  return {
    ...podcast,
    description: '栗林健太郎が、日々の思考や暮らし、本、アートなどについて話すポッドキャストです。',
    episodes: podcast.episodes.map(episode => ({
      ...episode,
      description: episode.description
        .split(/(?:<p[^>]*>\s*)?【栗林健太郎とは】/)[0]
        .replace(/(?:\s*<p>(?:\s|<br\s*\/?\s*>|----)*<\/p>)+\s*$/g, '')
        .trim(),
    })),
  };
}

/**
 * ポッドキャストのRSSフィードを取得して解析
 */
export async function fetchPodcastFeed(rssUrl: string): Promise<PodcastInfo> {
  // The build script refreshes this snapshot before page generation.
  if (rssUrl === 'https://anchor.fm/s/6877a570/podcast/rss' && savedPodcast.episodes.length) {
    return forCreatorSite(savedPodcast as PodcastInfo);
  }
  try {
    // RSSフィードを取得
    const response = await axios.get(rssUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'curl/7.64.1'
      }
    });
    const xmlData = response.data;

    // XMLをパース
    const parser = new xml2js.Parser({
      explicitArray: false,
      trim: true
    });
    const result = await parser.parseStringPromise(xmlData);

    const channel = result.rss.channel;

    // エピソードの配列を取得（単一の場合も配列に変換）
    const items = Array.isArray(channel.item) ? channel.item : [channel.item];

    const episodes: PodcastEpisode[] = items.map((item: any) => {
      const title = item.title || '';
      const pubDate = item.pubDate || '';
      const enclosure = item.enclosure?.$;
      return {
        title,
        description: item.description || item['itunes:summary'] || '',
        pubDate,
        audioUrl: enclosure ? enclosure.url : '',
        audioLength: enclosure?.length ? parseInt(enclosure.length, 10) : undefined,
        audioType: enclosure?.type || 'audio/mpeg',
        duration: item['itunes:duration'] || '',
        link: item.link || '',
        guid: typeof item.guid === 'string' ? item.guid : item.guid?._ || '',
        slug: generateSlug(title, pubDate),
      };
    });

    return forCreatorSite({
      title: channel.title || '',
      description: channel.description || '',
      imageUrl: channel['itunes:image']?.$ ? channel['itunes:image'].$.href : channel.image?.url || '',
      episodes,
    });
  } catch (error) {
    console.error('Error fetching podcast feed:', error);
    throw error;
  }
}
