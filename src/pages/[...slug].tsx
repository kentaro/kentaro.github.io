import type { GetStaticPaths, GetStaticProps } from 'next';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';

type PostProps = {
  postData: {
    title: string;
    contentHtml: string;
    date?: string;
    excerpt?: string;
    [key: string]: unknown;
  } | null;
  isJournalPost: boolean;
  prevPost: {
    slug: string;
    title: string;
  } | null;
  nextPost: {
    slug: string;
    title: string;
  } | null;
};

export default function Post({ postData, isJournalPost, prevPost, nextPost }: PostProps) {
  console.log('Rendering Post component:', { 
    hasPostData: !!postData,
    isJournalPost
  });
  
  if (postData) {
    console.log('Post data title:', postData.title);
    console.log('Post data content length:', postData.contentHtml.length);
  }
  
  if (!postData) {
    return (
      <Layout>
        <div className="error-message">
          <h1>コンテンツが見つかりません</h1>
          <p>お探しのページは存在しないか、移動した可能性があります。</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title={postData.title || ''}
        description={postData.excerpt || `${postData.title || ''}に関する記事`}
        ogType="article"
      />
      
      <MarkdownRenderer
        title={postData.title || ''}
        contentHtml={postData.contentHtml || ''}
        date={postData.date}
        isJournalPost={isJournalPost}
        prevPost={prevPost}
        nextPost={nextPost}
        postData={{
          ...postData,
          path: `/${isJournalPost ? 'journal/' : ''}${prevPost?.slug?.split('/')[0] || ''}`
        }}
      />
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = getAllMarkdownFiles();
  
  // デバッグ用に出力
  console.log('Generated paths:', JSON.stringify(files, null, 2));
  
  const paths = files.map(({ slug }) => {
    // スラッグをパスのパラメータに変換
    return {
      params: {
        slug: slug.split('/').filter(Boolean),
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slugPath = params?.slug as string[];
  const slug = slugPath.join('/');
  const isJournalPost = slugPath[0] === 'journal';
  
  console.log('Processing slug:', slug);
  
  // マークダウンファイルのデータを取得
  const postData = await getMarkdownData(slug);
  
  console.log('Post data for slug:', slug, postData ? 'found' : 'not found');
  if (postData) {
    console.log('Title:', postData.title);
    console.log('Content length:', postData.contentHtml.length);
  }
  
  if (!postData) {
    return {
      notFound: true,
    };
  }

  // 日付が確実に文字列または null になるようにする
  if (postData.date instanceof Date) {
    postData.date = postData.date.toISOString();
  } else if (postData.date && typeof postData.date !== 'string') {
    postData.date = String(postData.date);
  } else if (postData.date === undefined) {
    postData.date = null;
  }

  // 前後の日記を取得（日記ページの場合のみ）
  let prevPost = null;
  let nextPost = null;

  if (isJournalPost) {
    // 現在の日記の年月日を取得
    const parts = slug.split('/');
    if (parts.length >= 4) {
      const year = parts[1];
      const month = parts[2];
      
      // 同じ年月の日記を全て取得
      const allFiles = getAllMarkdownFiles();
      
      // 全ての日記ファイルを取得
      const journalFiles = allFiles.filter(({ slug: postSlug }) => 
        postSlug.startsWith('journal/')
      );
      
      // 日記ファイルを年月日でマッピング
      const journalPostsByYearMonth: Record<string, {
        slug: string;
        day: number;
        filename: string;
        year: string;
        month: string;
        date: Date;
      }[]> = {};
      
      for (const { slug: postSlug } of journalFiles) {
        const postParts = postSlug.split('/');
        if (postParts.length >= 4) {
          const postYear = postParts[1];
          const postMonth = postParts[2];
          const yearMonthKey = `${postYear}-${postMonth}`;
          
          // ファイル名から日付を抽出
          const filename = postParts[3];
          const dayMatch = filename.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
          
          if (dayMatch) {
            const fileYear = dayMatch[1];
            const fileMonth = dayMatch[2];
            const fileDay = dayMatch[3];
            
            // 日付オブジェクトを作成
            const date = new Date(
              Number(fileYear),
              Number(fileMonth) - 1, // JavaScriptの月は0始まり
              Number(fileDay)
            );
            
            if (!journalPostsByYearMonth[yearMonthKey]) {
              journalPostsByYearMonth[yearMonthKey] = [];
            }
            
            journalPostsByYearMonth[yearMonthKey].push({
              slug: postSlug,
              day: Number(fileDay),
              filename,
              year: postYear,
              month: postMonth,
              date
            });
          }
        }
      }
      
      // 各月の日記を日付順にソート
      for (const key in journalPostsByYearMonth) {
        journalPostsByYearMonth[key].sort((a, b) => a.day - b.day);
      }
      
      // 現在の年月の日記
      const currentYearMonthKey = `${year}-${month}`;
      const currentMonthPosts = journalPostsByYearMonth[currentYearMonthKey] || [];
      
      // 現在の日記のインデックスを見つける
      const currentIndex = currentMonthPosts.findIndex(post => post.slug === slug);
      
      if (currentIndex > 0) {
        // 同じ月内の前の日記
        prevPost = {
          slug: currentMonthPosts[currentIndex - 1].slug,
          title: currentMonthPosts[currentIndex - 1].filename
        };
      } else if (currentIndex === 0) {
        // 月の最初の日記の場合、前月の最後の日記を探す
        const currentDate = new Date(Number(year), Number(month) - 1, 1);
        const prevMonth = new Date(currentDate);
        prevMonth.setDate(0); // 前月の最終日
        
        const prevMonthYear = prevMonth.getFullYear().toString();
        const prevMonthMonth = (prevMonth.getMonth() + 1).toString().padStart(2, '0');
        const prevMonthKey = `${prevMonthYear}-${prevMonthMonth}`;
        
        const prevMonthPosts = journalPostsByYearMonth[prevMonthKey] || [];
        if (prevMonthPosts.length > 0) {
          // 前月の最後の日記
          const lastPostOfPrevMonth = prevMonthPosts[prevMonthPosts.length - 1];
          prevPost = {
            slug: lastPostOfPrevMonth.slug,
            title: lastPostOfPrevMonth.filename
          };
        }
      }
      
      if (currentIndex < currentMonthPosts.length - 1) {
        // 同じ月内の次の日記
        nextPost = {
          slug: currentMonthPosts[currentIndex + 1].slug,
          title: currentMonthPosts[currentIndex + 1].filename
        };
      } else if (currentIndex === currentMonthPosts.length - 1) {
        // 月の最後の日記の場合、翌月の最初の日記を探す
        const currentDate = new Date(Number(year), Number(month) - 1, 1);
        const nextMonth = new Date(currentDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1); // 翌月
        
        const nextMonthYear = nextMonth.getFullYear().toString();
        const nextMonthMonth = (nextMonth.getMonth() + 1).toString().padStart(2, '0');
        const nextMonthKey = `${nextMonthYear}-${nextMonthMonth}`;
        
        const nextMonthPosts = journalPostsByYearMonth[nextMonthKey] || [];
        if (nextMonthPosts.length > 0) {
          // 翌月の最初の日記
          const firstPostOfNextMonth = nextMonthPosts[0];
          nextPost = {
            slug: firstPostOfNextMonth.slug,
            title: firstPostOfNextMonth.filename
          };
        }
      }
    }
  }

  return {
    props: {
      postData,
      isJournalPost,
      prevPost,
      nextPost
    },
  };
}; 