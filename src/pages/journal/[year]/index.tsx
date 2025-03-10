import type { GetStaticProps, GetStaticPaths } from 'next';
import { getAllMarkdownFiles } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import { FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';

type YearPageProps = {
  year: string;
  months: {
    month: string;
    count: number;
  }[];
};

export default function YearPage({ year, months }: YearPageProps) {
  // 月の名前（日本語）
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

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
        title={`${year}年の日記`}
        description={`${year}年の栗林健太郎の日記アーカイブ。月別に閲覧できます。`}
      />
      
      <div className="page-header">
        <div className="container">
          <div className="flex items-center justify-center mb-4">
            <Link href="/journal" className="inline-flex items-center text-primary hover:text-primary-dark">
              <FaArrowLeft className="mr-1" />
              <span>日記一覧に戻る</span>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center">{year}年の日記</h1>
          <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
            {year}年の日記を月別に閲覧できます。
          </p>
        </div>
      </div>
      
      <div className="py-12">
        <div className="container">
          <h2 className="section-title">月別アーカイブ</h2>
          
          {months.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {months.map(({ month, count }) => (
                <motion.div 
                  key={month} 
                  variants={item}
                  transition={{ duration: 0.3 }}
                >
                  <Link 
                    href={`/journal/${year}/${month}`}
                    className="card flex flex-col p-6 hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-primary mr-3 text-xl" />
                      <span className="text-xl font-medium">{monthNames[Number(month) - 1]}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2 ml-7">
                      {count}件の日記
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-gray-600 mt-8">この年の日記はありません</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // journalディレクトリ内のマークダウンファイルを取得
  const allFiles = getAllMarkdownFiles();
  const journalFiles = allFiles.filter(({ slug }) => slug.startsWith('journal/'));
  
  // 年の一覧を抽出（重複なし）
  const years = Array.from(
    new Set(
      journalFiles.map(({ slug }) => {
        const parts = slug.split('/');
        return parts.length >= 2 ? parts[1] : null;
      }).filter((year): year is string => year !== null)
    )
  );

  const paths = years.map(year => ({
    params: { year }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const year = params?.year as string;

  // journalディレクトリ内のマークダウンファイルを取得
  const allFiles = getAllMarkdownFiles();
  const yearFiles = allFiles.filter(({ slug }) => {
    const parts = slug.split('/');
    return parts.length >= 2 && parts[0] === 'journal' && parts[1] === year;
  });
  
  // 月ごとの記事数をカウント
  const monthCounts: Record<string, number> = {};
  
  for (const { slug } of yearFiles) {
    const parts = slug.split('/');
    if (parts.length >= 3) {
      const month = parts[2];
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
  }
  
  // 月の配列に変換（降順）
  const months = Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => Number(b.month) - Number(a.month));

  return {
    props: {
      year,
      months,
    },
  };
}; 