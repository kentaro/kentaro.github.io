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
        description="栗林健太郎の日記。日々の活動や考えを記録しています。"
      />
      
      <div className="page-header bg-gradient-to-br from-accent1/10 to-accent2/10 py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-center">日記</h1>
          <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
            日々の活動や考えを記録しています。最新の10件を表示しています。
          </p>
        </div>
      </div>
      
      <div className="py-12">
        <PostList 
          posts={posts}
          emptyMessage="日記はまだありません"
          limit={10} // 直近10日分のみ表示
          hideDate={true} // 日付を表示しない
        />
      </div>
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