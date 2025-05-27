import type { GetStaticProps } from 'next';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import PageHeader from '@/components/common/PageHeader';
import Section, { SectionTitle } from '@/components/common/Section';
import { Card } from '@/components/common/Card';
import { FaCalendarAlt } from 'react-icons/fa';
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
      
      <PageHeader
        title="日記"
        description="日々の活動や考えを記録しています。年別に閲覧できます。"
        rssLink="/journal/feed.xml"
      />
      
      <Section>
        <div className="">
          {/* 最新の日記12件 */}
          <SectionTitle>最新の日記</SectionTitle>
          <PostList 
            posts={recentPosts} 
            emptyMessage="日記はまだありません"
            limit={12}
          />
          
          {/* 年別アーカイブ */}
          <div className="mt-20 sm:mt-24">
            <SectionTitle>年別アーカイブ</SectionTitle>
          </div>
          
          {years.length > 0 ? (
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 max-w-5xl mx-auto"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {years.map((year, index) => (
                <motion.div 
                  key={year} 
                  variants={item}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:scale-105 hover:shadow-lg">
                    <Link 
                      href={`/journal/${year}`}
                      className="block text-center p-6 sm:p-8 group"
                    >
                      <FaCalendarAlt className="text-3xl sm:text-4xl text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xl sm:text-2xl font-bold text-dark group-hover:text-primary transition-colors">{year}年</span>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-gray-600 text-lg py-12">日記はまだありません</p>
          )}
        </div>
      </Section>
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