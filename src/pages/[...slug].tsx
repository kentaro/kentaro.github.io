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
      const monthPosts = allFiles
        .filter(({ slug: postSlug }) => {
          const postParts = postSlug.split('/');
          return postParts.length >= 3 && 
                 postParts[0] === 'journal' && 
                 postParts[1] === year && 
                 postParts[2] === month;
        })
        .map(({ slug: postSlug }) => {
          // ファイル名から日付を抽出
          const filename = postSlug.split('/').pop() || '';
          const dayMatch = filename.match(/(\d{1,2})日/);
          const day = dayMatch ? Number(dayMatch[1]) : 0;
          
          return {
            slug: postSlug,
            day,
            filename
          };
        })
        .sort((a, b) => a.day - b.day); // 日付順にソート
      
      // 現在の日記のインデックスを見つける
      const currentIndex = monthPosts.findIndex(post => post.slug === slug);
      
      if (currentIndex > 0) {
        // 前の日記
        prevPost = {
          slug: monthPosts[currentIndex - 1].slug,
          title: monthPosts[currentIndex - 1].filename
        };
      }
      
      if (currentIndex < monthPosts.length - 1) {
        // 次の日記
        nextPost = {
          slug: monthPosts[currentIndex + 1].slug,
          title: monthPosts[currentIndex + 1].filename
        };
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