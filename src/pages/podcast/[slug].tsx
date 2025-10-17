import type { GetStaticPaths, GetStaticProps } from 'next';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import { fetchPodcastFeed, type PodcastEpisode, type PodcastInfo } from '@/lib/podcast';
import { FaApple, FaAmazon, FaSpotify, FaRss, FaArrowLeft } from 'react-icons/fa';

type EpisodePageProps = {
  episode: PodcastEpisode;
  podcastInfo: PodcastInfo;
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
  processed = processed.replace(
    /(^|[^">])(https?:\/\/[^\s<]+)/gi,
    (match, prefix, url) => {
      if (prefix.includes('href=') || prefix.includes('src=')) {
        return match;
      }
      return `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${url}</a>`;
    }
  );

  return processed;
}

export default function EpisodePage({ episode, podcastInfo }: EpisodePageProps) {
  const description = stripHtml(episode.description).slice(0, 160);
  const playerUrl = `https://kentarokuribayashi.com/podcast/player/${episode.slug}`;

  return (
    <Layout>
      <SEO
        title={`${episode.title} - ${podcastInfo.title}`}
        description={description}
        twitterCard="player"
        audioUrl={playerUrl}
        audioType={episode.audioType || 'audio/mpeg'}
        ogImage={podcastInfo.imageUrl}
      />

      <article className="py-8 sm:py-12 md:py-16">
        <div className="container max-w-4xl">
          {/* 戻るリンク */}
          <Link
            href="/podcast"
            className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
          >
            <FaArrowLeft className="w-4 h-4" />
            ポッドキャスト一覧に戻る
          </Link>

          {/* エピソード情報 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md mb-8">
            {/* ポッドキャストカバー画像 */}
            {podcastInfo.imageUrl && (
              <div className="mb-6">
                <div className="relative w-full max-w-md mx-auto aspect-square rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={podcastInfo.imageUrl}
                    alt={podcastInfo.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-dark">
              {episode.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-gray-600">
              <time dateTime={episode.pubDate}>
                {new Date(episode.pubDate).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {episode.duration && (
                <>
                  <span>•</span>
                  <span>{episode.duration}</span>
                </>
              )}
            </div>

            {/* 音声プレーヤー */}
            {episode.audioUrl && (
              <div className="mb-6">
                <audio controls className="w-full" preload="metadata">
                  <source src={episode.audioUrl} type="audio/mpeg" />
                  お使いのブラウザは音声再生に対応していません。
                </audio>
              </div>
            )}

            {/* プラットフォームリンク */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-3 text-gray-700">配信プラットフォーム</h2>
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

            {/* エピソードの説明 */}
            {episode.description && (
              <div className="prose prose-lg max-w-none">
                <h2 className="text-xl font-bold mb-4 text-dark">エピソードについて</h2>
                <div
                  className="text-base text-gray-700 [&_p]:mb-3 [&_br]:block"
                  dangerouslySetInnerHTML={{ __html: processHtml(episode.description) }}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              </div>
            )}
          </div>
        </div>
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const rssUrl = 'https://anchor.fm/s/6877a570/podcast/rss';
    const podcastData = await fetchPodcastFeed(rssUrl);

    const paths = podcastData.episodes.map((episode) => ({
      params: { slug: episode.slug },
    }));

    return {
      paths,
      fallback: false,
    };
  } catch (error) {
    console.error('Error generating paths:', error);
    return {
      paths: [],
      fallback: false,
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const rssUrl = 'https://anchor.fm/s/6877a570/podcast/rss';
    const podcastData = await fetchPodcastFeed(rssUrl);

    const episode = podcastData.episodes.find((ep) => ep.slug === params?.slug);

    if (!episode) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        episode,
        podcastInfo: {
          title: podcastData.title,
          description: podcastData.description,
          imageUrl: podcastData.imageUrl,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching episode:', error);
    return {
      notFound: true,
    };
  }
};
