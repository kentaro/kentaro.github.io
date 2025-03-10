import type { GetStaticProps, GetStaticPaths } from 'next';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import Link from 'next/link';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

type JournalEntry = {
  slug: string;
  title: string;
  contentHtml: string;
  date?: string;
  excerpt?: string;
  year: string;
};

type JournalDayPageProps = {
  entries: JournalEntry[];
  month: string;
  day: string;
  monthName: string;
  prevDay?: { month: string; day: string; };
  nextDay?: { month: string; day: string; };
};

export default function JournalDayPage({ entries, month, day, monthName, prevDay, nextDay }: JournalDayPageProps) {
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
        title={`${monthName}${day}日の日記一覧`}
        description={`${monthName}${day}日の栗林健太郎の日記アーカイブ。年別に閲覧できます。`}
      />
      
      <div className="page-header">
        <div className="container flex flex-col justify-center">
          <div className="flex items-center justify-center mb-4">
            <Link href="/journal" className="inline-flex items-center text-primary hover:text-primary-dark">
              <FaArrowLeft className="mr-1" />
              <span>日記一覧に戻る</span>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center">{monthName}{day}日の日記一覧</h1>
        </div>
      </div>
      
      <div className="pb-12">
        <div className="container">
          {entries.length > 0 ? (
            <div className="space-y-8 journal-day-content">
              {entries.map((entry) => (
                <div key={entry.slug} className="markdown-content">
                  <div className="bg-white rounded-lg max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-3 py-4 text-center">
                      <Link href={`/${entry.slug}`} className="hover:text-primary transition-colors">
                        {entry.year}年{monthName}{day}日
                      </Link>
                    </h2>
                    
                    {/* eslint-disable-next-line react/no-danger */}
                    <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: entry.contentHtml }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 mt-8">この日の日記はありません</p>
          )}
          
          {/* 前の日・次の日ナビゲーション */}
          <div className="max-w-4xl mx-auto mt-12 border-t border-gray-200 pt-6 flex justify-between">
            <div>
              {prevDay && (
                <Link href={`/journal/date/${prevDay.month}/${prevDay.day}`} className="inline-flex items-center text-primary hover:text-primary-dark">
                  <FaArrowLeft className="mr-1" />
                  <span>前の日記<br />{prevDay.month}月{prevDay.day}日</span>
                </Link>
              )}
            </div>
            <div className="text-right">
              {nextDay && (
                <Link href={`/journal/date/${nextDay.month}/${nextDay.day}`} className="inline-flex items-center text-primary hover:text-primary-dark">
                  <span>次の日記<br />{nextDay.month}月{nextDay.day}日</span>
                  <FaArrowRight className="ml-1" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // journalディレクトリ内のマークダウンファイルを取得
  const allFiles = getAllMarkdownFiles();
  const journalFiles = allFiles.filter(({ slug }) => slug.startsWith('journal/'));
  
  // 月と日の組み合わせを抽出
  const monthDaySet = new Set<string>();
  
  for (const { slug } of journalFiles) {
    const parts = slug.split('/');
    if (parts.length >= 4) {
      const filename = parts[3];
      const dayMatch = filename.match(/\d{4}年(\d{1,2})月(\d{1,2})日/);
      
      if (dayMatch) {
        const month = dayMatch[1];
        const day = dayMatch[2];
        monthDaySet.add(`${month}/${day}`);
      }
    }
  }

  const paths = Array.from(monthDaySet).map(monthDay => {
    const [month, day] = monthDay.split('/');
    return {
      params: { month, day }
    };
  });

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const month = params?.month as string;
  const day = params?.day as string;
  
  // 月の名前（日本語）
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  const monthName = monthNames[Number(month) - 1];
  
  // journalディレクトリ内のマークダウンファイルを取得
  const allFiles = getAllMarkdownFiles();
  const journalFiles = allFiles.filter(({ slug }) => slug.startsWith('journal/'));
  
  // 現在の日付のエントリーを取得
  const currentDayEntries = journalFiles.filter(({ slug }) => {
    const parts = slug.split('/');
    if (parts.length >= 4) {
      const filename = parts[3];
      const dayMatch = filename.match(/\d{4}年(\d{1,2})月(\d{1,2})日/);
      
      if (dayMatch) {
        const fileMonth = dayMatch[1];
        const fileDay = dayMatch[2];
        return fileMonth === month && fileDay === day;
      }
    }
    return false;
  });
  
  // 全ての月/日の組み合わせを取得
  const allMonthDays: { month: string; day: string }[] = [];
  
  for (const { slug } of journalFiles) {
    const parts = slug.split('/');
    if (parts.length >= 4) {
      const filename = parts[3];
      const dayMatch = filename.match(/\d{4}年(\d{1,2})月(\d{1,2})日/);
      
      if (dayMatch) {
        const fileMonth = dayMatch[1];
        const fileDay = dayMatch[2];
        // 重複を避けるために文字列として比較
        const monthDayStr = `${fileMonth}-${fileDay}`;
        if (!allMonthDays.some(md => `${md.month}-${md.day}` === monthDayStr)) {
          allMonthDays.push({ month: fileMonth, day: fileDay });
        }
      }
    }
  }
  
  // 月/日の組み合わせを日付としてソート
  allMonthDays.sort((a, b) => {
    const aVal = Number(a.month) * 100 + Number(a.day);
    const bVal = Number(b.month) * 100 + Number(b.day);
    return aVal - bVal;
  });
  
  // 現在の月/日のインデックスを見つける
  const currentIndex = allMonthDays.findIndex(
    md => md.month === month && md.day === day
  );
  
  // 前の日と次の日を取得
  const prevDay = currentIndex > 0 ? allMonthDays[currentIndex - 1] : null;
  const nextDay = currentIndex < allMonthDays.length - 1 ? allMonthDays[currentIndex + 1] : null;

  // 各ファイルのデータを取得
  const entriesPromises = currentDayEntries.map(async ({ slug }) => {
    const data = await getMarkdownData(slug);
    
    if (!data) {
      return null;
    }
    
    // ファイル名から年を抽出
    const parts = slug.split('/');
    const filename = parts[3];
    const yearMatch = filename.match(/(\d{4})年/);
    const year = yearMatch ? yearMatch[1] : parts[1];
    
    // 日付が確実に文字列になるようにする
    let dateStr = data.date;
    if (dateStr instanceof Date) {
      dateStr = dateStr.toISOString();
    } else if (dateStr && typeof dateStr !== 'string') {
      dateStr = String(dateStr);
    }
    
    return {
      slug,
      title: data.title || filename,
      contentHtml: data.contentHtml,
      date: dateStr,
      excerpt: data.excerpt,
      year
    };
  });
  
  const entriesWithData = await Promise.all(entriesPromises);
  const entries = entriesWithData.filter(Boolean) as JournalEntry[];
  
  // 年の降順でソート（新しい年が上）
  entries.sort((a, b) => Number(b.year) - Number(a.year));

  return {
    props: {
      entries,
      month,
      day,
      monthName,
      prevDay,
      nextDay
    }
  };
}; 