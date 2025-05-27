import type { GetStaticProps, GetStaticPaths } from 'next';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import { FaCalendarDay } from 'react-icons/fa';
import PageHeader from '@/components/common/PageHeader';
import { PostCard } from '@/components/common/Card';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Post = {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
  day?: string;
};

type MonthPageProps = {
  year: string;
  month: string;
  monthName: string;
  posts: Post[];
};

export default function MonthPage({ year, month, monthName, posts }: MonthPageProps) {
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
        title={`${year}年${monthName}の日記`}
        description={`${year}年${monthName}の栗林健太郎の日記アーカイブ。`}
      />
      
      <PageHeader
        title={`${year}年${monthName}の日記`}
        description={`${year}年${monthName}の日記一覧です。`}
        backLink={{
          href: `/journal/${year}`,
          label: `${year}年の一覧に戻る`
        }}
      />
      
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container max-w-5xl">
          {posts.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {posts.map((post) => (
                <motion.div 
                  key={post.slug} 
                  variants={item}
                  transition={{ duration: 0.3 }}
                >
                  <PostCard
                    href={`/${post.slug}`}
                    title={post.title}
                    date={post.date}
                    excerpt={post.excerpt}
                    index={posts.indexOf(post)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-gray-600 text-lg py-12">この月の日記はありません</p>
          )}
        </div>
      </section>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // journalディレクトリ内のマークダウンファイルを取得
  const allFiles = getAllMarkdownFiles();
  const journalFiles = allFiles.filter(({ slug }) => slug.startsWith('journal/'));
  
  // 年と月の組み合わせを抽出
  const yearMonthPairs: { year: string; month: string }[] = [];
  
  for (const { slug } of journalFiles) {
    const parts = slug.split('/');
    if (parts.length >= 3 && parts[1] && parts[2]) {
      const year = parts[1];
      const month = parts[2];
      
      // 既に追加済みかチェック
      const exists = yearMonthPairs.some(
        pair => pair.year === year && pair.month === month
      );
      
      if (!exists) {
        yearMonthPairs.push({ year, month });
      }
    }
  }

  const paths = yearMonthPairs.map(({ year, month }) => ({
    params: { year, month }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const year = params?.year as string;
  const month = params?.month as string;
  
  // 月の名前（日本語）
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  const monthName = monthNames[Number(month) - 1];

  // journalディレクトリ内のマークダウンファイルを取得
  const allFiles = getAllMarkdownFiles();
  const monthFiles = allFiles.filter(({ slug }) => {
    const parts = slug.split('/');
    return parts.length >= 3 && 
           parts[0] === 'journal' && 
           parts[1] === year && 
           parts[2] === month;
  });
  
  // 各ファイルのデータを取得
  const postsPromises = monthFiles.map(async ({ slug }) => {
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
    
    // ファイル名から日付を抽出
    const filename = slug.split('/').pop() || '';
    const dayMatch = filename.match(/(\d{1,2})日/);
    const day = dayMatch ? dayMatch[1] : '';
    
    return {
      slug,
      title: data?.title || filename || '',
      date,
      excerpt: data?.excerpt,
      day,
    };
  });
  
  const posts = await Promise.all(postsPromises);
  
  // 日付順にソート（日の昇順）
  const sortedPosts = [...posts].sort((a, b) => {
    const dayA = Number(a.day || 0);
    const dayB = Number(b.day || 0);
    return dayA - dayB;
  });

  return {
    props: {
      year,
      month,
      monthName,
      posts: sortedPosts,
    },
  };
}; 