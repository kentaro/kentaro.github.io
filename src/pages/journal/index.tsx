import type { GetStaticProps } from 'next';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import { FaRss, FaCalendarAlt } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PostList from '@/components/content/PostList';

type Post = {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
};

type JournalPageProps = {
  years: string[];
  recentPosts: Post[];
};

export default function JournalPage({ years, recentPosts }: JournalPageProps) {
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

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <SEO 
        title="日記"
        description="栗林健太郎の日記。日々の活動や考えを記録しています。"
      />
      
      <div className="page-header">
        <div className="container flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-center">日記</h1>
          <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
            日々の活動や考えを記録しています。年別に閲覧できます。
          </p>
          <div className="flex justify-center mt-4">
            <Link href="/journal/feed.xml" className="inline-flex items-center text-primary hover:text-primary-dark">
              <FaRss className="mr-1" />
              <span>RSS</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="py-12">
        <div className="container">
          {/* 最新の日記12件 */}
          <h2 className="section-title">最新の日記</h2>
          <PostList 
            posts={recentPosts} 
            emptyMessage="日記はまだありません"
            limit={12}
          />
          
          {/* 年別アーカイブ */}
          <h2 className="section-title mt-16">年別アーカイブ</h2>
          
          {years.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {years.map((year) => (
                <motion.div 
                  key={year} 
                  variants={item}
                  transition={{ duration: 0.3 }}
                >
                  <Link 
                    href={`/journal/${year}`}
                    className="card flex items-center p-4 hover:bg-primary/5 transition-colors h-full"
                  >
                    <FaCalendarAlt className="text-primary mr-3 text-lg" />
                    <span className="text-lg font-medium">{year}年</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-gray-600 mt-8">日記はまだありません</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // journalディレクトリ内のマークダウンファイルを取得
  const allFiles = getAllMarkdownFiles();
  const journalFiles = allFiles.filter(({ slug }) => slug.startsWith('journal/'));
  
  // 年の一覧を抽出（重複なし）
  const years = Array.from(
    new Set(
      journalFiles.map(({ slug }) => {
        const parts = slug.split('/');
        return parts.length >= 2 ? parts[1] : null;
      }).filter(Boolean)
    )
  ).sort((a, b) => Number(b) - Number(a)); // 降順（新しい年が上）

  // 最新の日記10件を取得
  const recentPostsPromises = journalFiles
    .map(async ({ slug }) => {
      const data = await getMarkdownData(slug);
      
      // 日付が確実に文字列または null になるようにする
      let date = data?.date;
      if (date instanceof Date) {
        date = date.toISOString();
      } else if (date && typeof date !== 'string') {
        date = String(date);
      } else if (date === undefined) {
        date = null;
      }
      
      return {
        slug,
        title: data?.title || slug.split('/').pop() || '',
        date,
        excerpt: data?.excerpt,
      };
    });
  
  const allPosts = await Promise.all(recentPostsPromises);
  
  // 日付でソート（新しい順）
  const sortedPosts = [...allPosts].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // 最新12件を取得
  const recentPosts = sortedPosts.slice(0, 12);

  return {
    props: {
      years,
      recentPosts,
    },
  };
}; 