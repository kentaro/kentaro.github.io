import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import PageHeader from '@/components/common/PageHeader';
import Section from '@/components/common/Section';
import ContentContainer from '@/components/common/ContentContainer';

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
  let month = '';
  let day = '';

  if (date && isJournalPost) {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    month = String(dateObj.getMonth() + 1);
    day = String(dateObj.getDate());
    monthDay = `${year}年${month}月${day}日`;
    formattedDate = monthDay; // formattedDateにも同じ値を設定
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
      {/* ページヘッダー */}
      <PageHeader 
        title={isJournal ? formattedDate : title}
        backLink={postData?.path === '/profile' ? undefined : {
          href: isJournal ? '/journal' : '/blog',
          label: isJournal ? '日記一覧に戻る' : 'ブログ一覧に戻る'
        }}
      >
        {isJournal && monthDay && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href={`/journal/date/${month}/${day}`}
              className="inline-flex items-center text-primary hover:text-primary-dark"
            >
              <FaCalendarAlt className="mr-2" />
              <span>この日の日記一覧を見る</span>
            </Link>
          </motion.div>
        )}
        {!isJournal && formattedDate && postData?.path !== '/profile' && (
          <p className="text-gray-600 mt-2">
            {formattedDate}
          </p>
        )}
      </PageHeader>

      <Section>
        <ContentContainer>
          {isClient ? (
            <div
              className={`markdown-content ${postData?.path === '/profile' ? 'profile-content' : ''}`}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />
          ) : null}
          {children}

          {isJournal && postData?.path !== '/profile' && (
            <div className="flex justify-between mt-12 pt-6 border-t border-gray-200">
              {prevPost ? (
                <Link
                  href={`/${prevPost.slug}`}
                  className="flex items-center text-primary hover:text-primary-dark transition-colors"
                >
                  <FaChevronLeft className="mr-2" />
                  <span>前の日記{prevPost.title && <><br />{prevPost.title}</>}</span>
                </Link>
              ) : (
                <div />
              )}

              {nextPost ? (
                <Link
                  href={`/${nextPost.slug}`}
                  className="flex items-center text-primary hover:text-primary-dark transition-colors"
                >
                  <span>次の日記{nextPost.title && <><br />{nextPost.title}</>}</span>
                  <FaChevronRight className="ml-2" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          )}
        </ContentContainer>
      </Section>
    </motion.div>
  );
}