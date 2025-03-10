import { useState, useEffect } from 'react';
import type { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import fs from 'node:fs';
import path from 'node:path';
import Layout from '../../components/layout/Layout';
import SEO from '../../components/common/SEO';
import { FaRss } from 'react-icons/fa';
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
      case 'podcast': return '🎙️';
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
        title="アウトプット一覧"
        description="栗林健太郎のブログ、技術ブログ、スライド、動画、音楽、ポッドキャストのまとめ"
      />

      <div className="page-header bg-gradient-to-br from-primary/10 to-accent2/10 py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-center">アウトプット一覧</h1>
          <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
            note、技術ブログ、スライド、動画、音楽、ポッドキャストなど、さまざまな形式でのアウトプットをまとめています。
          </p>
          <div className="flex justify-center mt-4">
            <Link href="/works/feed.xml" className="inline-flex items-center text-primary hover:text-primary-dark">
              <FaRss className="mr-1" />
              <span>RSS</span>
            </Link>
          </div>
        </div>
      </div>

      <section className="py-12">
        <div className="container">
          {/* タブナビゲーション */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              type="button"
              className={`px-4 py-2 rounded-md ${activeTab === 'all' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              onClick={() => setActiveTab('all')}
            >
              すべて
            </button>
            
            {feedData.sources.map(source => (
              <button
                type="button"
                key={source.type}
                className={`px-4 py-2 rounded-md ${activeTab === source.type ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredItems.map((item, index) => (
                <motion.a
                  key={`${item.url}-${index}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card"
                  variants={itemAnimation}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative h-48 bg-gray-100 -mx-6 -mt-6 mb-4">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl">
                        {getSourceIcon(item.source)}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs">
                      {item.sourceName}
                    </div>
                  </div>
                  
                  <h2 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h2>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.description}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <p className="text-gray-500 text-xs">{formatDate(item.date)}</p>
                    <span className="text-primary text-sm">詳細を見る →</span>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-gray-500">
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
    
    return {
      props: {
        feedData,
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