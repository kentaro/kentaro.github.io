import type { GetStaticProps } from 'next';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import PostList from '@/components/content/PostList';

type JournalPageProps = {
  posts: {
    slug: string;
    title: string;
    date?: string;
    excerpt?: string;
  }[];
};

export default function JournalPage({ posts }: JournalPageProps) {
  return (
    <Layout>
      <SEO 
        title="日記"
        description="日記の一覧"
      />
      
      <h1 className="category-title">日記</h1>
      
      <PostList 
        posts={posts}
        emptyMessage="日記はまだありません"
        limit={10} // 直近10日分のみ表示
        hideDate={true} // 日記の一覧では日付を表示しない
      />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // journalディレクトリ内のマークダウンファイルを取得
  const allFiles = getAllMarkdownFiles();
  const journalPostsPromises = allFiles
    .filter(({ slug }) => slug.startsWith('journal/'))
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
  
  const posts = await Promise.all(journalPostsPromises);

  return {
    props: {
      posts,
    },
  };
}; 