import type { GetStaticProps } from 'next';
import React, { useState } from 'react';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import PageHeader from '@/components/common/PageHeader';
import { FaApple, FaAmazon, FaSpotify, FaRss } from 'react-icons/fa';
import { fetchPodcastFeed, type PodcastInfo } from '@/lib/podcast';

type PodcastPageProps = {
  podcastData: PodcastInfo;
};

const PODCAST_LINKS = [
  {
    name: 'Amazon Music',
    url: 'https://music.amazon.co.jp/podcasts/75ad5614-fa57-478e-8727-469042997eae',
    icon: FaAmazon,
    bgColor: 'bg-[#00A8E1]',
  },
  {
    name: 'Apple Podcasts',
    url: 'https://podcasts.apple.com/us/podcast/antipop-fm/id1616592596',
    icon: FaApple,
    bgColor: 'bg-[#A855F7]',
  },
  {
    name: 'Spotify',
    url: 'https://open.spotify.com/show/35L7VOknYyZw1wuM9NdRuL',
    icon: FaSpotify,
    bgColor: 'bg-[#1DB954]',
  },
  {
    name: 'RSS',
    url: 'https://anchor.fm/s/6877a570/podcast/rss',
    icon: FaRss,
    bgColor: 'bg-[#FFA500]',
  },
];

// HTMLタグを除去する関数（短い説明文用）
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

// HTMLを安全に表示用に処理（リンクのtarget属性を追加、URLを自動リンク化）
function processHtml(html: string): string {
  if (!html) return '';

  // 既存の<a>タグにtarget="_blank"とrel="noopener noreferrer"を追加
  let processed = html.replace(
    /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*)>/gi,
    '<a $1href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline"$3>'
  );

  // プレーンテキストのURL（https://で始まる文字列）を<a>タグに変換
  // ただし既に<a>タグになっているものは除外
  processed = processed.replace(
    /(^|[^">])(https?:\/\/[^\s<]+)/gi,
    (match, prefix, url) => {
      // URLの前に href=" がある場合は既にリンクになっているので変換しない
      if (prefix.includes('href=') || prefix.includes('src=')) {
        return match;
      }
      return `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${url}</a>`;
    }
  );

  return processed;
}

export default function PodcastPage({ podcastData }: PodcastPageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 説明文の最初の1文だけを取得
  const getShortDescription = (desc: string): string => {
    const stripped = stripHtml(desc);
    const sentences = stripped.split('。');
    return sentences[0] + '。';
  };

  return (
    <Layout>
      <SEO
        title="ポッドキャスト"
        description={getShortDescription(podcastData.description || '栗林健太郎のポッドキャスト')}
      />

      <PageHeader title="ポッドキャスト">
        <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
          {getShortDescription(podcastData.description)}
        </p>

        {/* プラットフォームリンク */}
        <div className="flex justify-center gap-3 sm:gap-4">
          {PODCAST_LINKS.map((platform) => {
            const Icon = platform.icon;
            return (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${platform.bgColor} text-white p-2 sm:p-2.5 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                title={platform.name}
                aria-label={platform.name}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            );
          })}
        </div>
      </PageHeader>

      {/* ポッドキャスト情報セクション */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="container max-w-5xl">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 bg-white rounded-2xl p-6 sm:p-8 shadow-md">
            {/* ポッドキャストカバー画像 */}
            {podcastData.imageUrl && (
              <div className="flex-shrink-0">
                <div className="relative w-full md:w-64 h-64 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={podcastData.imageUrl}
                    alt={podcastData.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* ポッドキャスト情報 */}
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-dark">
                {podcastData.title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                By 栗林健太郎
              </p>

              <div className="mb-6">
                <div
                  className={`text-sm sm:text-base text-gray-700 [&_p]:mb-3 [&_br]:block ${!isExpanded ? 'line-clamp-6' : ''}`}
                  dangerouslySetInnerHTML={{ __html: processHtml(podcastData.description) }}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                {podcastData.description && stripHtml(podcastData.description).length > 200 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-primary hover:underline text-sm mt-2"
                  >
                    {isExpanded ? '閉じる' : 'もっと見る'}
                  </button>
                )}
              </div>

              {/* プラットフォームリンク */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-700">配信プラットフォーム</h3>
                <div className="flex flex-wrap gap-3">
                  {PODCAST_LINKS.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <a
                        key={platform.name}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 hover:shadow-md"
                      >
                        <Icon className="w-5 h-5 text-gray-700" />
                        <span className="font-medium text-sm text-gray-700">
                          {platform.name}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container max-w-5xl">

          {/* エピソード一覧 */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-dark">
              エピソード
            </h2>
            {podcastData.episodes.length === 0 ? (
              <p className="text-gray-600">エピソードはまだありません</p>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {podcastData.episodes.map((episode, index) => (
                  <div
                    key={episode.guid || index}
                    className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-dark">
                      {episode.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(episode.pubDate).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {episode.duration && ` • ${episode.duration}`}
                    </p>
                    {episode.description && (
                      <div
                        className="text-sm sm:text-base text-gray-700 mb-4 line-clamp-3 [&_p]:mb-3 [&_br]:block"
                        dangerouslySetInnerHTML={{ __html: processHtml(episode.description) }}
                        style={{ whiteSpace: 'pre-wrap' }}
                      />
                    )}
                    {episode.audioUrl && (
                      <audio
                        controls
                        className="w-full mt-4"
                        preload="metadata"
                      >
                        <source src={episode.audioUrl} type="audio/mpeg" />
                        お使いのブラウザは音声再生に対応していません。
                      </audio>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // RSSフィードから直接最新データを取得
    const rssUrl = 'https://anchor.fm/s/6877a570/podcast/rss';
    const podcastData = await fetchPodcastFeed(rssUrl);

    return {
      props: {
        podcastData,
      },
    };
  } catch (error) {
    console.error('Error fetching podcast data:', error);

    // エラー時はデフォルトデータを返す
    return {
      props: {
        podcastData: {
          title: 'Antipop FM',
          description: 'ポッドキャストの説明',
          episodes: [],
        },
      },
    };
  }
};
