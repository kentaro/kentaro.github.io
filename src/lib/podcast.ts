import axios from 'axios';
import xml2js from 'xml2js';

export interface PodcastEpisode {
  title: string;
  description: string;
  pubDate: string;
  audioUrl: string;
  duration?: string;
  link?: string;
  guid?: string;
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
    const response = await axios.get(rssUrl);
    const xmlData = response.data;

    // XMLをパース
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);

    const channel = result.rss.channel;

    // エピソードの配列を取得（単一の場合も配列に変換）
    const items = Array.isArray(channel.item) ? channel.item : [channel.item];

    const episodes: PodcastEpisode[] = items.map((item: any) => ({
      title: item.title || '',
      description: item.description || item['itunes:summary'] || '',
      pubDate: item.pubDate || '',
      audioUrl: item.enclosure?.$ ? item.enclosure.$.url : '',
      duration: item['itunes:duration'] || '',
      link: item.link || '',
      guid: typeof item.guid === 'string' ? item.guid : item.guid?._ || '',
    }));

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
