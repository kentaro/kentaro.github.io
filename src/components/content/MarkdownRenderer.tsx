import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

type MarkdownRendererProps = {
  title: string;
  contentHtml: string;
  date?: string;
  children?: React.ReactNode;
  prevPost?: {
    slug: string;
    title: string;
  } | null;
  nextPost?: {
    slug: string;
    title: string;
  } | null;
  isJournalPost?: boolean;
  postData?: {
    title: string;
    contentHtml: string;
    date?: string;
    excerpt?: string;
    path: string;
    [key: string]: unknown;
  };
};

export default function MarkdownRenderer({
  title,
  contentHtml,
  date,
  children,
  prevPost,
  nextPost,
  isJournalPost = false,
  postData
}: MarkdownRendererProps) {
  const router = useRouter();
  const [highlightedContent, setHighlightedContent] = useState(contentHtml);
  const [isClient, setIsClient] = useState(false);
  
  // 日記ページの場合、日付から月と日を抽出
  let monthDay = '';
  let formattedDate = '';
  if (date && isJournalPost) {
    const dateObj = new Date(date);
    monthDay = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    
    try {
      formattedDate = format(parseISO(date), 'yyyy年MM月dd日', { locale: ja });
    } catch (e) {
      console.error('Date formatting error:', e);
      formattedDate = date;
    }
  } else if (date) {
    try {
      formattedDate = format(parseISO(date), 'yyyy年MM月dd日', { locale: ja });
    } catch (e) {
      console.error('Date formatting error:', e);
      formattedDate = date;
    }
  }
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!router.isReady || !contentHtml) return;

    const query = router.query.q as string;
    
    if (!query) {
      setHighlightedContent(contentHtml);
      return;
    }

    // クエリがある場合はキーワードをハイライト
    const keywords = query.split(/\s+/).filter(Boolean);
    let html = contentHtml;

    for (const keyword of keywords) {
      if (!keyword) continue;
      const regex = new RegExp(`(${keyword})`, 'gi');
      html = html.replace(regex, '<mark class="bg-yellow-200 rounded px-1">$1</mark>');
    }

    setHighlightedContent(html);
  }, [router.isReady, router.query.q, contentHtml]);
  
  // 日記の場合は前後の記事へのリンクを表示
  const isJournal = postData?.path?.startsWith('/journal/') || isJournalPost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ページヘッダーを追加 */}
      <div className="page-header">
        <div className="container flex flex-col justify-center">
          {isJournal ? (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-center">{formattedDate}</h1>
            </>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-center">{title}</h1>
              {formattedDate && (
                <p className="text-center text-gray-600 mt-2">
                  {formattedDate}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="py-2">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 max-w-4xl mx-auto">
          {isClient ? (
            <div 
              className="markdown-content"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />
          ) : null}
          {children}
          
          {isJournal && (
            <div className="flex justify-between mt-12 pt-6 border-t">
              {prevPost ? (
                <Link 
                  href={`/${prevPost.slug}`} 
                  className="flex items-center text-primary hover:text-primary-dark"
                >
                  <FaChevronLeft className="mr-2" />
                  <span>前の日記</span>
                </Link>
              ) : (
                <div />
              )}
              
              {nextPost ? (
                <Link 
                  href={`/${nextPost.slug}`} 
                  className="flex items-center text-primary hover:text-primary-dark"
                >
                  <span>次の日記</span>
                  <FaChevronRight className="ml-2" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}