import axios from 'axios';
import xml2js from 'xml2js';

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

/**
 * ポッドキャストのRSSフィードを取得して解析
 */
export async function fetchPodcastFeed(rssUrl: string): Promise<PodcastInfo> {
  try {
    // RSSフィードを取得
    const response = await axios.get(rssUrl, {
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

    return {
      title: channel.title || '',
      description: channel.description || '',
      imageUrl: channel['itunes:image']?.$ ? channel['itunes:image'].$.href : channel.image?.url || '',
      episodes,
    };
  } catch (error) {
    console.error('Error fetching podcast feed:', error);
    throw error;
  }
}
