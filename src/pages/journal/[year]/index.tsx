import type { GetStaticProps, GetStaticPaths } from 'next';
import { getAllMarkdownFiles } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import { FaCalendarAlt } from 'react-icons/fa';
import PageHeader from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
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
      
      <PageHeader
        title={`${year}年の日記`}
        description={`${year}年の日記を月別に閲覧できます。`}
        backLink={{
          href: '/journal',
          label: '日記一覧に戻る'
        }}
      />
      
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container max-w-5xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark text-center mb-10 sm:mb-12 relative pb-6">
            月別アーカイブ
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-primary rounded-full"></span>
          </h2>
          
          {months.length > 0 ? (
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6"
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
                  <Card className="hover:scale-105 hover:shadow-lg">
                    <Link 
                      href={`/journal/${year}/${month}`}
                      className="flex flex-col p-6 sm:p-8 h-full group"
                    >
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-primary mr-3 text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xl sm:text-2xl font-bold group-hover:text-primary transition-colors">{monthNames[Number(month) - 1]}</span>
                    </div>
                      <div className="text-sm sm:text-base text-gray-600 mt-3">
                        {count}件の日記
                      </div>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-gray-600 text-lg py-12">この年の日記はありません</p>
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