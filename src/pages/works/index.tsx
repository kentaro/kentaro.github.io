import { useState, useEffect } from 'react';
import type { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import fs from 'node:fs';
import path from 'node:path';
import Layout from '../../components/layout/Layout';
import SEO from '../../components/common/SEO';
import { FaRss } from 'react-icons/fa';
import PageHeader from '@/components/common/PageHeader';
import { WorkCard } from '@/components/common/Card';
import { motion } from 'framer-motion';

// 型定義
interface FeedItem {
  title: string;
  description: string;
  url: string;
  date: string;
  source: string;
  sourceName: string;
  image: string | null;
}

interface FeedSource {
  url: string;
  type: string;
  name: string;
}

interface FeedData {
  items: FeedItem[];
  sources: FeedSource[];
  lastUpdated: string;
  allItems: FeedItem[]; // すべてのアイテム（制限なし）
  itemsByCategory: Record<string, FeedItem[]>; // カテゴリごとのアイテム
}

interface WorksPageProps {
  feedData: FeedData;
}

export default function WorksPage({ feedData }: WorksPageProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [filteredItems, setFilteredItems] = useState<FeedItem[]>([]);
  
  // タブが変更されたときにアイテムをフィルタリング
  useEffect(() => {
    if (activeTab === 'all') {
      // すべてタブは時間順で100件に制限
      setFilteredItems(feedData.items);
    } else {
      // 各タブは全件表示（カテゴリごとのアイテムを使用）
      setFilteredItems(feedData.itemsByCategory[activeTab] || []);
    }
  }, [activeTab, feedData.items, feedData.itemsByCategory]);

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ソースタイプに応じたアイコンを取得
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'note': return '📝';
      case 'tech-blog': return '💻';
      case 'slide': return '📊';
      case 'video': return '🎬';
      case 'music': return '🎵';
      default: return '📄';
    }
  };

  // アニメーション設定
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <SEO
        title="制作物"
        description="栗林健太郎のnote、技術ブログ、スライド、動画、音楽のまとめ"
      />

      <PageHeader
        title="制作物一覧"
        description="note、技術ブログ、スライド、動画、音楽など、さまざまな形式での制作物をまとめています。"
        rssLink="/works/feed.xml"
      />

      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container max-w-5xl">
          {/* タブナビゲーション */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 sm:mb-12">
            <button
              type="button"
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'all' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 hover:shadow-sm'}`}
              onClick={() => setActiveTab('all')}
            >
              すべて
            </button>
            
            {feedData.sources.map(source => (
              <button
                type="button"
                key={source.type}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === source.type ? 'bg-primary text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 hover:shadow-sm'}`}
                onClick={() => setActiveTab(source.type)}
              >
                <span className="mr-1">{getSourceIcon(source.type)}</span>
                {source.name}
              </button>
            ))}
          </div>

          {/* アイテム一覧 */}
          {filteredItems.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={`${item.url}-${index}`}
                  variants={itemAnimation}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <WorkCard
                    href={item.url}
                    title={item.title}
                    description={`${item.description} • ${formatDate(item.date)}`}
                    image={item.image || undefined}
                    isExternal={true}
                    index={index}
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-md z-10">
                    {getSourceIcon(item.source)} {item.sourceName}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 text-gray-600 text-lg">
              表示するアイテムがありません
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const dataFilePath = path.join(process.cwd(), 'public', 'works', 'feed-data.json');
    
    // ファイルが存在しない場合は空のデータを返す
    if (!fs.existsSync(dataFilePath)) {
      return {
        props: {
          feedData: {
            items: [],
            sources: [],
            lastUpdated: new Date().toISOString(),
            allItems: [],
            itemsByCategory: {},
          },
        },
      };
    }
    
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    const feedData: FeedData = JSON.parse(fileContents);
    
    // データサイズを削減するため、不要なフィールドを削除
    const optimizedFeedData: FeedData = {
      items: feedData.items.slice(0, 100), // 最新100件のみ
      sources: feedData.sources,
      lastUpdated: feedData.lastUpdated,
      allItems: [], // ページで使用していないので空配列に
      itemsByCategory: Object.entries(feedData.itemsByCategory).reduce((acc, [key, items]) => {
        acc[key] = items.slice(0, 50); // 各カテゴリ最新50件のみ
        return acc;
      }, {} as Record<string, FeedItem[]>),
    };
    
    return {
      props: {
        feedData: optimizedFeedData,
      },
    };
  } catch (error) {
    console.error('Error loading feed data:', error);
    return {
      props: {
        feedData: {
          items: [],
          sources: [],
          lastUpdated: new Date().toISOString(),
          allItems: [],
          itemsByCategory: {},
        },
      },
    };
  }
} 